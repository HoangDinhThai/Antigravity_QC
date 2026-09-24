const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Danh sách các sheet loại trừ (không phải sheet testcase)
const EXCLUDE_SHEETS = [
  'SUMMARY',
  'REPORT',
  'DASHBOARD',
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

  const START_ROW = 14; // Dòng 14
  const numModules = moduleSheets.length;

  // 2. Xóa các hàng dữ liệu cũ từ dòng 14 đến dòng 100 trong Summary
  console.log(`Đang làm sạch dữ liệu cũ từ dòng ${START_ROW} trên sheet '${summarySheetTitle}'...`);
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${summarySheetTitle}'!B${START_ROW}:H200`
  });

  // 3. Chuẩn bị hàng dữ liệu và công thức
  const formulasAndValues = [];
  for (let i = 0; i < numModules; i++) {
    const s = moduleSheets[i];
    const sTitle = s.properties.title;
    const sId = s.properties.sheetId;
    const row = START_ROW + i;
    const escapedName = sTitle.replace(/'/g, "''");

    const colNo = i + 1;
    const formulaC = `=HYPERLINK("#gid=${sId}", "${sTitle.replace(/"/g, '""')}")`;
    const formulaD = `=COUNTIF('${escapedName}'!K12:K, "Pass")`;
    const formulaE = `=COUNTIF('${escapedName}'!K12:K, "Fail")`;
    const formulaG = `=COUNTIF('${escapedName}'!K12:K, "N/A") + COUNTIF('${escapedName}'!K12:K, "NA")`;
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

  // 4. Hàng Sub total
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

  // 5. Hai hàng Coverage
  const covRow1 = subTotalRow + 2;
  const covRow2 = subTotalRow + 3;

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
    range: `'${summarySheetTitle}'!C${covRow1}:G${covRow2}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        ['Test coverage', '', '', `=IF(H${subTotalRow}>0, (H${subTotalRow}-F${subTotalRow})/H${subTotalRow}, 0)`, ''],
        ['Test successful coverage', '', '', `=IF(H${subTotalRow}>0, D${subTotalRow}/H${subTotalRow}, 0)`, '']
      ]
    }
  });

  // 6. Format giao diện (Merge Sub total B:C, borders, màu sắc)
  const requests = [
    // Merge B:C ở hàng Sub total
    {
      mergeCells: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: subTotalRow - 1,
          endRowIndex: subTotalRow,
          startColumnIndex: 1, // Col B
          endColumnIndex: 3    // Col D (B, C)
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
            backgroundColor: { red: 0.93, green: 0.85, blue: 0.86 }, // Hồng nhạt #edd8dc
            textFormat: { bold: true, fontSize: 10, fontFamily: 'Arial' },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE'
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
      }
    },
    // Định dạng NumberFormat % cho 2 ô Coverage
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: covRow1 - 1,
          endRowIndex: covRow2,
          startColumnIndex: 5, // Col F
          endColumnIndex: 7    // Col H
        },
        cell: {
          userEnteredFormat: {
            numberFormat: { type: 'PERCENT', pattern: '0%' },
            textFormat: { bold: true, foregroundColor: { blue: 1.0 } }
          }
        },
        fields: 'userEnteredFormat(numberFormat,textFormat)'
      },
    // Bỏ gạch dưới (underline: false) cho cột Module code (Cột C)
    {
      repeatCell: {
        range: {
          sheetId: summarySheetId,
          startRowIndex: START_ROW - 1,
          endRowIndex: START_ROW + numModules - 1,
          startColumnIndex: 2, // Col C
          endColumnIndex: 3
        },
        cell: {
          userEnteredFormat: {
            textFormat: { underline: false }
          }
        },
        fields: 'userEnteredFormat.textFormat.underline'
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

