/**
 * update_sheet_results.js
 *
 * Cập nhật kết quả kiểm thử (Passed / Failed / UnTest), Bug ID và Test Date
 * trực tiếp lên Google Sheets dự án VNTEST theo chuẩn 15 cột A-O.
 *
 * Các cột được cập nhật:
 * - Cột K (Web): "Passed" | "Failed" | "UnTest" (Bảo toàn Smart Canvas Dropdown Chip trên nền trắng #FFFFFF)
 * - Cột L (Bug_ID): Mã Bug (ví dụ: "196_VNTEST_LIMS-919") khi Failed, hoặc để trống khi Passed
 * - Cột N (Test Date): Ngày test thực tế định dạng DD/MM/YYYY (ví dụ: "05/11/2026")
 *
 * LƯU Ý QUAN TRỌNG:
 * - Cột M (Tester) thường được merge dọc toàn bộ cột, nên script cập nhật riêng lẻ K, L, N để không ảnh hưởng merge Col M.
 * - KHÔNG đụng đến Data Validation và KHÔNG dùng Conditional Formatting để giữ nguyên 100% Dropdown Chip gốc.
 */

const fs = require('fs');
const path = require('path');

// 1. Tải thư viện googleapis một cách linh động
let google;
try {
  google = require('googleapis').google;
} catch (e) {
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'google_sheets_integration', 'node_modules', 'googleapis'),
    path.join(__dirname, '..', '..', '..', 'google_sheets_integration', 'node_modules', 'googleapis'),
    path.join(process.cwd(), 'scratch', 'node_modules', 'googleapis'),
    path.join(process.cwd(), '.agent', 'skills', 'google_sheets_integration', 'node_modules', 'googleapis'),
    path.join(process.cwd(), 'scratch', 'git_sync', '.agent', 'skills', 'google_sheets_integration', 'node_modules', 'googleapis'),
    path.join(__dirname, '..', '..', '..', '..', 'scratch', 'git_sync', '.agent', 'skills', 'google_sheets_integration', 'node_modules', 'googleapis')
  ];
  for (const p of candidatePaths) {
    try {
      google = require(p).google;
      if (google) break;
    } catch (_) {}
  }
}

if (!google) {
  console.error("LỖI: Không tìm thấy thư viện 'googleapis'. Vui lòng kiểm tra node_modules.");
  process.exit(1);
}

// 2. Tìm credentials
function getCredentialsPath() {
  const candidates = [
    path.join(__dirname, '..', '..', 'google_sheets_integration', 'credentials', 'service_account.json'),
    path.join(process.cwd(), '.agent', 'skills', 'google_sheets_integration', 'credentials', 'service_account.json'),
    path.join(process.cwd(), 'scratch', 'git_sync', '.agent', 'skills', 'google_sheets_integration', 'credentials', 'service_account.json'),
    path.join(__dirname, '..', '..', '..', 'google_sheets_integration', 'credentials', 'service_account.json'),
    path.join(__dirname, '..', '..', '..', '..', 'scratch', 'git_sync', '.agent', 'skills', 'google_sheets_integration', 'credentials', 'service_account.json')
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 3. Trích xuất Spreadsheet ID
function parseSpreadsheetId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error(`Không tìm thấy Spreadsheet ID trong URL: ${url}`);
  return match[1];
}

// 4. Trích xuất gid từ URL (nếu có)
function parseGid(url) {
  const match = url.match(/[#&]gid=([0-9]+)/);
  return match ? parseInt(match[1], 10) : null;
}

// 5. Lấy ngày hiện tại GMT+7 định dạng DD/MM/YYYY
function getTodayDateVN() {
  const now = new Date();
  // Điều chỉnh sang GMT+7
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const vnTime = new Date(utc + (7 * 3600000));
  const day = String(vnTime.getDate()).padStart(2, '0');
  const month = String(vnTime.getMonth() + 1).padStart(2, '0');
  const year = vnTime.getFullYear();
  return `${day}/${month}/${year}`;
}

// 6. Parse dải dòng từ chuỗi (ví dụ: "12,14-16" -> [12, 14, 15, 16])
function parseRowNumbers(input) {
  if (!input) return [];
  const parts = String(input).split(',');
  const rows = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
      if (!isNaN(start) && !isNaN(end)) {
        for (let r = Math.min(start, end); r <= Math.max(start, end); r++) {
          rows.push(r);
        }
      }
    } else {
      const r = parseInt(trimmed, 10);
      if (!isNaN(r)) rows.push(r);
    }
  }
  return [...new Set(rows)].sort((a, b) => a - b);
}

// Danh sách các sheet loại trừ (không phải sheet testcase)
const EXCLUDE_SHEETS = [
  'SUMMARY', 'REPORT', 'DASHBOARD', 'COVER', 'TEMPLATE', 'CONFIG', 'SETTING', 'DATA'
];

async function main() {
  const args = process.argv.slice(2);
  let url = '';
  let tabNameOrGid = '';
  let resultsArg = '';
  let resultsFile = '';
  let allPassed = false;
  let allStatus = '';
  let passRowsArg = '';
  let failRowsArg = '';
  let bugArg = '';
  let dateArg = '';
  let dryRun = false;
  let updateSummary = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) url = args[++i];
    else if (arg === '--tab' && args[i + 1]) tabNameOrGid = args[++i];
    else if (arg === '--results' && args[i + 1]) resultsArg = args[++i];
    else if (arg === '--results-file' && args[i + 1]) resultsFile = args[++i];
    else if (arg === '--all-passed') allPassed = true;
    else if (arg === '--all-status' && args[i + 1]) allStatus = args[++i];
    else if (arg === '--pass-rows' && args[i + 1]) passRowsArg = args[++i];
    else if (arg === '--fail-rows' && args[i + 1]) failRowsArg = args[++i];
    else if (arg === '--bug' && args[i + 1]) bugArg = args[++i];
    else if (arg === '--date' && args[i + 1]) dateArg = args[++i];
    else if (arg === '--dry-run') dryRun = true;
    else if (arg === '--update-summary') updateSummary = true;
  }

  if (!url) {
    console.log(`
CÁCH SỬ DỤNG:
  node update_sheet_results.js --url <URL_SHEET> [options]

TÙY CHỌN CHÍNH:
  --tab <tên_sheet_hoặc_gid>   Chỉ định tab (mặc định tự nhận qua gid trong URL hoặc tab testcase duy nhất)
  --date <DD/MM/YYYY>          Ngày test (mặc định: ngày hiện tại GMT+7, ví dụ: 05/11/2026)
  --dry-run                    Xem trước các dòng sẽ thay đổi dưới dạng bảng Markdown (chưa ghi)
  --update-summary             Tự động gọi update_summary.js sau khi cập nhật thành công

CÁC CÁCH TRUYỀN KẾT QUẢ:
  1. Đánh toàn bộ tab thành Passed:
     --all-passed

  2. Đánh theo danh sách dòng:
     --pass-rows 12,13,14 --fail-rows 15,16 --bug "196_VNTEST_LIMS-919"

  3. Truyền chuỗi JSON hoặc file JSON (--results hoặc --results-file):
     [
       { "id": "VNTEST_LIMS_GCT_TC_001", "status": "Passed" },
       { "id": "VNTEST_LIMS_GCT_TC_002", "status": "Failed", "bug": "196_VNTEST_LIMS-919" },
       { "row": 15, "status": "Passed" },
       { "title": "Xóa bộ chỉ tiêu", "status": "Failed", "bug": "196_VNTEST_LIMS-919" }
     ]
`);
    process.exit(1);
  }

  const testDate = dateArg || getTodayDateVN();
  const spreadsheetId = parseSpreadsheetId(url);
  const credsPath = getCredentialsPath();

  if (!credsPath) {
    console.error("LỖI: Không tìm thấy file credentials 'service_account.json'.");
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Đang kết nối tới Google Spreadsheet: ${spreadsheetId}...`);

  // 1. Lấy metadata của spreadsheet để tìm sheet đích
  const metaRes = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: 'sheets(properties(sheetId,title,gridProperties))'
  });
  const allSheets = metaRes.data.sheets || [];

  let targetSheet = null;
  const gidFromUrl = parseGid(url);

  if (tabNameOrGid) {
    // Tìm theo tên hoặc gid được chỉ định
    const isNum = /^\d+$/.test(tabNameOrGid);
    if (isNum) {
      const targetGid = parseInt(tabNameOrGid, 10);
      targetSheet = allSheets.find(s => s.properties.sheetId === targetGid);
    }
    if (!targetSheet) {
      // Tìm theo tên chính xác hoặc không phân biệt hoa thường
      targetSheet = allSheets.find(s => s.properties.title.toLowerCase() === tabNameOrGid.toLowerCase())
        || allSheets.find(s => s.properties.title.toLowerCase().includes(tabNameOrGid.toLowerCase()));
    }
  } else if (gidFromUrl !== null) {
    targetSheet = allSheets.find(s => s.properties.sheetId === gidFromUrl);
  }

  if (!targetSheet) {
    // Lọc các sheet khả dụng (loại trừ SUMMARY, CONFIG...)
    const candidateSheets = allSheets.filter(s => {
      const title = s.properties.title.trim().toUpperCase();
      return !EXCLUDE_SHEETS.some(ex => title.includes(ex));
    });

    if (candidateSheets.length === 1) {
      targetSheet = candidateSheets[0];
      console.log(`Tự động chọn tab testcase: "${targetSheet.properties.title}" (gid: ${targetSheet.properties.sheetId})`);
    } else {
      console.error(`\nLỖI: Chưa chọn tab hoặc không tìm thấy tab phù hợp.`);
      console.log(`Các tab hiện có trong bảng tính:`);
      allSheets.forEach(s => {
        console.log(` - "${s.properties.title}" (gid: ${s.properties.sheetId})`);
      });
      console.log(`Vui lòng thêm tham số --tab "<Tên tab>" hoặc cung cấp link có #gid=...`);
      process.exit(1);
    }
  }

  const sheetTitle = targetSheet.properties.title;
  const sheetId = targetSheet.properties.sheetId;
  const maxRows = targetSheet.properties.gridProperties ? targetSheet.properties.gridProperties.rowCount : 1000;

  console.log(`Đang làm việc trên tab: "${sheetTitle}" (gid: ${sheetId}, maxRows: ${maxRows})`);

  // 2. Đọc toàn bộ dữ liệu từ dòng 11 (Header) đến maxRows của các cột A-O
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetTitle}'!A11:O${maxRows}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });

  const rawRows = readRes.data.values || [];
  if (rawRows.length < 2) {
    console.error(`Tab "${sheetTitle}" không có đủ dữ liệu test case (bắt đầu từ dòng 12).`);
    process.exit(1);
  }

  // Parse các dòng dữ liệu (Dòng 11 là Header row -> index 0 trong rawRows)
  // Data bắt đầu từ dòng 12 (1-based sheet row = 12 -> rawRows index 1)
  const testcaseRows = [];
  for (let idx = 1; idx < rawRows.length; idx++) {
    const rowNum = 11 + idx; // Số dòng 1-based trên sheet
    const cols = rawRows[idx];
    if (!cols || cols.length === 0) continue;

    const stt = (cols[0] || '').trim();
    const moduleName = (cols[1] || '').trim();
    const feature = (cols[2] || '').trim();
    const title1 = (cols[3] || '').trim();
    const title2 = (cols[4] || '').trim();
    const pre = (cols[5] || '').trim();
    const steps = (cols[6] || '').trim();
    const testData = (cols[7] || '').trim();
    const expectedResult = (cols[8] || '').trim();
    const priority = (cols[9] || '').trim();
    const webStatus = (cols[10] || '').trim(); // Cột K
    const bugId = (cols[11] || '').trim();      // Cột L
    const tester = (cols[12] || '').trim();     // Cột M
    const testDateVal = (cols[13] || '').trim(); // Cột N
    const tcIdOrComment = (cols[14] || '').trim(); // Cột O

    // Tiêu chí nhận diện dòng testcase hợp lệ: Có STT hoặc có Title_1 hoặc có Title_2 hoặc có Steps
    if (stt || title1 || title2 || steps) {
      testcaseRows.push({
        rowNum,
        stt,
        moduleName,
        feature,
        title1,
        title2,
        priority,
        currentWeb: webStatus,
        currentBug: bugId,
        tester,
        currentDate: testDateVal,
        tcId: tcIdOrComment
      });
    }
  }

  console.log(`Tìm thấy ${testcaseRows.length} ca kiểm thử trong tab "${sheetTitle}".`);

  // 3. Phân tích kết quả cần cập nhật
  let parsedResults = [];

  if (resultsFile) {
    if (!fs.existsSync(resultsFile)) {
      console.error(`LỖI: Không tìm thấy file results tại: ${resultsFile}`);
      process.exit(1);
    }
    const content = fs.readFileSync(resultsFile, 'utf8');
    parsedResults = JSON.parse(content);
  } else if (resultsArg) {
    parsedResults = JSON.parse(resultsArg);
  }

  const passRows = parseRowNumbers(passRowsArg);
  const failRows = parseRowNumbers(failRowsArg);

  // Map rowNum -> update object
  const updatesMap = new Map();

  // 3.1. Nếu có --all-passed hoặc --all-status
  if (allPassed || allStatus) {
    const status = allPassed ? 'Passed' : allStatus;
    for (const tc of testcaseRows) {
      updatesMap.set(tc.rowNum, {
        status,
        bug: status === 'Passed' ? '' : (bugArg || tc.currentBug),
        date: testDate
      });
    }
  }

  // 3.2. Nếu có passRows / failRows
  for (const r of passRows) {
    updatesMap.set(r, {
      status: 'Passed',
      bug: '',
      date: testDate
    });
  }

  for (const r of failRows) {
    updatesMap.set(r, {
      status: 'Failed',
      bug: bugArg || '',
      date: testDate
    });
  }

  // 3.3. Nếu có danh sách parsedResults từ JSON
  for (const item of parsedResults) {
    let matchedRow = null;

    if (item.row) {
      matchedRow = parseInt(item.row, 10);
    } else if (item.id) {
      // Khớp theo TC ID (Col O) hoặc STT (Col A)
      const found = testcaseRows.find(tc => 
        tc.tcId.toLowerCase() === String(item.id).toLowerCase() ||
        tc.stt === String(item.id) ||
        tc.tcId.toLowerCase().includes(String(item.id).toLowerCase())
      );
      if (found) matchedRow = found.rowNum;
    } else if (item.title) {
      // Khớp theo Title_1 hoặc Title_2
      const query = String(item.title).toLowerCase().trim();
      const found = testcaseRows.find(tc =>
        tc.title2.toLowerCase().includes(query) ||
        tc.title1.toLowerCase().includes(query)
      );
      if (found) matchedRow = found.rowNum;
    }

    if (matchedRow) {
      const status = item.status || (item.passed ? 'Passed' : (item.failed ? 'Failed' : 'UnTest'));
      const bug = item.bug || item.bugId || (status === 'Failed' ? (bugArg || '') : '');
      updatesMap.set(matchedRow, {
        status,
        bug,
        date: item.date || testDate
      });
    } else {
      console.warn(`CẢNH BÁO: Không tìm thấy dòng test case khớp với: ${JSON.stringify(item)}`);
    }
  }

  if (updatesMap.size === 0) {
    console.error("LỖI: Không có test case nào được chỉ định để cập nhật!");
    console.log("Vui lòng sử dụng một trong các tùy chọn: --all-passed, --pass-rows, --fail-rows, --results, hoặc --results-file");
    process.exit(1);
  }

  // 4. Lập bảng so sánh (Preview changes)
  const changes = [];
  for (const [rNum, update] of updatesMap.entries()) {
    const existing = testcaseRows.find(tc => tc.rowNum === rNum);
    if (!existing) {
      console.warn(`CẢNH BÁO: Dòng ${rNum} không nằm trong dải test case hợp lệ của sheet. Bỏ qua.`);
      continue;
    }

    changes.push({
      row: rNum,
      stt: existing.stt,
      tcId: existing.tcId || `TC_${existing.stt}`,
      title1: existing.title1,
      title2: existing.title2,
      oldStatus: existing.currentWeb || '(trống)',
      newStatus: update.status,
      oldBug: existing.currentBug || '(trống)',
      newBug: update.bug || '',
      oldDate: existing.currentDate || '(trống)',
      newDate: update.date
    });
  }

  // Sắp xếp theo số dòng tăng dần
  changes.sort((a, b) => a.row - b.row);

  // In bảng Markdown preview
  console.log(`\n================ BẢNG XEM TRƯỚC THAY ĐỔI (PREVIEW) ================`);
  console.log(`| Dòng | STT / Mã TC | Title_1 | Title_2 | Trạng thái cũ ➔ MỚI (Col K) | Bug ID (Col L) | Test Date (Col N) |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);
  for (const c of changes) {
    const title = c.title2 || c.title1 || '';
    const arrowStatus = `${c.oldStatus} ➔ **${c.newStatus}**`;
    console.log(`| ${c.row} | ${c.tcId || c.stt} | ${c.title1} | ${c.title2 || '-'} | ${arrowStatus} | ${c.newBug || '-'} | ${c.newDate} |`);
  }
  console.log(`Tổng số ca kiểm thử sẽ cập nhật: ${changes.length}`);

  if (dryRun) {
    console.log(`\n[DRY-RUN]: Đã chạy xong ở chế độ kiểm tra. Không có thay đổi nào được ghi lên Google Sheets.`);
    process.exit(0);
  }

  // 5. Thực hiện ghi lên Google Sheets (Batch Update Values)
  console.log(`\nĐang ghi cập nhật lên Google Sheets tab "${sheetTitle}"...`);

  // Chuẩn bị các range cập nhật riêng lẻ cho Col K, Col L, Col N
  // Nhằm tuyệt đối KHÔNG đè lên Cột M (Tester) đang được gộp ô theo chiều dọc!
  const dataUpdates = [];

  for (const c of changes) {
    // 1. Cột K: Web Status
    dataUpdates.push({
      range: `'${sheetTitle}'!K${c.row}`,
      values: [[c.newStatus]]
    });
    // 2. Cột L: Bug ID
    dataUpdates.push({
      range: `'${sheetTitle}'!L${c.row}`,
      values: [[c.newBug]]
    });
    // 3. Cột N: Test Date
    dataUpdates.push({
      range: `'${sheetTitle}'!N${c.row}`,
      values: [[c.newDate]]
    });
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: dataUpdates
    }
  });

  console.log(`✅ CẬP NHẬT THÀNH CÔNG: Đã ghi ${changes.length} test cases vào tab "${sheetTitle}".`);
  console.log(`- Cột K (Web): Cập nhật trạng thái Passed/Failed/UnTest (bảo toàn Dropdown Chip)`);
  console.log(`- Cột L (Bug_ID): Cập nhật mã lỗi tương ứng`);
  console.log(`- Cột N (Test Date): Cập nhật ngày ${testDate}`);

  // 6. Tự động cập nhật sheet SUMMARY nếu được yêu cầu
  if (updateSummary) {
    console.log(`\nĐang đồng bộ lại trang tính SUMMARY...`);
    const summaryScriptPath = path.join(__dirname, '..', '..', 'google_sheets_integration', 'scripts', 'update_summary.js');
    if (fs.existsSync(summaryScriptPath)) {
      try {
        const { execSync } = require('child_process');
        execSync(`node "${summaryScriptPath}" --url "${url}"`, { stdio: 'inherit' });
        console.log(`✅ Đã đồng bộ xong số liệu trên trang tính SUMMARY.`);
      } catch (sumErr) {
        console.warn(`CẢNH BÁO: Không thể chạy update_summary.js: ${sumErr.message}`);
      }
    } else {
      console.warn(`Không tìm thấy file ${summaryScriptPath} để cập nhật SUMMARY.`);
    }
  }
}

main().catch(err => {
  console.error("LỖI XỬ LÝ:", err);
  process.exit(1);
});
