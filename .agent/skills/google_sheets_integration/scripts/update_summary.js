const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Danh sách các sheet loại trừ (không phải sheet testcase)
const EXCLUDE_SHEETS = [
  'SUMMARY',
  'REPORT',
  'DASHBOARD',
  'COVER',
  'TEMPLATE',
  'CONFIG',
  'SETTING',
  'DATA'
];

function parseSpreadsheetId(url) {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error(`Không tìm thấy Spreadsheet ID trong URL: ${url}`);
  return match[1];
}

function colIndexToLetter(colIndex) {
  let temp, letter = '';
  let col = colIndex + 1;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    col = Math.floor((col - temp - 1) / 26);
  }
  return letter;
}

async function main() {
  const args = process.argv.slice(2);
  let url = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) url = args[i + 1];
  }

  if (!url) {
    console.error("Cách sử dụng:");
    console.error("  node update_summary.js --url <URL_GOOGLE_SHEET>");
    process.exit(1);
  }

  const spreadsheetId = parseSpreadsheetId(url);
  console.log(`Đang xử lý Spreadsheet ID: ${spreadsheetId}`);

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

  // 1. Lấy metadata của spreadsheet
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const allSheets = meta.data.sheets || [];

  // Tìm sheet SUMMARY
  const summarySheet = allSheets.find(s => {
    const title = s.properties.title.trim().toUpperCase();
    return title === 'SUMMARY' || title.includes('SUMMARY');
  });

  if (!summarySheet) {
    console.error("❌ Không tìm thấy tab sheet có tên 'SUMMARY' trong Google Sheets!");
    process.exit(1);
  }

  const summarySheetId = summarySheet.properties.sheetId;
  const summarySheetTitle = summarySheet.properties.title;
  console.log(`Đã tìm thấy trang Summary: "${summarySheetTitle}" (ID: ${summarySheetId})`);

  // Lọc danh sách sheet testcase
  const moduleSheets = allSheets.filter(s => {
    if (s.properties.hidden) return false;
    const title = s.properties.title.trim();
    const upper = title.toUpperCase();
    if (upper === summarySheetTitle.toUpperCase()) return false;
    if (upper.startsWith('COPY OF') || upper.startsWith('BẢN SAO')) return false;
    for (const ex of EXCLUDE_SHEETS) {
      if (upper === ex || upper.startsWith(ex + '_') || upper.startsWith(ex + ' ')) return false;
    }
    return true;
  });

  console.log(`Phát hiện ${moduleSheets.length} sheet testcase chức năng:`);
  moduleSheets.forEach((s, idx) => console.log(`  ${idx + 1}. ${s.properties.title}`));

  if (moduleSheets.length === 0) {
    console.log("Không có sheet chức năng nào để cập nhật.");
    return;
  }

  // 2. Nhận diện cột Web/Status của từng sheet dựa trên Header dòng 11
  const headerRanges = moduleSheets.map(s => `'${s.properties.title.replace(/'/g, "''")}'!A11:Q11`);
  const headerRes = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges: headerRanges
  });

  const sheetWebCols = [];
  (headerRes.data.valueRanges || []).forEach((vr, idx) => {
    const vals = vr.values?.[0] || [];
    let webIdx = -1;
    for (let c = 0; c < vals.length; c++) {
      const colName = String(vals[c] || '').trim().toLowerCase();
      if (['web', 'status', 'kết quả'].includes(colName)) {
        webIdx = c;
        break;
      }
    }
    // Mặc định là cột K (index 10) nếu không tìm thấy
    sheetWebCols.push(webIdx >= 0 ? colIndexToLetter(webIdx) : 'K');
  });

  const START_ROW = 14;
  const numModules = moduleSheets.length;

  // 3. Unmerge và xóa dữ liệu cũ
  console.log(`Đang làm sạch dữ liệu cũ từ dòng ${START_ROW} trên sheet '${summarySheetTitle}'...`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        unmergeCells: {
          range: {
            sheetId: summarySheetId,
            startRowIndex: START_ROW - 1,
            startColumnIndex: 1,
            endColumnIndex: 8
          }
        }
      }]
    }
  });

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${summarySheetTitle}'!B${START_ROW}:H200`
  });

  // 4. Chuẩn bị hàng dữ liệu và công thức
  const formulasAndValues = [];
  for (let i = 0; i < numModules; i++) {
    const s = moduleSheets[i];
    const sTitle = s.properties.title;
    const sId = s.properties.sheetId;
    const webCol = sheetWebCols[i];
    const row = START_ROW + i;
    const escapedName = sTitle.replace(/'/g, "''");

    const colNo = i + 1;
    const formulaC = `=HYPERLINK("#gid=${sId}", "${sTitle.replace(/"/g, '""')}")`;
    const formulaD = `=COUNTIF('${escapedName}'!${webCol}12:${webCol}, "Pass") + COUNTIF('${escapedName}'!${webCol}12:${webCol}, "Passed")`;
    const formulaE = `=COUNTIF('${escapedName}'!${webCol}12:${webCol}, "Fail") + COUNTIF('${escapedName}'!${webCol}12:${webCol}, "Failed")`;
    const formulaG = `=COUNTIF('${escapedName}'!${webCol}12:${webCol}, "N/A") + COUNTIF('${escapedName}'!${webCol}12:${webCol}, "NA")`;
    const formulaH = `=COUNTA('${escapedName}'!A12:A)`;
    const formulaF = `=MAX(0, H${row} - D${row} - E${row} - G${row})`;

    formulasAndValues.push([
      colNo,
      formulaC,
      formulaD,
      formulaE,
      formulaF,
      formulaG,
      formulaH
    ]);
  }

  // 5. Hàng Sub total
  const subTotalRow = START_ROW + numModules;
  const lastDataRow = subTotalRow - 1;
  const subTotalRowData = [
    "Sub total",
    "",
    `=SUM(D${START_ROW}:D${lastDataRow})`,
    `=SUM(E${START_ROW}:E${lastDataRow})`,
    `=SUM(F${START_ROW}:F${lastDataRow})`,
    `=SUM(G${START_ROW}:G${lastDataRow})`,
    `=SUM(H${START_ROW}:H${lastDataRow})`
  ];

  // 6. Hai hàng Coverage
  const covRow1 = subTotalRow + 2;
  const covRow2 = subTotalRow + 3;

  // Mở rộng dòng nếu cần
  const summaryMaxRows = summarySheet.properties.gridProperties ? summarySheet.properties.gridProperties.rowCount : 60;
  if (covRow2 > summaryMaxRows) {
    const addRows = covRow2 - summaryMaxRows + 10;
    console.log(`Sheet Summary chỉ có ${summaryMaxRows} dòng, cần ${covRow2} dòng. Đang thêm ${addRows} dòng...`);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          appendDimension: {
            sheetId: summarySheet.properties.sheetId,
            dimension: 'ROWS',
            length: addRows
          }
        }]
      }
    });
  }

  // Đẩy dữ liệu bảng lên Google Sheets
  const updateRange = `'${summarySheetTitle}'!B${START_ROW}:H${subTotalRow}`;
  const allRows = [...formulasAndValues, subTotalRowData];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: allRows
    }
  });

  // Đẩy 2 hàng Coverage
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${summarySheetTitle}'!C${covRow1}:F${covRow2}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['Test coverage', '', '', `=IF(H${subTotalRow}>0, (H${subTotalRow}-F${subTotalRow})/H${subTotalRow}, 0)`],
        ['Test successful coverage', '', '', `=IF(H${subTotalRow}>0, D${subTotalRow}/H${subTotalRow}, 0)`]
      ]
    }
  });

  // 7. Định dạng giao diện (Merge, Format, Borders, Cắt tỉa hàng thừa)
  const requests = [
    // Format chuẩn font và số nguyên cho toàn bộ bảng data
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: START_ROW - 1,
          endRowIndex: lastDataRow,
          startColumnIndex: 1,
          endColumnIndex: 8
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 1, green: 1, blue: 1 },
            textFormat: { bold: false, fontSize: 10, fontFamily: 'Arial' },
            numberFormat: { type: 'NUMBER', pattern: '#,##0' },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,numberFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Riêng Module code căn trái và bỏ gạch dưới
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: START_ROW - 1,
          endRowIndex: lastDataRow,
          startColumnIndex: 2,
          endColumnIndex: 3
        },
        cell: {
          userEnteredFormat: {
            horizontalAlignment: 'LEFT',
            textFormat: { underline: false }
          }
        },
        fields: 'userEnteredFormat(horizontalAlignment,textFormat.underline)'
      }
    },
    // Merge B:C ở hàng Sub total
    {
      mergeCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: subTotalRow - 1,
          endRowIndex: subTotalRow,
          startColumnIndex: 1,
          endColumnIndex: 3
        },
        mergeType: 'MERGE_ALL'
      }
    },
    // Background và font cho Sub total
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: subTotalRow - 1,
          endRowIndex: subTotalRow,
          startColumnIndex: 1,
          endColumnIndex: 8
        },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.93, green: 0.85, blue: 0.86 },
            textFormat: { bold: true, fontSize: 10, fontFamily: 'Arial' },
            numberFormat: { type: 'NUMBER', pattern: '#,##0' },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,numberFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Merge C:D cho 2 dòng Coverage
    {
      mergeCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: covRow1 - 1,
          endRowIndex: covRow1,
          startColumnIndex: 2,
          endColumnIndex: 4
        },
        mergeType: 'MERGE_ALL'
      }
    },
    {
      mergeCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: covRow2 - 1,
          endRowIndex: covRow2,
          startColumnIndex: 2,
          endColumnIndex: 4
        },
        mergeType: 'MERGE_ALL'
      }
    },
    // Format chữ tiêu đề Coverage
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: covRow1 - 1,
          endRowIndex: covRow2,
          startColumnIndex: 2,
          endColumnIndex: 4
        },
        cell: {
          userEnteredFormat: {
            textFormat: { bold: true, fontSize: 10, fontFamily: 'Arial', foregroundColor: { red: 0.706, green: 0.373, blue: 0.024 } },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Định dạng NumberFormat % cho 2 ô Coverage (Cột F)
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: covRow1 - 1,
          endRowIndex: covRow2,
          startColumnIndex: 5,
          endColumnIndex: 6
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'PERCENT', pattern: '0%' },
            textFormat: { bold: true, fontSize: 10, fontFamily: 'Arial', foregroundColor: { blue: 1.0, red: 0, green: 0 } },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(numberFormat,textFormat,horizontalAlignment,verticalAlignment)'
      }
    }
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests }
  });

  console.log(`\n🎉 Cập nhật thành công toàn bộ ${numModules} sheets vào bảng SUMMARY!`);
}

main().catch(err => {
  console.error("Lỗi thực thi:", err);
  process.exit(1);
});
