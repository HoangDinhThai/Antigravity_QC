const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const path = require('path');
const dns = require('dns');

// Prioritize IPv4 resolution to avoid timeouts on networks where IPv6 is configured but not routed
// if (dns.setDefaultResultOrder) {
//   dns.setDefaultResultOrder('ipv4first');
// }


// Helper to make HTTPS requests with timeout and retries to handle round-robin DNS IP blocks
function makeRequest(url, options = {}, postData = null, retries = 5) {
  return new Promise((resolve, reject) => {
    const attemptRequest = (remainingRetries) => {
      // Set a 30-second connection/response timeout
      const mergedOptions = { ...options, timeout: 30000 };
      const req = https.request(url, mergedOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({ statusCode: res.statusCode, body });
        });
      });

      req.on('timeout', () => {
        req.destroy(new Error('ETIMEDOUT'));
      });

      req.on('error', (err) => {
        const isTimeout = err.code === 'ETIMEDOUT' || err.message === 'ETIMEDOUT' || err.code === 'ECONNRESET';
        if (remainingRetries > 0 && isTimeout) {
          console.warn(`Connection to ${url} failed/timed out (${err.message}). Retrying in 1s... (${remainingRetries} retries left)`);
          setTimeout(() => {
            attemptRequest(remainingRetries - 1);
          }, 1000);
        } else {
          reject(err);
        }
      });

      if (postData) {
        req.write(postData);
      }
      req.end();
    };

    attemptRequest(retries);
  });
}

// Google Auth JWT token generator
async function getGoogleToken(creds) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: creds.token_uri,
    exp: now + 3600,
    iat: now
  };

  const base64url = (obj) => Buffer.from(JSON.stringify(obj))
    .toString('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const signatureInput = `${base64url(header)}.${base64url(claims)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signatureInput);
  const signature = sign.sign(creds.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;
  const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;

  const res = await makeRequest(creds.token_uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, postData);

  const response = JSON.parse(res.body);
  if (response.error) {
    throw new Error('Google auth failed: ' + JSON.stringify(response));
  }
  return response.access_token;
}

// Fetch all Backlog issues (with pagination)
async function fetchBacklogIssues(apiKey, domain, projectId, issueTypeId, createdSince, createdUntil) {
  let issues = [];
  let offset = 0;
  const count = 100;

  while (true) {
    let url = `https://${domain}/api/v2/issues?apiKey=${apiKey}&projectId[]=${projectId}&issueTypeId[]=${issueTypeId}&createdSince=${createdSince}&count=${count}&offset=${offset}`;
    if (createdUntil) {
      url += `&createdUntil=${createdUntil}`;
    }
    console.log(`Fetching Backlog issues from offset ${offset}...`);
    const res = await makeRequest(url);
    if (res.statusCode !== 200) {
      throw new Error(`Failed to fetch Backlog issues: status ${res.statusCode}, body: ${res.body}`);
    }
    const data = JSON.parse(res.body);
    issues = issues.concat(data);
    console.log(`Retrieved ${data.length} issues.`);
    if (data.length < count) {
      break;
    }
    offset += count;
  }
  return issues;
}

// Format date to D/M/YYYY
function formatSheetDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Extract custom field value helper
function getCustomFieldValue(issue, id, typeId) {
  if (!id || !issue.customFields) return '';
  const cf = issue.customFields.find(f => f.id === id);
  if (!cf) return '';
  if (typeId === 6) { // list type
    if (!cf.value) return '';
    if (Array.isArray(cf.value)) {
      return cf.value.map(v => v.name).join(', ');
    }
    return cf.value.name || '';
  }
  if (typeId === 2) { // text type
    return cf.value || '';
  }
  return cf.value || '';
}

// Extract Google Sheet ID from URL or return string directly
function extractSpreadsheetId(input) {
  if (!input) return null;
  if (input.includes('docs.google.com/spreadsheets')) {
    const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : input;
  }
  return input;
}

function parseArgs() {
  const args = {};
  const rawArgs = process.argv.slice(2);
  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i].startsWith('--')) {
      const key = rawArgs[i].slice(2);
      const val = rawArgs[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function run() {
  try {
    const args = parseArgs();

    // Validate required arguments
    const projectKey = args.project;
    const startDate = args.start;
    const endDate = args.end; // Optional createdUntil
    const sheetParam = args.sheet;
    const tabName = args.tab || 'Summary';

    if (!projectKey || !startDate || !sheetParam) {
      console.error('Usage: node export_bugs.js --project <projectKey> --start <startDate> [--end <endDate>] --sheet <sheetUrlOrId> [--tab <tabName>]');
      process.exit(1);
    }

    const spreadsheetId = extractSpreadsheetId(sheetParam);

    // Resolve credentials
    const credsPath = args.creds || 'C:/Users/minh.nguyen/Documents/mcp-minhnt97-1a99840a5f64.json';
    if (!fs.existsSync(credsPath)) {
      console.error(`Google credentials file not found at: ${credsPath}`);
      process.exit(1);
    }
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));

    // Backlog credentials from env or fallback to provided defaults
    const backlogApiKey = process.env.BACKLOG_API_KEY || 'l9KKEZfJVpJfRYSXbS4w8inL2htkQa9hCvfpjI83Umo9zf5MR97KvPHngAw9p29R';
    const backlogDomain = process.env.BACKLOG_DOMAIN || 'piragovn.backlog.com';

    // Fetch project ID and issue types
    console.log(`Resolving project info for key: ${projectKey}...`);
    const projectUrl = `https://${backlogDomain}/api/v2/projects/${projectKey}?apiKey=${backlogApiKey}`;
    const projectRes = await makeRequest(projectUrl);
    if (projectRes.statusCode !== 200) {
      throw new Error(`Failed to get Backlog project info: status ${projectRes.statusCode}, body: ${projectRes.body}`);
    }
    const projectInfo = JSON.parse(projectRes.body);
    const projectId = projectInfo.id;
    console.log(`Found Project ID: ${projectId}`);

    // Resolve Bug Issue Type ID
    const typesUrl = `https://${backlogDomain}/api/v2/projects/${projectId}/issueTypes?apiKey=${backlogApiKey}`;
    const typesRes = await makeRequest(typesUrl);
    if (typesRes.statusCode !== 200) {
      throw new Error(`Failed to fetch issue types: status ${typesRes.statusCode}`);
    }
    const issueTypes = JSON.parse(typesRes.body);
    const bugType = issueTypes.find(t => t.name.toLowerCase() === 'bug' || t.name.toLowerCase() === 'lỗi');
    if (!bugType) {
      throw new Error(`Could not find 'Bug' or 'Lỗi' issue type in project ${projectKey}`);
    }
    const issueTypeId = bugType.id;
    console.log(`Found Bug Issue Type ID: ${issueTypeId}`);

    // Fetch custom fields to map IDs dynamically
    console.log(`Fetching custom fields for project key: ${projectKey}...`);
    const fieldsUrl = `https://${backlogDomain}/api/v2/projects/${projectId}/customFields?apiKey=${backlogApiKey}`;
    const fieldsRes = await makeRequest(fieldsUrl);
    if (fieldsRes.statusCode !== 200) {
      throw new Error(`Failed to fetch custom fields: status ${fieldsRes.statusCode}`);
    }
    const customFields = JSON.parse(fieldsRes.body);
    const fieldMap = {};
    customFields.forEach(f => {
      fieldMap[f.name.toLowerCase().trim()] = f.id;
    });

    // 1. Fetch Backlog Issues
    console.log(`Fetching Backlog bugs from ${startDate}${endDate ? ' to ' + endDate : ''}...`);
    const backlogIssues = await fetchBacklogIssues(backlogApiKey, backlogDomain, projectId, issueTypeId, startDate, endDate);
    console.log(`Fetched ${backlogIssues.length} issues from Backlog.`);

    // 2. Authenticate Google Sheets
    console.log('Authenticating with Google Sheets...');
    const googleToken = await getGoogleToken(creds);
    console.log('Successfully authenticated.');

    // 3. Format backlog issues into sheet rows
    const rowsToAppend = backlogIssues.map(issue => {
      const no = issue.issueKey.trim();
      const bugName = issue.summary || '';
      const bugDesc = issue.description || '';
      const createDate = formatSheetDate(issue.created);
      const phase = (issue.milestone && issue.milestone.length > 0) ? issue.milestone.map(m => m.name).join(', ') : ((issue.versions && issue.versions.length > 0) ? issue.versions.map(v => v.name).join(', ') : '');
      const bugType = getCustomFieldValue(issue, fieldMap['bug type'], 6);
      const bugSeverity = getCustomFieldValue(issue, fieldMap['bug severity'], 6);
      const bugPriority = issue.priority ? issue.priority.name : '';
      const phaseDetected = getCustomFieldValue(issue, fieldMap['phase detected'], 6);
      const tester = issue.createdUser ? issue.createdUser.name : '';
      const status = issue.status ? issue.status.name : '';
      const assignee = issue.assignee ? issue.assignee.name : '';
      const bugCause = getCustomFieldValue(issue, fieldMap['bug cause'], 6);
      const phaseInjected = getCustomFieldValue(issue, fieldMap['phase injected'], 6);
      const causeDesc = getCustomFieldValue(issue, fieldMap['cause description'], 2);
      const howToFix = getCustomFieldValue(issue, fieldMap['how to fix'], 2);
      
      return [
        no, bugName, bugDesc, createDate, phase, bugType, bugSeverity, bugPriority,
        phaseDetected, tester, status, assignee, bugCause, phaseInjected, causeDesc, howToFix,
        '' // Note
      ];
    });

    if (rowsToAppend.length === 0) {
      console.log('No Backlog issues found to append.');
      process.exit(0);
    }

    // Write range starts at the first empty row using Google Sheets append API.
    const writeRange = encodeURIComponent(`${tabName}!A7:Q`);
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${writeRange}:append?valueInputOption=USER_ENTERED`;
    
    const payload = JSON.stringify({
      range: `${tabName}!A7:Q`,
      majorDimension: 'ROWS',
      values: rowsToAppend
    });

    console.log(`Appending ${rowsToAppend.length} rows to ${tabName}...`);
    const writeRes = await makeRequest(writeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, payload);

    if (writeRes.statusCode !== 200) {
      throw new Error(`Failed to write to sheet: status ${writeRes.statusCode}, body: ${writeRes.body}`);
    }

    console.log('Successfully appended new Backlog bugs to Google Sheet!');
    console.log('Append completed successfully.');
  } catch (error) {
    console.error('Error during synchronization:', error);
    process.exit(1);
  }
}

run();
