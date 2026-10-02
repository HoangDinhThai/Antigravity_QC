---
name: Google Sheets Integration
description: Đẩy test cases dạng bảng Markdown trực tiếp lên Google Sheets dự án VNTEST một cách linh động, thông minh, đúng chuẩn 15 cột A-O.
---

# 📊 Hướng Dẫn Sử Dụng Skill: Google Sheets Integration

Skill này hỗ trợ tự động hóa việc đưa các kịch bản kiểm thử (test cases) dạng bảng Markdown (từ file `docs/test_cases/*.md` hoặc từ nội dung bảng Markdown trong đoạn chat) trực tiếp lên Google Sheets của dự án **VNTEST** một cách chuẩn xác, đúng định dạng và đúng mẫu 15 cột.

---

## 1. Cấu Trúc Ánh Xạ 15 Cột Chuẩn (A – O) của Dự Án VNTEST

Hệ thống tự động bóc tách từng dòng dữ liệu của bảng Markdown test case và ánh xạ chuẩn xác vào 15 cột tương ứng trên Google Sheets:

| Cột | Tên Cột trên Sheet | Nguồn Dữ Liệu từ Markdown | Quy Tắc Điền & Chuẩn Hóa |
| :---: | :--- | :--- | :--- |
| **A** | **No. ID** (STT) | Tự động sinh | Đánh số thứ tự tăng dần từ `1, 2, 3...` (nếu ghi tiếp bên dưới dữ liệu cũ, tự động cộng tiếp STT). |
| **B** | **Module** | Tên phân hệ / chức năng lớn | Điền tên Module tại dòng đầu tiên và **bắt buộc tự động gộp ô (Merge Cells) toàn bộ** theo chiều dọc từ dòng đầu đến dòng cuối của bảng test case. Căn giữa (Center & Middle), in đậm (Bold), tự động xuống dòng (Wrap text) và đóng viền khung (Borders: SOLID 1px). Tuyệt đối CẤM chứa số thứ tự (như "10.4. "). |
| **C** | **Feature** | Cột `Feature` | Khối chức năng / Nhóm tính năng lớn. **Bắt buộc tự động gộp ô (Merge Cells) theo chiều dọc cho các test case liên tiếp chung Feature**. Căn giữa (Center & Middle), in đậm (Bold), tự động xuống dòng (Wrap text) và đóng viền khung (Borders: SOLID 1px). |
| **D** | **Test Case Title_1** | Cột `Test Case Title_1` | Tên nhóm con / Chủ đề kiểm thử cấp 1 (ví dụ: `Quyền truy cập`, `Phiên đăng nhập`, `Phân quyền trường Tên Sale`). **Bắt buộc tự động gộp ô (Merge Cells) theo chiều dọc cho các test case liên tiếp chung Title_1 trong cùng Feature**. Căn giữa dọc (Middle), căn lề trái (Left), in đậm (Bold), tự động xuống dòng (Wrap text) và đóng viền khung (Borders: SOLID 1px). |
| **E** | **Test Case Title_2** | Cột `Test Case Title_2` | Tiêu đề kịch bản kiểm thử chi tiết. **Tuyệt đối KHÔNG lặp lại tiền tố của Title_1**. Đối với ca đơn lẻ (không có phân nhánh con): **Bắt buộc để trống `""`**, TUYỆT ĐỐI KHÔNG copy trùng lặp y hệt tên từ Title_1 sang Title_2. |
| **F** | **Pre-Condition** | Cột `Pre-Condition` | Tiền điều kiện thực thi test case. |
| **G** | **Steps** | Cột `Test Steps` | Các bước thao tác nguyên tử. **Chỉ ghi hành động người dùng (ví dụ: `1. Nhập SĐT.\n\n2. Bấm [Cập nhật].`), TUYỆT ĐỐI CẤM lặp lại giá trị dữ liệu cụ thể hoặc ghi chú dữ liệu vào đây**. Bóc bỏ `->` và `<br>`, chuyển thành ký tự xuống dòng; tạo dòng trống ngăn cách (`\n\n`) giữa các ý đánh số để thoáng mắt. |
| **H** | **Test Data** | Cột `Test Data` | Nơi **DUY NHẤT** lưu trữ các giá trị dữ liệu cụ thể dùng cho kịch bản (nhập mới, giữ nguyên, rỗng `""`, hoặc vi phạm). Chuyển `<br>` thành `\n`. |
| **I** | **Expected Result** | Cột `Expected Result` | Kết quả mong đợi. **Bắt buộc tạo khoảng cách dòng trống (`\n\n`) giữa các ý đánh số (`1. ...`, `2. ...`)** để các ý tách bạch, thoáng đãng và dễ đọc. |
| **J** | **Priority** | Cột `Priority` | Chuẩn hóa về 3 giá trị của Sheet:<br>• `Critical` / `High` ➔ **`High`**<br>• `Medium` ➔ **`Normal`**<br>• `Low` ➔ **`Low`**.<br>**Bắt buộc giữ nguyên Dropdown Chip có màu chuẩn trên nền trắng tinh (`#FFFFFF`)**:<br>• `High`: Chip đỏ đậm (`#B71C1C`), chữ trắng.<br>• `Normal`: Chip xanh lá nhạt (`#CEEAD6`), chữ xanh lá đậm.<br>• `Low`: Chip xanh dương nhạt (`#C2E7FF`), chữ xanh dương.<br>Căn giữa. Bắt buộc sao chép Data Validation (`PASTE_DATA_VALIDATION`) từ sheet mẫu; **TUYỆT ĐỐI CẤM** dùng Conditional Formatting tô màu nền ô. |
| **K** | **Web** | Mặc định | Mặc định điền giá trị **`UnTest`** cho tất cả các dòng.<br>**Bắt buộc giữ nguyên Dropdown Chip có màu chuẩn trên nền trắng tinh (`#FFFFFF`)**:<br>• `UnTest`: Chip tím nhạt (`#DED0EE` / lavender), chữ tím.<br>• `Passed`: Chip xanh lá nhạt (`#CEEAD6`).<br>• `Failed`: Chip đỏ.<br>Căn giữa. Bắt buộc sao chép Data Validation (`PASTE_DATA_VALIDATION`) từ sheet mẫu; **TUYỆT ĐỐI CẤM** dùng Conditional Formatting tô màu nền ô. |
| **L** | **Bug_ID** | Để trống | Giữ trống `""` để Tester điền khi bắt gặp lỗi trong quá trình thực thi. |
| **M** | **Tester** | Tên Tester | Mặc định điền mã Tester (ví dụ: `ThaiHD`) tại dòng đầu tiên và **bắt buộc tự động gộp ô (Merge Cells) toàn bộ** theo chiều dọc từ dòng đầu đến dòng cuối của bảng test case. Căn giữa (Center & Middle), in đậm (Bold), đóng viền khung. |
| **N** | **Test Date** | Để trống | Giữ trống `""` để Tester ghi ngày khi chạy kiểm thử thực tế. |
| **O** | **Comments** | Cột `TC ID` | Điền mã kịch bản gốc (Ví dụ: `VNTEST_PERSONNEL_DETAIL_TC_001`). |

---

## 2. Quy Tắc Làm Sạch Dữ Liệu (Markdown Data Cleaning)

Trước khi ghi vào Google Sheets, hệ thống tự động xử lý làm sạch chuỗi:
1. **Loại bỏ Markdown formatting:** Xóa sạch các dấu in đậm `**text**`, in nghiêng `*text*`, backticks `` `code` `` để nội dung trong ô phẳng, rõ ràng, không bị lỗi hiển thị.
2. **Xử lý xuống dòng & Giãn cách dòng thoáng:**
   - Thay thế toàn bộ thẻ `<br>`, `<br/>`, `<br >` và `\n` đứng trước các mục đánh số (`1. ...`, `2. ...`) thành **2 lần xuống dòng `\n\n`** để tạo khoảng cách dòng thoáng giữa các ý.
   - Thay thế dấu mũi tên phân tách bước ` -> ` thành ký tự xuống dòng `\n\n`.
3. **Cắt tỉa khoảng trắng & Chống trùng lặp:**
   - Loại bỏ toàn bộ khoảng trắng thừa ở đầu và cuối chuỗi (`strip()`).
   - Nếu `Test Case Title_2` có giá trị trùng hoàn toàn với `Test Case Title_1`, hệ thống tự động làm sạch `Title_2 = ""` để tránh lặp từ vô nghĩa.
4. **Kế thừa Feature & Title_1:** Nếu trong bảng Markdown cột `Feature` hoặc `Test Case Title_1` chỉ điền ở dòng đầu của khối và để trống các dòng tiếp theo, hệ thống tự động kế thừa tên cho các dòng con cùng nhóm.

---

## 3. Cơ Chế Xử Lý Bảng Tính Thông Minh (Smart Sheet Engine)

1. **Phân tích Sheet ID, GID & Tự Động Đổi Tên Tab Sheet:**
   - Trích xuất `Spreadsheet ID` và `GID` trực tiếp từ URL Google Sheet cung cấp.
   - Tìm chính xác trang tính (tab sheet) khớp với `GID`, không phụ thuộc vào thứ tự tab.
   - **Tự động đổi tên Sheet:** Cập nhật ngay tên của tab sheet (sheet title) thành tên Module đang phân tích (lấy từ tham số `--module` hoặc tự động nhận diện từ tiêu đề kịch bản Markdown).
2. **Bảo vệ Metadata & Nhận diện Hàng Tiêu Đề:**
   - Dòng 1 đến dòng 10 thường là thông tin dự án, tiêu chuẩn, ký hiệu viết tắt.
   - Quét nhận diện dòng tiêu đề thực tế (thường nằm tại dòng 11 chứa `No. ID`, `Module`, `Feature`...).
   - Bắt đầu ghi dữ liệu từ dòng 12 (`A12:O...`), hoặc tìm dòng trống đầu tiên bên dưới vùng dữ liệu đã có để ghi nối tiếp (append).
3. **Tự động Unmerge vùng dữ liệu cũ:**
   - Nếu trong vùng dữ liệu (từ dòng 11 trở xuống) có các ô bị gộp (merge) do thao tác hoặc template trước đó để lại, script **bắt buộc tự động unmerge toàn bộ** để giải phóng ô trước khi ghi dữ liệu mới, ngăn ngừa triệt để lỗi ghi đè dữ liệu hoặc mất/nuốt giá trị.
4. **Cơ chế Batch Update chống Timeout:**
   - Khi số lượng test cases lớn (từ 50 đến 200+ cases), script tự động chia thành các batch nhỏ từ 30 đến 50 dòng mỗi đợt gọi API Google Sheets để đảm bảo tốc độ và tránh bị timeout kết nối.
5. **Tự Động Gộp Ô (Merge Cells) & Định Dạng Chuẩn Cột Feature (C), Title_1 (D), Module (B) và Tester (M):**
   - **Gộp ô Cột Module (Cột B):** Điền tên chức năng tại dòng đầu tiên (CẤM số thứ tự) và gộp toàn bộ cột B theo chiều dọc từ dòng đầu đến dòng cuối của bảng (`mergeCells` startCol: 1, endCol: 2). Căn giữa ngang và dọc (`CENTER` & `MIDDLE`), in đậm (`bold: true`), `Arial 10pt`, đóng khung viền.
   - **Gộp ô Cột Tester (Cột M):** Điền mã Tester (mặc định "ThaiHD") tại dòng đầu tiên và gộp toàn bộ cột M theo chiều dọc từ dòng đầu đến dòng cuối của bảng (`mergeCells` startCol: 12, endCol: 13). Căn giữa ngang và dọc (`CENTER` & `MIDDLE`), in đậm (`bold: true`), `Arial 10pt`, đóng khung viền.
   - **Gộp ô Cột Feature (Cột C):** Tự động gom các test case liên tiếp có chung tên Feature và thực thi `mergeCells` theo chiều dọc (`startColumnIndex: 2, endColumnIndex: 3`). Căn giữa ngang và dọc (`CENTER` & `MIDDLE`), in đậm (`bold: true`), `Arial 10pt`, đóng khung viền.
   - **Gộp ô Cột Test Case Title_1 (Cột D):** Tự động gom các test case liên tiếp có chung tên Title_1 trong cùng khối Feature và thực thi `mergeCells` theo chiều dọc (`startColumnIndex: 3, endColumnIndex: 4`). Căn giữa dọc (`MIDDLE`), căn lề trái (`LEFT`), in đậm (`bold: true`), `Arial 10pt`, đóng khung viền.
   - **Làm sạch giá trị trước khi merge:** Ô đầu tiên của mỗi nhóm lưu giá trị, các ô phía dưới để trống `""` để bảng tính sạch sẽ và tối ưu bộ nhớ.
6. **Bảo Toàn 100% Màu Sắc & Kiểu Dáng Dropdown Chip Chuẩn Dự Án VNTEST (Nền Trắng):**
   - **Quy chuẩn hiển thị:** Toàn bộ cột Priority (J) và Web (K) hiển thị dạng **Dropdown Chip (viên thuốc bo tròn có màu sắc)** đặt trên **nền ô màu trắng tinh (`#FFFFFF`)**:
     - `High`: Chip màu đỏ đậm/đỏ đô (`#B71C1C`), chữ trắng, mũi tên trắng `▼`.
     - `Normal`: Chip màu xanh lá nhạt (`#CEEAD6`), chữ xanh lá đậm, mũi tên xanh `▼`.
     - `Low`: Chip màu xanh dương nhạt (`#C2E7FF`), chữ xanh dương, mũi tên xanh `▼`.
     - `UnTest`: Chip màu tím nhạt (`#DED0EE` / lavender), chữ tím, mũi tên tím `▼`.
     - `Passed`: Chip màu xanh lá (`#CEEAD6`).
     - `Failed`: Chip màu đỏ.
   - **Cơ chế kỹ thuật bắt buộc:**
     - Sử dụng `copyPaste` với `pasteType: 'PASTE_DATA_VALIDATION'` từ ô mẫu của sheet template gốc (ví dụ: tab `13.1. Danh sách thiết bị`) sang toàn bộ dải `J12:K<endRow>` của sheet mới.
     - Sau khi copy validation, thực hiện căn giữa ngang và dọc (`CENTER` & `MIDDLE`).
   - **CẤM TUYỆT ĐỐI (ANTI-PATTERNS):**
     - ❌ **CẤM dùng Conditional Formatting (Định dạng có điều kiện)** để tô màu nền ô (gây lem màu vàng/hồng kín toàn bộ cell, làm mất đi vẻ đẹp và sự đồng bộ của Dropdown Chip).
     - ❌ **CẤM dùng API `setDataValidation` tự sinh** của Google Sheets API v4 vì API này sẽ reset cấu hình Smart Canvas Dropdown Chip của Google Sheets về dạng plain text cũ (mũi tên trắng, mất màu bo tròn).
     - ❌ **CẤM tự ý thay đổi màu sắc** khác với form mẫu chuẩn của dự án.
7. **Tự Động Cắt Tỉa & Xóa Sạch Hàng Trống Thừa Phía Dưới Bảng (Trim Trailing Empty Rows):**
   - **Tuyệt đối CẤM để thừa khoảng trống trắng bên dưới bảng test cases:** Bảng kết thúc ở dòng nào thì sheet phải dừng khít đúng ở dòng đó. Việc để thừa hàng chục hàng trắng bên dưới làm mất tính chuyên nghiệp và gây xấu giao diện.
   - **Cơ chế kỹ thuật tự động:** Sau khi đẩy dữ liệu hoặc chỉnh sửa testcase, script tự động kiểm tra số lượng dòng hiện tại của sheet (`rowCount`). Nếu `rowCount > (endDataRow - 1)` (tức là dòng cuối cùng của bảng dữ liệu), script tự động phát lệnh `deleteDimension: { dimension: 'ROWS', startIndex: endDataRow - 1, endIndex: rowCount }` để xóa sạch toàn bộ hàng thừa, đảm bảo sheet vừa khít 100% với bảng testcase.

---

## 4. 🔑 Cấu Hình Xác Thực (Credentials Setup)

Đặt file Service Account JSON vào thư mục:
`.agent/skills/google_sheets_integration/credentials/service_account.json`

> [!IMPORTANT]
> Google Sheet mục tiêu phải được chia sẻ quyền **Người chỉnh sửa (Editor)** cho địa chỉ email của Service Account.

---

## 5. 💬 Hướng Dẫn Sử Dụng Trong Chat

Bạn chỉ cần ra lệnh tự nhiên kèm URL Google Sheet:

### Trường hợp 1: Đẩy từ file Markdown có sẵn trong dự án
> *"Hãy đẩy test cases từ file `docs/test_cases/tc_personnel_detail_sheet.md` lên Google Sheet: `https://docs.google.com/spreadsheets/d/.../edit#gid=...`"*

### Trường hợp 2: Đẩy trực tiếp bảng test case vừa sinh trong chat
> *"Đẩy toàn bộ kịch bản test vừa tạo ở trên lên Google Sheet giúp tôi: `https://docs.google.com/spreadsheets/d/.../edit#gid=...`"*

---

## 6. 💻 Chạy Trực Tiếp Bằng Lệnh Script

QA hoặc Developer có thể thực thi trực tiếp qua Terminal:

### Chạy bằng Python:
```bash
python .agent/skills/google_sheets_integration/scripts/push_testcases.py \
  --url "<Đường_Dẫn_Google_Sheet>" \
  --file "docs/test_cases/tc_personnel_detail_sheet.md" \
  --module "Chi tiết nhân sự" \
  --tester "ThaiHD"
```

### Chạy bằng Node.js:
```bash
node .agent/skills/google_sheets_integration/scripts/push_testcases.js \
  --url "<Đường_Dẫn_Google_Sheet>" \
  --file "docs/test_cases/tc_personnel_detail_sheet.md" \
  --module "Chi tiết nhân sự" \
  --tester "ThaiHD"
```

---

## 7. 🔄 Tự Động Cập Nhật Bảng Thống Kê SUMMARY (Auto-Sync Summary Sheet)

Tự động quét toàn bộ các sheet testcase chức năng và cập nhật bảng **"II. Report by Function List"** trong sheet **SUMMARY**:
- Tự động đánh số thứ tự (No).
- Cột `Module code`: Chứa tên sheet kèm link bấm nhảy trực tiếp tới tab đó (`HYPERLINK`). **Lưu ý: Tên các sheet KHÔNG ĐƯỢC GẠCH DƯỚI (`underline: false`)** để giữ giao diện bảng sạch sẽ, trực quan.
- Cột `Pass`, `Fail`, `Untested`, `N/A`, `Number of test cases`: Sử dụng công thức tham chiếu chuẩn xác / `COUNTIF` / `COUNTA` động (khi Tester cập nhật kết quả bên sheet con thì số liệu trên trang SUMMARY tự động nhảy realtime).
- Tự động tính hàng `Sub total`, `Test coverage` và `Test successful coverage`.

### Cách 1: Tích Hợp Google Apps Script Trực Tiếp Trong Sheet (Khuyên dùng - Tự động 100%)
File mã nguồn: `.agent/skills/google_sheets_integration/scripts/Code.gs`
1. Trên Google Sheets, mở menu **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
2. Xóa hết code mặc định và dán toàn bộ nội dung từ file `Code.gs` vào.
3. Bấm **Lưu (Save)**.
4. F5 tải lại Google Sheets: Sẽ xuất hiện menu mới **🚀 VNTEST Tools** trên thanh công cụ:
   - Bấm **🔄 Cập nhật bảng SUMMARY ngay** để cập nhật bất kỳ lúc nào.
   - Bấm **⚡ Cài đặt Tự động cập nhật khi tạo/sửa sheet** để bật chế độ tự động 100% (mỗi khi bấm `+` tạo sheet mới, đổi tên hoặc xóa sheet, bảng SUMMARY sẽ tự động đồng bộ ngay).

### Cách 2: Chạy Bằng Lệnh Node.js Qua Terminal
File mã nguồn: `.agent/skills/google_sheets_integration/scripts/update_summary.js`
```bash
node .agent/skills/google_sheets_integration/scripts/update_summary.js \
  --url "<Đường_Dẫn_Google_Sheet>"
```

