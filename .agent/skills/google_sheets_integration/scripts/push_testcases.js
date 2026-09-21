const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// 1. Helper function làm sạch chuỗi Markdown
function cleanMarkdown(text) {
  if (!text) return '';
  let str = text;
  // Chuyển các thẻ <br> thành newline
  str = str.replace(/<br\s*\/?>/gi, '\n');
  // Chuyển các mũi tên -> thành newline
  str = str.replace(/\s*->\s*/g, '\n');
  // Bóc bold, italic, code
  str = str.replace(/\*\*/g, '');
  str = str.replace(/\*/g, '');
  str = str.replace(/`/g, '');
  str = str.replace(/\\\|/g, '|');
  return str.trim();
}

// 2. Chuẩn hóa Priority
function normalizePriority(raw) {
  if (!raw) return 'Normal';
  const clean = raw.trim().toLowerCase();
  if (clean === 'critical' || clean === 'high') return 'High';
  if (clean === 'medium' || clean === 'normal') return 'Normal';
  if (clean === 'low') return 'Low';
  return raw.trim();
}

// 3. Trích xuất Spreadsheet ID và GID từ URL
function parseSheetUrl(url) {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) throw new Error(`Không tìm thấy Spreadsheet ID trong URL: ${url}`);
  const spreadsheetId = idMatch[1];
  const gidMatch = url.match(/gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return { spreadsheetId, gid };
}

// 4. Bóc tách bảng Markdown testcase chuẩn
function parseMarkdownTestCases(mdContent) {
  const lines = mdContent.split('\n');
  const tables = [];
  let currentTable = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      currentTable.push(trimmed);
    } else {
      if (currentTable.length > 0) {
        tables.push(currentTable);
        currentTable = [];
      }
    }
  }
  if (currentTable.length > 0) tables.push(currentTable);

  if (tables.length === 0) {
    throw new Error("Không tìm thấy bảng Markdown nào trong nội dung đầu vào.");
  }

  // Tìm bảng chứa cột TC ID trong hàng đầu tiên
  let targetTable = tables.find(t => {
    const firstRow = t[0].toLowerCase();
    return firstRow.includes('tc id') || firstRow.includes('mã tc') || firstRow.includes('test case');
  });

  if (!targetTable) {
    targetTable = tables[tables.length - 1]; // fallback về bảng cuối cùng
  }

  const tableLines = targetTable;

  const rawRows = tableLines.map(line => {
    const parts = line.split('|');
    return parts.slice(1, parts.length - 1).map(c => c.trim());
  });

  // Lọc bỏ dòng phân cách dạng |:---|:---|
  const validRows = rawRows.filter(row => !row.every(cell => /^[-:\s]+$/.test(cell)));
  if (validRows.length < 2) {
    throw new Error("Bảng Markdown phải có ít nhất 1 hàng tiêu đề và 1 hàng dữ liệu.");
  }

  const headerRow = validRows[0];
  const headerLower = headerRow.map(h => h.toLowerCase());

  // Tìm index của các cột trong header (duyệt keywords trước để ưu tiên từ khóa chính xác nhất)
  const findCol = (keywords, excludeIndex = -1) => {
    for (const kw of keywords) {
      for (let i = 0; i < headerLower.length; i++) {
        if (i !== excludeIndex && headerLower[i].includes(kw)) return i;
      }
    }
    return -1;
  };

  const colTcId = findCol(['tc id', 'mã tc', 'id']);
  const colTitle1 = findCol(['title 1', 'feature', 'chức năng', 'tính năng', 'phân hệ', 'module']);
  const colTitle2 = findCol(['title 2', 'test scenario', 'kịch bản', 'tiêu đề', 'mô tả', 'title'], colTitle1);
  const colPre = findCol(['pre-condition', 'precondition', 'tiền điều kiện', 'điều kiện']);
  const colSteps = findCol(['test steps', 'bước thực hiện', 'các bước', 'steps', 'step']);
  const colData = findCol(['test data', 'dữ liệu test', 'dữ liệu', 'data']);
  const colExp = findCol(['expected result', 'kết quả mong đợi', 'kết quả', 'expected']);
  const colPriority = findCol(['priority', 'độ ưu tiên', 'mức độ ưu tiên']);

  const testCases = [];
  const dataRows = validRows.slice(1);

  for (const r of dataRows) {
    if (r.length < 5 || (r[0] && r[0].toLowerCase().includes('tc id'))) continue;

    const tcId = colTcId !== -1 && r[colTcId] ? cleanMarkdown(r[colTcId]) : '';
    const title1 = colTitle1 !== -1 && r[colTitle1] ? cleanMarkdown(r[colTitle1]) : '';
    const title2 = colTitle2 !== -1 && r[colTitle2] ? cleanMarkdown(r[colTitle2]) : '';
    const pre = colPre !== -1 && r[colPre] ? cleanMarkdown(r[colPre]) : '';
    const steps = colSteps !== -1 && r[colSteps] ? cleanMarkdown(r[colSteps]) : '';
    const data = colData !== -1 && r[colData] ? cleanMarkdown(r[colData]) : '';
    const exp = colExp !== -1 && r[colExp] ? cleanMarkdown(r[colExp]) : '';
    const priority = colPriority !== -1 && r[colPriority] ? normalizePriority(r[colPriority]) : 'Normal';

    // Bỏ qua nếu dòng rỗng hoặc không có nội dung test
    if (!title1 && !title2 && !steps && !exp) continue;

    testCases.push({
      tcId,
      feature: title1,
      title: title2 || title1,
      preCondition: pre,
      steps,
      testData: data,
      expectedResult: exp,
      priority
    });
  }

  return testCases;
}

// 5. Hàm chính
async function main() {
  const args = process.argv.slice(2);
  let url = '', filePath = '', content = '', moduleName = '', testerName = 'ThaiHD';
  let overwrite = false, customStartRow = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[i + 1];
    if (args[i] === '--file' && args[i + 1]) filePath = args[i + 1];
    if (args[i] === '--content' && args[i + 1]) content = args[i + 1];
    if (args[i] === '--module' && args[i + 1]) moduleName = args[i + 1];
    if (args[i] === '--tester' && args[i + 1]) testerName = args[i + 1];
    if (args[i] === '--overwrite') overwrite = true;
    if (args[i] === '--start-row' && args[i + 1]) customStartRow = parseInt(args[i + 1], 10);
  }

  if (!url || (!filePath && !content)) {
    console.error("Cách sử dụng:");
    console.error("  node push_testcases.js --url <url> --file <đường_dẫn_file_md> [--module <tên_module>] [--tester <mã_tester>] [--overwrite] [--start-row <số_dòng>]");
    console.error("  node push_testcases.js --url <url> --content <chuỗi_markdown> [--module <tên_module>] [--tester <mã_tester>] [--overwrite] [--start-row <số_dòng>]");
    process.exit(1);
  }

  const mdContent = filePath ? fs.readFileSync(filePath, 'utf8') : content;
  const testCases = parseMarkdownTestCases(mdContent);
  console.log(`Đã trích xuất thành công ${testCases.length} kịch bản kiểm thử từ Markdown.`);

  const { spreadsheetId, gid } = parseSheetUrl(url);
  console.log(`Spreadsheet ID: ${spreadsheetId}, GID: ${gid}`);

  // Tìm file credentials
  const credsPath = path.join(__dirname, '..', 'credentials', 'service_account.json');
  if (!fs.existsSync(credsPath)) {
    console.error(`Không tìm thấy file credentials tại: ${credsPath}`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  // 6. Lấy metadata của spreadsheet để tìm sheetTitle khớp với GID
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetList = spreadsheet.data.sheets || [];

  let targetSheet = sheetList.find(s => String(s.properties.sheetId) === String(gid));
  if (!targetSheet) {
    console.warn(`Không tìm thấy tab có GID=${gid}, sử dụng tab đầu tiên: '${sheetList[0].properties.title}'`);
    targetSheet = sheetList[0];
  }

  let targetSheetTitle = targetSheet.properties.title;
  const targetSheetId = targetSheet.properties.sheetId;
  console.log(`Tab mục tiêu ban đầu: "${targetSheetTitle}" (Sheet ID: ${targetSheetId})`);

  // Tự động suy ra tên module nếu chưa được truyền qua --module
  if (!moduleName) {
    // 1. Thử lấy từ tiêu đề cấp 1 (# ...) trong file markdown
    const headingMatch = mdContent.match(/^#\s+(?:Test Cases?\s*[-:]*\s*)?(.*)$/m);
    if (headingMatch && headingMatch[1].trim()) {
      moduleName = headingMatch[1].trim();
    } else if (testCases.length > 0 && testCases[0].feature) {
      // 2. Thử lấy từ Feature của test case đầu tiên
      moduleName = testCases[0].feature;
    }
  }

  // Đổi tên tab sheet thành tên module nếu có moduleName và tên khác hiện tại
  if (moduleName && targetSheetTitle !== moduleName) {
    console.log(`Đang đổi tên tab từ "${targetSheetTitle}" thành "${moduleName}"...`);
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            updateSheetProperties: {
              properties: {
                sheetId: targetSheetId,
                title: moduleName
              },
              fields: 'title'
            }
          }]
        }
      });
      console.log(`Đã đổi tên tab thành công sang: "${moduleName}"!`);
      targetSheetTitle = moduleName;
    } catch (renameErr) {
      console.warn(`Cảnh báo: Không thể đổi tên tab thành "${moduleName}": ${renameErr.message}`);
    }
  }

  // 7. Giải phóng Unmerge vùng dữ liệu từ dòng 11 trở xuống nếu có
  if (targetSheet.merges) {
    const dataMerges = targetSheet.merges.filter(m => m.startRowIndex >= 10);
    if (dataMerges.length > 0) {
      console.log(`Phát hiện ${dataMerges.length} dải ô bị merge trong vùng dữ liệu. Đang tiến hành unmerge...`);
      const unmergeRequests = dataMerges.map(m => ({
        unmergeCells: {
          range: {
            sheetId: targetSheetId,
            startRowIndex: m.startRowIndex,
            endRowIndex: m.endRowIndex,
            startColumnIndex: m.startColumnIndex,
            endColumnIndex: m.endColumnIndex
          }
        }
      }));
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: unmergeRequests }
      });
      console.log("Đã unmerge thành công các dải ô bị merge!");
    }
  }

  // 8. Đọc các dòng từ A11 đến O100 để xác định dòng tiêu đề và dòng bắt đầu ghi
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${targetSheetTitle}'!A11:O30`
  });

  let startRowIndex = customStartRow || 12; // Mặc định ghi từ dòng 12 (sau header dòng 11)
  let nextSTT = 1;

  if (overwrite) {
    console.log(`Chế độ GHI ĐÈ (--overwrite): Đang xóa sạch dữ liệu cũ từ '${targetSheetTitle}'!A12:O...`);
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${targetSheetTitle}'!A12:O`
    });
    startRowIndex = customStartRow || 12;
    nextSTT = 1;
    console.log(`Đã làm sạch sheet. Bắt đầu ghi mới từ dòng ${startRowIndex}, STT bắt đầu từ 1.`);
  } else if (!customStartRow) {
    // Kiểm tra dữ liệu hiện có để tìm dòng trống đầu tiên nếu ghi tiếp
    const allDataCheck = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${targetSheetTitle}'!A12:A2000`
    });

    const existingRows = allDataCheck.data.values || [];

    if (existingRows.length > 0) {
      let lastFilledRowOffset = -1;
      for (let i = existingRows.length - 1; i >= 0; i--) {
        if (existingRows[i] && existingRows[i][0] && existingRows[i][0].trim() !== '') {
          lastFilledRowOffset = i;
          const parsedNum = parseInt(existingRows[i][0].trim(), 10);
          if (!isNaN(parsedNum)) nextSTT = parsedNum + 1;
          break;
        }
      }
      if (lastFilledRowOffset !== -1) {
        startRowIndex = 12 + lastFilledRowOffset + 1;
        console.log(`Sheet đã có dữ liệu. Sẽ ghi nối tiếp từ dòng ${startRowIndex}, STT bắt đầu từ ${nextSTT}.`);
      }
    }
  }

  // 9. Chuẩn bị 15 cột A-O chuẩn VNTEST cho từng dòng
  const preparedRows = [];
  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    const currentSTT = nextSTT + idx;
    const isFirstRow = (idx === 0);

    // Col B: Module (chỉ điền ở dòng đầu tiên, các dòng sau để trống "")
    const colModule = isFirstRow ? (moduleName || targetSheetTitle) : "";
    // Col M: Tester (chỉ điền ở dòng đầu tiên)
    const colTester = isFirstRow ? testerName : "";

    const row = [
      String(currentSTT),         // Col A: No. ID
      colModule,                  // Col B: Module
      tc.feature,                 // Col C: Feature
      tc.title,                   // Col D: Test Case Title_1
      "",                         // Col E: Test Case Title_2
      tc.preCondition,            // Col F: Pre-Condition
      tc.steps,                   // Col G: Steps (đã chuyển -> và <br> thành \n)
      tc.testData,                // Col H: Test Data (đã chuyển <br> thành \n)
      tc.expectedResult,          // Col I: Expected Result (đã chuyển <br> thành \n)
      tc.priority,                // Col J: Priority (High, Normal, Low)
      "UnTest",                   // Col K: Web
      "",                         // Col L: Bug_ID
      colTester,                  // Col M: Tester
      "",                         // Col N: Test Date
      tc.tcId                     // Col O: Comments (chứa mã TC ID)
    ];

    preparedRows.push(row);
  }

  // 9.1. Tự động kiểm tra và mở rộng số dòng của sheet nếu dữ liệu vượt quá rowCount
  const currentMaxRows = targetSheet.properties.gridProperties ? targetSheet.properties.gridProperties.rowCount : 1000;
  const neededRows = startRowIndex + preparedRows.length + 10;
  if (neededRows > currentMaxRows) {
    const addRows = (neededRows - currentMaxRows) + 50;
    console.log(`Sheet chỉ có ${currentMaxRows} dòng. Cần tối thiểu ${neededRows} dòng. Đang mở rộng thêm ${addRows} dòng...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          appendDimension: {
            sheetId: targetSheetId,
            dimension: 'ROWS',
            length: addRows
          }
        }]
      }
    });
    console.log(`Đã mở rộng sheet thành công lên ${currentMaxRows + addRows} dòng.`);
  }

  // 10. Ghi dữ liệu theo Batch (30-50 dòng/batch để tối ưu tốc độ và an toàn)
  const BATCH_SIZE = 40;
  let currentRow = startRowIndex;
  let totalUpdated = 0;

  console.log(`Đang đẩy ${preparedRows.length} dòng dữ liệu lên '${targetSheetTitle}' từ dòng ${startRowIndex}...`);

  for (let b = 0; b < preparedRows.length; b += BATCH_SIZE) {
    const batchRows = preparedRows.slice(b, b + BATCH_SIZE);
    const endRow = currentRow + batchRows.length - 1;
    const range = `'${targetSheetTitle}'!A${currentRow}:O${endRow}`;

    const res = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: batchRows }
    });

    totalUpdated += (res.data.updatedRows || batchRows.length);
    console.log(`  -> Đã cập nhật xong dải: ${range} (${batchRows.length} dòng)`);
    currentRow = endRow + 1;
  }

  console.log(`\n🎉 Hoàn thành xuất sắc! Đã đẩy thành công tổng cộng ${totalUpdated} test cases lên Google Sheets.`);
}

main().catch(err => {
  console.error("Lỗi thực thi:", err);
  process.exit(1);
});
