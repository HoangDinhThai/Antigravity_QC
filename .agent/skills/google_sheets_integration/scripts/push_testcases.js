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

// 1.1 Helper format giãn cách dòng giữa các mục đánh số (cho Steps, Expected Result)
function formatSpacedText(text) {
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

  // Tách dòng và loại bỏ dòng trắng thừa
  const lines = str.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return str.trim();

  // Nối các dòng bằng 2 dấu xuống dòng (\n\n) để tạo khoảng cách thoáng mắt giữa các mục
  return lines.join('\n\n');
}

// 1.2 Helper làm sạch tên Module (loại bỏ tiền tố số như "7.4. ", "01. ", "1.2. ")
function cleanModuleName(name) {
  if (!name) return '';
  return name.replace(/^[\s\d\.\-_:]+\s*/, '').trim() || name.trim();
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
  const colFeature = findCol(['feature', 'chức năng lớn', 'khối tính năng', 'phân hệ', 'module']);
  let colTitle1, colTitle2;

  if (colFeature !== -1) {
    // Có cột Feature riêng
    colTitle1 = findCol(['test case title_1', 'title 1', 'tiêu đề 1', 'test scenario', 'kịch bản', 'chủ đề'], colFeature);
    colTitle2 = findCol(['test case title_2', 'title 2', 'tiêu đề 2', 'test case', 'chi tiết', 'tiêu đề', 'mô tả'], colTitle1);
  } else {
    // Bảng cũ không có cột Feature riêng: Title 1 là Feature, Title 2 là kịch bản
    colTitle1 = findCol(['title 1', 'feature', 'chức năng', 'tính năng', 'phân hệ', 'module']);
    colTitle2 = findCol(['title 2', 'test scenario', 'kịch bản', 'tiêu đề', 'mô tả', 'title'], colTitle1);
  }

  const colPre = findCol(['pre-condition', 'precondition', 'tiền điều kiện', 'điều kiện']);
  const colSteps = findCol(['test steps', 'bước thực hiện', 'các bước', 'steps', 'step']);
  const colData = findCol(['test data', 'dữ liệu test', 'dữ liệu', 'data']);
  const colExp = findCol(['expected result', 'kết quả mong đợi', 'kết quả', 'expected']);
  const colPriority = findCol(['priority', 'độ ưu tiên', 'mức độ ưu tiên']);

  const testCases = [];
  const dataRows = validRows.slice(1);

  let currentFeature = '';
  let currentTitle1 = '';
  for (const r of dataRows) {
    if (r.length < 5 || (r[0] && r[0].toLowerCase().includes('tc id'))) continue;

    const tcId = colTcId !== -1 && r[colTcId] ? cleanMarkdown(r[colTcId]) : '';
    
    let rawFeature = '';
    let rawTitle1 = '';
    let rawTitle2 = '';

    if (colFeature !== -1) {
      rawFeature = r[colFeature] ? cleanMarkdown(r[colFeature]) : '';
      rawTitle1 = colTitle1 !== -1 && r[colTitle1] ? cleanMarkdown(r[colTitle1]) : '';
      rawTitle2 = colTitle2 !== -1 && r[colTitle2] ? cleanMarkdown(r[colTitle2]) : '';
    } else {
      // Bảng cũ: cột Title 1 chứa feature, cột Title 2 chứa kịch bản
      rawFeature = colTitle1 !== -1 && r[colTitle1] ? cleanMarkdown(r[colTitle1]) : '';
      const oldTitle2 = colTitle2 !== -1 && r[colTitle2] ? cleanMarkdown(r[colTitle2]) : '';
      if (oldTitle2.includes(' - ')) {
        const parts = oldTitle2.split(' - ');
        rawTitle1 = parts[0].trim();
        rawTitle2 = parts.slice(1).join(' - ').trim();
      } else {
        rawTitle1 = oldTitle2;
        rawTitle2 = '';
      }
    }

    if (rawFeature) {
      currentFeature = rawFeature;
      currentTitle1 = rawTitle1 || '';
    } else {
      rawFeature = currentFeature; // Kế thừa tên Feature từ dòng trước nếu để trống
      if (rawTitle1) {
        currentTitle1 = rawTitle1;
      } else {
        rawTitle1 = currentTitle1; // Kế thừa Title 1
      }
    }

    if (rawTitle2 && rawTitle1 && rawTitle2.trim().toLowerCase() === rawTitle1.trim().toLowerCase()) {
      rawTitle2 = '';
    }

    const pre = colPre !== -1 && r[colPre] ? cleanMarkdown(r[colPre]) : '';
    const steps = colSteps !== -1 && r[colSteps] ? formatSpacedText(r[colSteps]) : '';
    const data = colData !== -1 && r[colData] ? cleanMarkdown(r[colData]) : '';
    const exp = colExp !== -1 && r[colExp] ? formatSpacedText(r[colExp]) : '';
    const priority = colPriority !== -1 && r[colPriority] ? normalizePriority(r[colPriority]) : 'Normal';

    // Bỏ qua nếu dòng rỗng hoặc không có nội dung test
    if (!rawFeature && !rawTitle1 && !rawTitle2 && !steps && !exp) continue;

    testCases.push({
      tcId,
      feature: rawFeature,
      title1: rawTitle1,
      title2: rawTitle2,
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
  let overwrite = false, customStartRow = null, renameTab = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[i + 1];
    if (args[i] === '--file' && args[i + 1]) filePath = args[i + 1];
    if (args[i] === '--content' && args[i + 1]) content = args[i + 1];
    if (args[i] === '--module' && args[i + 1]) moduleName = args[i + 1];
    if (args[i] === '--tester' && args[i + 1]) testerName = args[i + 1];
    if (args[i] === '--overwrite') overwrite = true;
    if (args[i] === '--start-row' && args[i + 1]) customStartRow = parseInt(args[i + 1], 10);
    if (args[i] === '--rename-tab' && args[i + 1]) renameTab = args[i + 1];
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

  // Đổi tên tab sheet CHỈ KHI người dùng truyền rõ ràng --rename-tab
  if (renameTab && targetSheetTitle !== renameTab) {
    console.log(`Đang đổi tên tab từ "${targetSheetTitle}" thành "${renameTab}"...`);
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            updateSheetProperties: {
              properties: {
                sheetId: targetSheetId,
                title: renameTab
              },
              fields: 'title'
            }
          }]
        }
      });
      console.log(`Đã đổi tên tab thành công sang: "${renameTab}"!`);
      targetSheetTitle = renameTab;
    } catch (renameErr) {
      console.warn(`Cảnh báo: Không thể đổi tên tab thành "${renameTab}": ${renameErr.message}`);
    }
  }

  // Tên module cho Cột B: nếu không truyền thì mặc định lấy chính tên tab
  if (!moduleName) {
    moduleName = targetSheetTitle;
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

    // Col B: Module (chỉ điền ở dòng đầu tiên, các dòng sau để trống ""; CẤM chứa số thứ tự)
    const rawModule = moduleName || targetSheetTitle;
    const colModule = isFirstRow ? cleanModuleName(rawModule) : "";
    // Col M: Tester (chỉ điền ở dòng đầu tiên)
    const colTester = isFirstRow ? testerName : "";

    // Col C: Feature (chỉ điền ở dòng đầu của nhóm Feature, các dòng sau của cùng nhóm để trống "" để gộp ô sạch sẽ)
    const isNewFeature = (idx === 0 || tc.feature !== testCases[idx - 1].feature);
    const colFeature = isNewFeature ? tc.feature : "";

    // Col D: Test Case Title_1 (chỉ điền ở dòng đầu của nhóm Title_1 trong cùng Feature, các dòng sau để trống "" để gộp ô sạch sẽ)
    const isNewTitle1 = isNewFeature || (tc.title1 !== testCases[idx - 1].title1);
    const colTitle1 = isNewTitle1 ? tc.title1 : "";

    // Col E: Test Case Title_2 (kịch bản chi tiết, không lặp lại tiền tố của Title_1; nếu ca đơn lẻ trùng title1 thì để trống "")
    let colTitle2 = tc.title2 || (!tc.title1 ? (tc.title || "") : "");
    if (colTitle2 && tc.title1 && colTitle2.trim().toLowerCase() === tc.title1.trim().toLowerCase()) {
      colTitle2 = "";
    }

    const row = [
      String(currentSTT),         // Col A: No. ID
      colModule,                  // Col B: Module
      colFeature,                 // Col C: Feature
      colTitle1,                  // Col D: Test Case Title_1
      colTitle2,                  // Col E: Test Case Title_2
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

  // 11. Tự động Gộp ô (Merge) cột Feature (C) và Test Case Title_1 (D) & Định dạng chuẩn
  console.log("Đang tiến hành gom nhóm và gộp ô cho cột Feature và Test Case Title_1...");

  // 11.1 Gom nhóm Feature (Cột C)
  const featureBlocks = [];
  let currentBlock = null;

  for (let idx = 0; idx < testCases.length; idx++) {
    const fName = testCases[idx].feature || '';
    const currRow = startRowIndex + idx;

    if (!currentBlock || currentBlock.name !== fName) {
      if (currentBlock && currentBlock.name) {
        featureBlocks.push(currentBlock);
      }
      currentBlock = {
        name: fName,
        startRow: currRow,
        endRow: currRow
      };
    } else {
      currentBlock.endRow = currRow;
    }
  }
  if (currentBlock && currentBlock.name) {
    featureBlocks.push(currentBlock);
  }

  // 11.2 Gom nhóm Test Case Title_1 (Cột D) trong từng nhóm Feature
  const title1Blocks = [];
  let currentT1Block = null;

  for (let idx = 0; idx < testCases.length; idx++) {
    const fName = testCases[idx].feature || '';
    const t1Name = testCases[idx].title1 || '';
    const currRow = startRowIndex + idx;
    const groupKey = `${fName}:::${t1Name}`;

    if (!currentT1Block || currentT1Block.key !== groupKey) {
      if (currentT1Block && currentT1Block.name) {
        title1Blocks.push(currentT1Block);
      }
      currentT1Block = {
        key: groupKey,
        name: t1Name,
        startRow: currRow,
        endRow: currRow
      };
    } else {
      currentT1Block.endRow = currRow;
    }
  }
  if (currentT1Block && currentT1Block.name) {
    title1Blocks.push(currentT1Block);
  }

  const postRequests = [];

  // Tạo request merge cho cột Feature (Cột C, startColumnIndex: 2, endColumnIndex: 3)
  for (const block of featureBlocks) {
    if (block.endRow > block.startRow) {
      postRequests.push({
        mergeCells: {
          range: {
            sheetId: targetSheetId,
            startRowIndex: block.startRow - 1, // 0-based inclusive
            endRowIndex: block.endRow,         // 0-based exclusive
            startColumnIndex: 2,               // Column C
            endColumnIndex: 3
          },
          mergeType: 'MERGE_ALL'
        }
      });
    }
  }

  // Tạo request merge cho cột Test Case Title_1 (Cột D, startColumnIndex: 3, endColumnIndex: 4)
  for (const block of title1Blocks) {
    if (block.endRow > block.startRow) {
      postRequests.push({
        mergeCells: {
          range: {
            sheetId: targetSheetId,
            startRowIndex: block.startRow - 1,
            endRowIndex: block.endRow,
            startColumnIndex: 3,               // Column D
            endColumnIndex: 4
          },
          mergeType: 'MERGE_ALL'
        }
      });
    }
  }

  // Định dạng toàn bộ cột C từ startRowIndex đến startRowIndex + testCases.length - 1 (Center, Middle, Bold)
  const endDataRow = startRowIndex + testCases.length; // 0-based exclusive
  postRequests.push({
    repeatCell: {
      range: {
        sheetId: targetSheetId,
        startRowIndex: startRowIndex - 1,
        endRowIndex: endDataRow - 1,
        startColumnIndex: 2,
        endColumnIndex: 3
      },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
          textFormat: {
            fontFamily: 'Arial',
            fontSize: 10,
            bold: true
          }
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)'
    }
  });

  // Định dạng toàn bộ cột D từ startRowIndex đến startRowIndex + testCases.length - 1 (Left, Middle, Bold)
  postRequests.push({
    repeatCell: {
      range: {
        sheetId: targetSheetId,
        startRowIndex: startRowIndex - 1,
        endRowIndex: endDataRow - 1,
        startColumnIndex: 3,
        endColumnIndex: 4
      },
      cell: {
        userEnteredFormat: {
          horizontalAlignment: 'LEFT',
          verticalAlignment: 'MIDDLE',
          wrapStrategy: 'WRAP',
          textFormat: {
            fontFamily: 'Arial',
            fontSize: 10,
            bold: true
          }
        }
      },
      fields: 'userEnteredFormat(horizontalAlignment,verticalAlignment,wrapStrategy,textFormat)'
    }
  });

  // Đóng khung viền rõ ràng cho cả cột C và cột D
  const borderStyle = {
    style: 'SOLID',
    width: 1,
    colorStyle: { rgbColor: { red: 0, green: 0, blue: 0 } }
  };
  postRequests.push({
    updateBorders: {
      range: {
        sheetId: targetSheetId,
        startRowIndex: startRowIndex - 1,
        endRowIndex: endDataRow - 1,
        startColumnIndex: 2,
        endColumnIndex: 4
      },
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      innerHorizontal: borderStyle,
      innerVertical: borderStyle
    }
  });

  if (postRequests.length > 0) {
    const fMergeCount = featureBlocks.filter(b => b.endRow > b.startRow).length;
    const t1MergeCount = title1Blocks.filter(b => b.endRow > b.startRow).length;
    console.log(`Đang thực hiện gộp ${fMergeCount} nhóm Feature, ${t1MergeCount} nhóm Title_1 và định dạng chuẩn cho cột Feature & Title_1...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: postRequests }
    });
    console.log("Đã gộp ô và định dạng cột Feature & Title_1 thành công!");
  }

  console.log(`\n🎉 Hoàn thành xuất sắc! Đã đẩy thành công tổng cộng ${totalUpdated} test cases lên Google Sheets.`);
}

main().catch(err => {
  console.error("Lỗi thực thi:", err);
  process.exit(1);
});
