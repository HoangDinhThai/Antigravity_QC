---
name: Google Sheets Integration
description: Skill này cho phép đẩy danh sách test cases dạng Markdown table trực tiếp lên Google Sheets một cách linh động dựa trên URL của Sheet.
---

# Google Sheets Integration

Skill này cung cấp khả năng tự động đẩy các test case được sinh ra dưới dạng bảng Markdown trực tiếp lên Google Sheets.

## Cách Hoạt Động (How it works)

1. **Trích xuất thông tin URL:** Script tự động phân tích URL Google Sheet để lấy `Spreadsheet ID` và `GID` (Sheet ID).
2. **Xác thực API Google:**
   - Hỗ trợ **Service Account** (khuyên dùng cho chạy không tương tác): Đọc file `service_account.json`. Yêu cầu người dùng share sheet cho email của Service Account với quyền Editor.
   - Hỗ trợ **OAuth 2.0 Desktop** (chạy tương tác): Đọc file `credentials.json`, mở trình duyệt để người dùng đăng nhập và cấp quyền, lưu trữ token tại `token.json` để dùng lại cho các lần sau.
3. **Phân tích Markdown Table:** Đọc nội dung bảng testcase Markdown, chuyển đổi thẻ `<br>` thành ký tự xuống dòng `\n` để hiển thị đẹp trong Google Sheet.
4. **Áp dụng Header Mapping linh hoạt:**
   - Đọc hàng tiêu đề (header) hiện có của Google Sheet.
   - Tự động đối chiếu (fuzzy mapping) các tiêu đề tiếng Anh/tiếng Việt của bảng testcase sang các cột tương ứng trong sheet dự án dựa trên từ khóa đồng nghĩa (ví dụ: `Mã test case`, `TC ID`, `ID` đều map về `tc_id`).
   - Nếu sheet hoàn toàn trống, tự động ghi tiêu đề mặc định vào dòng đầu tiên.
5. **Append Dữ liệu:** Đẩy dữ liệu vào các cột tương ứng và lưu lại.

---

## Hướng dẫn thiết lập Credentials (Xác thực Google API)

Bạn cần tải file cấu hình Google Credentials và lưu vào thư mục:
`c:\Users\thai.hoang.dinh\CSI\.agent\skills\google_sheets_integration\credentials\`

### Cách 1: Sử dụng Service Account (Khuyên dùng - Không cần tương tác)
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Tạo một dự án mới (nếu chưa có) và kích hoạt **Google Sheets API**.
3. Vào mục **IAM & Admin > Service Accounts** -> Tạo Service Account mới.
4. Tạo và tải xuống key định dạng **JSON**.
5. Đổi tên tệp đã tải xuống thành `service_account.json` và lưu vào thư mục `credentials` của skill này.
6. Mở Google Sheet dự án của bạn, nhấn **Share** (Chia sẻ) và nhập email của Service Account (dạng `xxx@xxx.iam.gserviceaccount.com`) với quyền **Editor**.

### Cách 2: Sử dụng OAuth 2.0 Client ID (Cần đăng nhập qua trình duyệt lần đầu)
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Kích hoạt **Google Sheets API**.
3. Vào mục **APIs & Services > Credentials** -> Tạo credentials mới loại **OAuth client ID** (chọn Application type là **Desktop App**).
4. Tải xuống tệp JSON client secret.
5. Đổi tên tệp đã tải xuống thành `credentials.json` và lưu vào thư mục `credentials` của skill này.
6. Trong lần chạy đầu tiên, một cửa sổ trình duyệt sẽ hiện ra yêu cầu bạn cấp quyền truy cập. Sau khi đồng ý, tệp `token.json` sẽ được tạo tự động để sử dụng cho các lần sau.

---

## Cách dùng lệnh

```bash
python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<url_gg_sheet>" --file "<duong_dan_file_markdown>"
```

Hoặc truyền dữ liệu trực tiếp bằng cách pipe nội dung:
```bash
python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<url_gg_sheet>" --content "<noi_dung_markdown>"
```
