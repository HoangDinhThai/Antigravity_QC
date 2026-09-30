---
trigger: always_on
---

# MANUAL TESTING RULES

**Luật này áp dụng BẮT BUỘC cho mọi tác vụ sinh Test Case thủ công.**

1. **Ràng buộc Dữ liệu (Test Data):**
   - CẤM: "Nhập tài khoản đúng", "Nhập sai mật khẩu", "Mã giảm giá hết hạn".
   - BẮT BUỘC: `user01@test.com`, `Abc@12345`, `EXPIRED_COUPON_2023`.

2. **Cấu trúc Bước test (Test Steps):**
   - Phải là các hành động nguyên tử (Atomic actions).
   - Ví dụ chuẩn: "1. Nhập email: abc@test.com -> 2. Nhập password: 123 -> 3. Click nút Đăng nhập".

3. **Quy Chuẩn Ngôn Ngữ & Cấm Kỹ Thuật Hóa (BẮT BUỘC & CỰC KỲ QUAN TRỌNG):**
   - **BẮT BUỘC:** Viết test case hoàn toàn bằng **Tiếng Việt thuần túy, tự nhiên, chuẩn mực theo góc nhìn người dùng cuối (End-User) và nghiệp vụ (Business)**.
   - **CẤM TUYỆT ĐỐI:**
     - CẤM viết test case nửa nạc nửa mỡ trộn tiếng Việt lẫn tiếng Anh kỹ thuật.
     - CẤM đưa tên CSS class, CSS selector, DOM element, ID, HTML tag, HTML attribute vào các cột (`Test Steps`, `Expected Result`, `Pre-Condition`, `Title`).
   - **Bảng đối chiếu chuẩn:**
     - ❌ CẤM: `Nút Lưu (disabled)` ➔ ✅ ĐÚNG: `Nút "Lưu" bị vô hiệu hóa (làm mờ, không thể bấm)`
     - ❌ CẤM: `Tiêu đề (.modal-title) hiển thị...` ➔ ✅ ĐÚNG: `Tiêu đề cửa sổ/hộp thoại hiển thị...`
     - ❌ CẤM: `Biểu tượng CheckCircle class .is-readonly` ➔ ✅ ĐÚNG: `Biểu tượng dấu tích xanh ở trạng thái chỉ đọc`
     - ❌ CẤM: `Trường Email (readonly)` ➔ ✅ ĐÚNG: `Trường "Email" ở chế độ chỉ đọc (không thể chỉnh sửa)`
     - ❌ CẤM: `Nhấp button .btn-close` ➔ ✅ ĐÚNG: `Nhấp vào nút "Đóng" [×]`
     - ❌ CẤM: `Hiển thị spinner loading` ➔ ✅ ĐÚNG: `Hiển thị biểu tượng vòng xoay đang tải dữ liệu`

4. **Quy Chuẩn Phân Cấp Tiêu Đề 3 Tầng & Đặt Tên Kịch Bản (BẮT BUỘC):**
   - **Tầng 1 - `Feature`**: Khối chức năng / nhóm tính năng lớn (ví dụ: `01. Bố cục & Hiển thị`, `02. Phân quyền & Điều kiện kích hoạt`, `03. Luồng nghiệp vụ chính`, `04. Field Validation`...).
   - **Tầng 2 - `Test Case Title_1`**: Nhóm con / Chủ đề kiểm thử cấp 1 (ví dụ: `Quyền truy cập`, `Phiên đăng nhập`, `Phân quyền trường Tên Sale`, `Kiểm tra trường Mã KH`...).
     - Tất cả các test case cùng chủ đề con này sẽ được gom nhóm liền kề để tự động gộp ô (Merge Cells).
   - **Tầng 3 - `Test Case Title_2`**: Kịch bản kiểm thử chi tiết.
     - **CẤM LẶP LẠI TIỀN TỐ:** Tuyệt đối không lặp lại tên Title_1 trong Title_2 (❌ CẤM: `Quyền truy cập - Người dùng chỉ có quyền xem` ➔ ✅ ĐÚNG: `Người dùng chỉ có quyền xem`).
     - **CẤM NHÂN ĐÔI TRÙNG LẶP (Case Đơn lẻ):** Nếu một kịch bản đứng độc lập, không có phân nhánh con thì điền tên vào `Test Case Title_1`, còn `Test Case Title_2` **bắt buộc để trống `""`**, TUYỆT ĐỐI KHÔNG copy y hệt tên từ Title_1 sang Title_2.
       - ❌ CẤM: Title_1: `Thêm mới một khối Người liên hệ`, Title_2: `Thêm mới một khối Người liên hệ`.
       - ✅ ĐÚNG: Title_1: `Thêm mới một khối Người liên hệ`, Title_2: `""` (Để trống).
       - ❌ CẤM: Title_1: `Tìm kiếm và chọn hợp đồng từ danh sách`, Title_2: `Tìm kiếm và chọn hợp đồng từ danh sách`.
       - ✅ ĐÚNG: Title_1: `Tìm kiếm và chọn hợp đồng từ danh sách`, Title_2: `""` (Để trống).
   - **Quy tắc đặt tên Ca kiểm thử Giá trị biên / Độ dài (CỰC KỲ NGẮN GỌN & ĐI THẲNG VÀO SỐ LIỆU):**
     - Tuyệt đối không giải thích dài dòng hoặc chèn ngoặc đơn rườm rà.
     - ❌ CẤM: `Nhập thiếu chữ số (9 số hoặc 11 số)` ➔ ✅ ĐÚNG: `Nhập 9 chữ số` (hoặc `Nhập 11 chữ số`).
     - ❌ CẤM: `Nhập vượt quá 12 chữ số (13 số)` ➔ ✅ ĐÚNG: `Nhập 13 chữ số`.
     - ❌ CẤM: `Nhập chuỗi dài vượt quá biên tối đa (256 ký tự)` ➔ ✅ ĐÚNG: `Nhập 256 ký tự`.

5. **Quy Chuẩn Giãn Cách Dòng Trong Expected Result & Test Steps (BẮT BUỘC):**
   - Khi trình bày các ý đánh số (`1. ...`, `2. ...`, `3. ...`) trong cột `Expected Result` (và `Test Steps`):
   - **BẮT BUỘC phải có khoảng cách dòng trống** giữa các ý (dùng `<br><br>` trong bảng Markdown, hoặc 2 dấu xuống dòng `\n\n` trên Google Sheets) để văn bản thoáng đãng, trực quan, dễ theo dõi, không bị dính chùm vào nhau thành khối chữ khó nhìn.

6. **Xuất ra bảng Markdown chuẩn**

## Bảng Output

```markdown
| TC ID | Feature | Test Case Title_1 | Test Case Title_2 | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```