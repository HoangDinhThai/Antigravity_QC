---
name: Google Sheets Integration
description: Đẩy test cases dạng bảng Markdown trực tiếp lên Google Sheets dự án một cách linh động và thông minh.
---

# 📊 Hướng Dẫn Sử Dụng Skill: Google Sheets Integration

Skill này hỗ trợ tự động hóa việc đưa các kịch bản kiểm thử (test cases) dạng bảng Markdown (từ file hoặc từ ô chat) trực tiếp lên Google Sheets của dự án một cách chính xác, đúng định dạng và đúng cột.

---

## 🛠️ Cách Thức Hoạt Động (How it works)

1. **Phân tích URL Google Sheet:** Tự động tìm ra `Spreadsheet ID` và `GID` (Sheet con) từ đường link bạn cung cấp.
2. **Dò tìm tiêu đề thông minh (Smart Header Scan):** Tự động quét 100 dòng đầu tiên để xác định vị trí của hàng tiêu đề thực tế (ví dụ: dòng chứa `No. ID`, `Title`, `Steps`, `Expected Result`...). Do đó, form mẫu của bạn có tiêu đề dự án hay thông tin linh tinh ở trên cũng không ảnh hưởng.
3. **Ánh xạ cột linh hoạt (Flexible Column Mapping):**
   - **Đánh số thứ tự tự động:** Nhận diện cột `No. ID`, `STT`... và điền số thứ tự tăng dần từ **1, 2, 3...** (tự động tính tiếp nếu bảng tính đã có dữ liệu).
   - **Tự động điền ngày tạo:** Điền ngày hiện tại dạng `YYYY-MM-DD` vào cột `Created date`.
   - **Giữ trống cột kiểm thử:** Cột `Test Date` và `Bug_ID` được giữ trống để tester điền thủ công khi chạy test.
   - **Khớp các cột nghiệp vụ:** Tự động điền các nội dung `Title`, `Pre-Condition`, `Steps`, `Test Data`, `Expected Result` tương ứng vào đúng vị trí cột thiết kế trên Sheet của bạn.
4. **Tìm dòng trống thông minh:** Dữ liệu mới được điền trực tiếp từ dòng trống đầu tiên bên dưới hàng tiêu đề (không chèn đè lên metadata và không bị đẩy xuống tận cùng bảng tính).

---

## 🔑 Hướng Dẫn Thiết Lập Bản Quyền (Setup Credentials)

Để bắt đầu sử dụng, bạn cần đặt file xác thực Google API vào thư mục sau:
`c:\Users\thai.hoang.dinh\Antigravity_QC\.agent\skills\google_sheets_integration\credentials\`

> [!TIP]
> **Khuyên dùng Cách 1 (Service Account)** vì chạy hoàn toàn tự động trong nền mà không yêu cầu bạn phải đăng nhập xác thực qua trình duyệt mỗi lần sử dụng.

### Cách 1: Sử dụng Service Account (Khuyên dùng)
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/) và kích hoạt **Google Sheets API**.
2. Vào mục **IAM & Admin > Service Accounts** -> Nhấn tạo Service Account mới.
3. Tạo khóa (Key) dưới dạng **JSON** và tải về máy.
4. Đổi tên tệp tải về thành **`service_account.json`** và di chuyển vào thư mục `credentials` đã nêu ở trên.
5. Mở Google Sheet dự án của bạn lên, nhấn nút **Chia sẻ (Share)** và nhập email của Service Account vừa tạo (dạng `xxx@xxx.iam.gserviceaccount.com`) với quyền **Người chỉnh sửa (Editor)**.

### Cách 2: Sử dụng OAuth 2.0 Client ID (Cá nhân)
1. Kích hoạt **Google Sheets API** trên Cloud Console.
2. Tạo credential loại **OAuth client ID** (chọn loại ứng dụng là **Desktop App**) và tải tệp JSON về.
3. Đổi tên tệp thành **`credentials.json`** và di chuyển vào thư mục `credentials` ở trên.
4. Lần đầu tiên bạn chạy lệnh, một trình duyệt web sẽ mở ra yêu cầu đăng nhập tài khoản Google để cấp quyền. Hệ thống sẽ tự sinh ra file `token.json` để sử dụng cho các lần sau.

---

## 💬 Hướng Dẫn Sử Dụng Trong Chat (Với Antigravity Agent)

Khi làm việc với Agent, bạn chỉ cần ra lệnh bằng ngôn ngữ tự nhiên theo các cú pháp đơn giản sau:

### Trình huống 1: Đẩy từ file testcase có sẵn trong dự án
> Hãy đẩy testcase từ tệp `docs/test_cases/tc_import_export.md` vào gg sheet: `https://docs.google.com/spreadsheets/d/157gUV-Yh4GoOwtrRERcsZdDQpZ52KK-uLGCIQT3C6GI/edit?gid=656341314#gid=656341314`

### Trình huống 2: Đẩy trực tiếp bảng vừa sinh ra trong đoạn hội thoại
> Đẩy kịch bản test vừa tạo ở trên lên Google Sheet giúp tôi: `https://docs.google.com/spreadsheets/d/157gUV-Yh4GoOwtrRERcsZdDQpZ52KK-uLGCIQT3C6GI/edit?gid=656341314#gid=656341314`

---

## 💻 Hướng Dẫn Chạy Bằng Lệnh Terminal (Dành cho Developer/QA chạy trực tiếp)

Nếu bạn muốn chạy script trực tiếp từ PowerShell hoặc Command Prompt:

### 1. Di chuyển vào thư mục dự án
```powershell
cd c:\Users\thai.hoang.dinh\Antigravity_QC
```

### 2. Chạy lệnh đẩy dữ liệu từ một file kịch bản (.md)
Sử dụng tham số `--url` để truyền link sheet và `--file` để truyền đường dẫn file testcase:
```bash
python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<Đường_Dẫn_Google_Sheet>" --file "docs/test_cases/tc_import_export.md"
```

### 3. Chạy lệnh đẩy trực tiếp chuỗi văn bản Markdown
Sử dụng tham số `--content` để truyền trực tiếp chuỗi markdown chứa bảng testcase:
```bash
python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<Đường_Dẫn_Google_Sheet>" --content "| TC ID | Module | ... |"
```
