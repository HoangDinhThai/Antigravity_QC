/**
 * =========================================================================================
 * GOOGLE APPS SCRIPT: TỰ ĐỘNG CẬP NHẬT TRANG SUMMARY TESTCASE (DỰ ÁN VNTEST)
 * =========================================================================================
 * 
 * Tác dụng:
 * 1. Tự động quét TẤT CẢ các sheet testcase chức năng trong bảng tính.
 * 2. Cập nhật danh sách vào bảng "II. Report by Function List" trong sheet SUMMARY:
 *    - Cột No (STT): 1, 2, 3...
 *    - Cột Module code: Tên sheet kèm Hyperlink click nhảy trực tiếp đến sheet đó (#gid=...).
 *    - Cột Pass, Fail, Untested, N/A, Number of test cases: Áp dụng công thức tham chiếu chuẩn xác.
 *      => Khi Tester cập nhật kết quả bên sheet con thì số liệu trên trang SUMMARY TỰ ĐỘNG NHẢY REALTIME!
 * 3. Hàng Sub total & Test Coverage:
 *    - Tự động co giãn theo số lượng sheet (kể cả có 5, 29 hay 100+ sheet không bao giờ bị ghi đè).
 *    - Tự động chèn công thức SUM và tính Test coverage, Test successful coverage.
 * 4. Tự động hóa hoàn toàn:
 *    - Hỗ trợ Trigger onChange: Khi tạo sheet mới (+), đổi tên sheet, xóa sheet => Tự động cập nhật ngay!
 *    - Có menu trực tiếp trên thanh công cụ: "🚀 VNTEST Tools" để bấm chạy 1-click.
 * =========================================================================================
 */

// Danh sách tên sheet cần bỏ qua (không phải sheet module testcase)
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

/**
 * 1. Menu tùy chỉnh trên Google Sheets
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 VNTEST Tools')
    .addItem('🔄 Cập nhật bảng SUMMARY ngay', 'updateSummarySheet')
    .addSeparator()
    .addItem('⚡ Kích hoạt Tự động cập nhật khi tạo/sửa sheet', 'setupAutoTrigger')
    .addToUi();
}

/**
 * Chuyển đổi index cột (0-indexed) thành chữ cái (A, B, ..., Z, AA, AB...)
 */
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

/**
 * 2. Hàm chính: Cập nhật toàn bộ bảng Report by Function List trong trang SUMMARY
 */
function updateSummarySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Tìm sheet SUMMARY
  let summarySheet = null;
  const allSheets = ss.getSheets();
  for (const s of allSheets) {
    const name = s.getName().trim().toUpperCase();
    if (name === 'SUMMARY' || name.includes('SUMMARY')) {
      summarySheet = s;
      break;
    }
  }

  if (!summarySheet) {
    SpreadsheetApp.getUi().alert('❌ Không tìm thấy tab sheet có tên "SUMMARY"!');
    return;
  }

  // 2. Lọc ra các sheet testcase chức năng
  const moduleSheets = allSheets.filter(s => {
    if (s.isSheetHidden()) return false;
    const name = s.getName().trim();
    const upper = name.toUpperCase();
    if (upper === summarySheet.getName().trim().toUpperCase()) return false;
    for (const ex of EXCLUDE_SHEETS) {
      if (upper === ex || upper.startsWith(ex + '_') || upper.startsWith(ex + ' ')) return false;
    }
    return true;
  });

  if (moduleSheets.length === 0) {
    SpreadsheetApp.getUi().alert('⚠️ Không tìm thấy sheet testcase chức năng nào!');
    return;
  }

  const START_ROW = 14;      // Dòng bắt đầu dữ liệu module (dưới Header dòng 13)
  const COL_START = 2;       // Cột B (No)
  const NUM_COLS = 7;        // 7 cột: B (No) đến H (Number of test cases)

  // Dọn dẹp dữ liệu và unmerge các dòng cũ từ dòng 14 trở xuống
  const maxRows = summarySheet.getMaxRows();
  if (maxRows >= START_ROW) {
    const clearRange = summarySheet.getRange(START_ROW, COL_START, maxRows - START_ROW + 1, NUM_COLS);
    clearRange.breakApart(); // Unmerge mọi ô cũ
    clearRange.clear({ contentsOnly: false });
  }

  // 3. Chuẩn bị dữ liệu và công thức động cho từng module
  const numModules = moduleSheets.length;
  const values = [];
  const formulas = [];

  for (let i = 0; i < numModules; i++) {
    const sheet = moduleSheets[i];
    const sheetName = sheet.getName();
    const sheetId = sheet.getSheetId();

    const escapedSheetName = sheetName.replace(/'/g, "''");
    const sheetRef = `'${escapedSheetName}'`;

    // Phân tích header dòng 1 của sheet con để xác định cột Total và cột Status
    let totalCol = 'H';
    let statusCol = 'K';

    try {
      const topRowValues = sheet.getRange(1, 1, 2, Math.min(sheet.getLastColumn(), 15)).getFormulas();
      const topRowTexts = sheet.getRange(1, 1, 2, Math.min(sheet.getLastColumn(), 15)).getValues();
      const r0Formulas = topRowValues[0] || [];
      const r0Texts = topRowTexts[0] || [];

      for (let c = 0; c < r0Texts.length; c++) {
        const formula = String(r0Formulas[c] || '');
        const text = String(r0Texts[c] || '').trim().toLowerCase();

        if (formula.startsWith('=SUM(')) {
          totalCol = colIndexToLetter(c);
        }
        if (text === 'passed' && c + 1 < sheet.getLastColumn()) {
          statusCol = colIndexToLetter(c + 1);
        }
      }
    } catch (e) {
      // Fallback mặc định
      totalCol = 'H';
      statusCol = 'K';
    }

    const colNo = `=row()-13`;
    const formulaC = `=HYPERLINK("#gid=${sheetId}","${sheetName.replace(/"/g, '""')}")`;
    const formulaD = `=${sheetRef}!${statusCol}1+${sheetRef}!${statusCol}4+${sheetRef}!${statusCol}7`;
    const formulaE = `=${sheetRef}!${statusCol}2+${sheetRef}!${statusCol}5+${sheetRef}!${statusCol}8`;
    const formulaF = `=${sheetRef}!${statusCol}3+${sheetRef}!${statusCol}6+${sheetRef}!${statusCol}9`;
    const formulaG = `0`;
    const formulaH = `=${sheetRef}!${totalCol}1`;

    formulas.push([
      colNo,      // Col B
      formulaC,   // Col C
      formulaD,   // Col D
      formulaE,   // Col E
      formulaF,   // Col F
      formulaG,   // Col G
      formulaH    // Col H
    ]);

    values.push(["", "", "", "", "", "", ""]);
  }

  // Mở rộng thêm số dòng nếu chưa đủ
  const neededRows = START_ROW + numModules + 15;
  if (neededRows > summarySheet.getMaxRows()) {
    summarySheet.insertRowsAfter(summarySheet.getMaxRows(), neededRows - summarySheet.getMaxRows());
  }

  // 4. Ghi STT và công thức vào bảng
  const dataRange = summarySheet.getRange(START_ROW, COL_START, numModules, NUM_COLS);
  dataRange.setFormulas(formulas);

  // Định dạng font chữ và căn lề
  dataRange.setFontFamily('Arial');
  dataRange.setFontSize(10);
  dataRange.setVerticalAlignment('middle');
  summarySheet.getRange(START_ROW, 2, numModules, 1).setHorizontalAlignment('center'); // Cột B: Giữa
  summarySheet.getRange(START_ROW, 3, numModules, 1).setHorizontalAlignment('left').setFontLine('none');   // Cột C: Trái & KHÔNG gạch dưới
  summarySheet.getRange(START_ROW, 4, numModules, 5).setHorizontalAlignment('center'); // Cột D-H: Giữa

  // Kẻ viền nét đứt (DOTTED) cho các ô dữ liệu
  dataRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.DOTTED);

  // 5. Hàng Sub total
  const subTotalRow = START_ROW + numModules;
  const subTotalRange = summarySheet.getRange(subTotalRow, COL_START, 1, NUM_COLS);

  // Merge B:C cho chữ "Sub total"
  summarySheet.getRange(subTotalRow, 2, 1, 2).merge();
  summarySheet.getRange(subTotalRow, 2).setValue('Sub total');

  // Công thức SUM
  const lastDataRow = subTotalRow - 1;
  summarySheet.getRange(subTotalRow, 4).setFormula(`=SUM(D${START_ROW}:D${lastDataRow})`);
  summarySheet.getRange(subTotalRow, 5).setFormula(`=SUM(E${START_ROW}:E${lastDataRow})`);
  summarySheet.getRange(subTotalRow, 6).setFormula(`=SUM(F${START_ROW}:F${lastDataRow})`);
  summarySheet.getRange(subTotalRow, 7).setFormula(`=SUM(G${START_ROW}:G${lastDataRow})`);
  summarySheet.getRange(subTotalRow, 8).setFormula(`=SUM(H${START_ROW}:H${lastDataRow})`);

  // Định dạng Sub total: Nền hồng phấn (#EDD8DC), in đậm, viền nét liền
  subTotalRange.setFontFamily('Arial').setFontSize(10).setFontWeight('bold');
  subTotalRange.setBackground('#EDD8DC').setVerticalAlignment('middle');
  summarySheet.getRange(subTotalRow, 2).setHorizontalAlignment('center');
  summarySheet.getRange(subTotalRow, 4, 1, 5).setHorizontalAlignment('center');
  subTotalRange.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.SOLID);

  // 6. Phần Thống kê Coverage (dưới Sub total)
  const covRow1 = subTotalRow + 2;
  const covRow2 = subTotalRow + 3;

  // Dòng Test coverage
  const covLabel1 = summarySheet.getRange(covRow1, 3, 1, 2);
  covLabel1.merge().setValue('Test coverage');
  const covVal1 = summarySheet.getRange(covRow1, 5);
  covVal1.setFormula(`=IF(H${subTotalRow}=0, 0, (H${subTotalRow}-F${subTotalRow})/H${subTotalRow})`).setNumberFormat('0%');

  // Dòng Test successful coverage
  const covLabel2 = summarySheet.getRange(covRow2, 3, 1, 2);
  covLabel2.merge().setValue('Test successful coverage');
  const covVal2 = summarySheet.getRange(covRow2, 5);
  covVal2.setFormula(`=IF(H${subTotalRow}=0, 0, D${subTotalRow}/H${subTotalRow})`).setNumberFormat('0%');

  // Định dạng khối Coverage: Chữ tiêu đề màu nâu đỏ, kết quả % màu xanh dương đậm
  const covBlock = summarySheet.getRange(covRow1, 3, 2, 3);
  covBlock.setFontFamily('Arial').setFontSize(10).setFontWeight('bold').setVerticalAlignment('middle');
  summarySheet.getRange(covRow1, 3, 2, 2).setFontColor('#B45F06').setHorizontalAlignment('center');
  summarySheet.getRange(covRow1, 5, 2, 1).setFontColor('#0000FF').setHorizontalAlignment('center');
  covBlock.setBorder(true, true, true, true, true, true, '#000000', SpreadsheetApp.BorderStyle.DOTTED);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `✅ Đã cập nhật xong ${numModules} sheets vào bảng SUMMARY!`,
    'VNTEST Automation',
    5
  );
}

/**
 * 3. Kích hoạt khi có thay đổi cấu trúc bảng tính (tạo sheet, xóa sheet, đổi tên sheet)
 */
function onSheetChange(e) {
  if (e && (e.changeType === 'INSERT_GRID' || e.changeType === 'REMOVE_GRID' || e.changeType === 'OTHER')) {
    updateSummarySheet();
  }
}

/**
 * 4. Cài đặt Trigger tự động chạy ngầm (chỉ cần chạy 1 lần duy nhất)
 */
function setupAutoTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getUserTriggers(ss);
  
  for (const t of triggers) {
    if (t.getHandlerFunction() === 'onSheetChange') {
      ScriptApp.deleteTrigger(t);
    }
  }

  ScriptApp.newTrigger('onSheetChange')
    .forSpreadsheet(ss)
    .onChange()
    .create();

  SpreadsheetApp.getUi().alert(
    '🎉 Thành công!\n\nĐã kích hoạt chế độ TỰ ĐỘNG CẬP NHẬT.\nTừ bây giờ, mỗi khi bạn tạo sheet mới (+), đổi tên sheet hoặc xóa sheet, bảng SUMMARY sẽ tự động cập nhật ngay lập tức!'
  );
}
