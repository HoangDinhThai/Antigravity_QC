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
| **B** | **Module** | Tên phân hệ / chức năng lớn | **Chỉ điền ở dòng đầu tiên** (`idx == 1`, ví dụ: `"Chi tiết nhân sự"`), **tất cả các dòng tiếp theo để trống `""`** để giữ giao diện bảng sạch và đúng chuẩn hiển thị của Google Sheets. |
| **C** | **Feature** | Cột `Title 1` | Nhóm chức năng / Khối tính năng kiểm thử. |
| **D** | **Test Case Title_1** | Cột `Title 2 (Nếu có)` | Tiêu đề kịch bản kiểm thử chi tiết. |
| **E** | **Test Case Title_2** | Để trống | Mặc định để trống `""`. |
| **F** | **Pre-Condition** | Cột `Pre-Condition` | Tiền điều kiện thực thi test case. |
| **G** | **Steps** | Cột `Test Steps` | Các bước thao tác. **Bóc bỏ `->` và `<br>`, chuyển thành ký tự xuống dòng `\n` trực tiếp trong ô**. |
| **H** | **Test Data** | Cột `Test Data` | Dữ liệu test cụ thể. **Chuyển `<br>` thành `\n`**. |
| **I** | **Expected Result** | Cột `Expected Result` | Kết quả mong đợi. **Chuyển `<br>` thành `\n`**. |
| **J** | **Priority** | Cột `Priority` | Chuẩn hóa về 3 giá trị của Sheet:<br>• `Critical` / `High` ➔ **`High`**<br>• `Medium` ➔ **`Normal`**<br>• `Low` ➔ **`Low`** |
| **K** | **Web** | Mặc định | Luôn điền giá trị **`UnTest`**. |
| **L** | **Bug_ID** | Để trống | Giữ trống `""` để Tester điền khi bắt gặp lỗi trong quá trình thực thi. |
| **M** | **Tester** | Tên Tester | Mặc định điền mã Tester (ví dụ: `ThaiHD`) **chỉ ở dòng đầu tiên**, các dòng tiếp theo để trống `""`. |
| **N** | **Test Date** | Để trống | Giữ trống `""` để Tester ghi ngày khi chạy kiểm thử thực tế. |
| **O** | **Comments** | Cột `TC ID` | Điền mã kịch bản gốc (Ví dụ: `VNTEST_PERSONNEL_DETAIL_TC_001`). |

---

## 2. Quy Tắc Làm Sạch Dữ Liệu (Markdown Data Cleaning)

Trước khi ghi vào Google Sheets, hệ thống tự động xử lý làm sạch chuỗi:
1. **Loại bỏ Markdown formatting:** Xóa sạch các dấu in đậm `**text**`, in nghiêng `*text*`, backticks `` `code` `` để nội dung trong ô phẳng, rõ ràng, không bị lỗi hiển thị.
2. **Xử lý xuống dòng:**
   - Thay thế toàn bộ thẻ `<br>`, `<br/>`, `<br >` thành ký tự xuống dòng thực tế `\n`.
   - Thay thế dấu mũi tên phân tách bước ` -> ` thành ký tự xuống dòng `\n`.
3. **Cắt tỉa khoảng trắng:** Loại bỏ toàn bộ khoảng trắng thừa ở đầu và cuối chuỗi (`strip()`).

---

## 3. Cơ Chế Xử Lý Bảng Tính Thông Minh (Smart Sheet Engine)

1. **Phân tích Sheet ID và GID:**
   - Trích xuất `Spreadsheet ID` và `GID` trực tiếp từ URL Google Sheet cung cấp.
   - Tìm chính xác trang tính (tab sheet) khớp với `GID`, không phụ thuộc vào thứ tự tab và **tuyệt đối không hardcode tên sheet**.
2. **Bảo vệ Metadata & Nhận diện Hàng Tiêu Đề:**
   - Dòng 1 đến dòng 10 thường là thông tin dự án, tiêu chuẩn, ký hiệu viết tắt.
   - Quét nhận diện dòng tiêu đề thực tế (thường nằm tại dòng 11 chứa `No. ID`, `Module`, `Feature`...).
   - Bắt đầu ghi dữ liệu từ dòng 12 (`A12:O...`), hoặc tìm dòng trống đầu tiên bên dưới vùng dữ liệu đã có để ghi nối tiếp (append).
3. **Tự động Unmerge vùng dữ liệu:**
   - Nếu trong vùng dữ liệu (từ dòng 11 trở xuống) có các ô bị gộp (merge) do thao tác trước đó, script tự động gọi `unmergeCells` để giải phóng ô trước khi ghi, tránh lỗi ghi đè dữ liệu.
4. **Cơ chế Batch Update chống Timeout:**
   - Khi số lượng test cases lớn (từ 50 đến 200+ cases), script tự động chia thành các batch nhỏ từ 30 đến 50 dòng mỗi đợt gọi API Google Sheets để đảm bảo tốc độ và tránh bị timeout kết nối.

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
