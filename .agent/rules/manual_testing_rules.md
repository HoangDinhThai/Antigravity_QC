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

4. **Quy Chuẩn Phân Cấp Tiêu Đề 3 Tầng (BẮT BUỘC):**
   - **Tầng 1 - `Feature`**: Khối chức năng / nhóm tính năng lớn (ví dụ: `01. Bố cục & Hiển thị`, `02. Phân quyền & Điều kiện kích hoạt`, `03. Luồng nghiệp vụ chính`, `04. Field Validation`...).
   - **Tầng 2 - `Test Case Title_1`**: Nhóm con / Chủ đề kiểm thử cấp 1 (ví dụ: `Quyền truy cập`, `Phiên đăng nhập`, `Phân quyền trường Tên Sale`, `Kiểm tra trường Mã KH`...).
     - Tất cả các test case cùng chủ đề con này sẽ được gom nhóm liền kề để tự động gộp ô (Merge Cells).
   - **Tầng 3 - `Test Case Title_2`**: Kịch bản kiểm thử chi tiết (ví dụ: `Người dùng chỉ có quyền xem`, `Cố tình truy cập trái phép bằng đường dẫn trực tiếp`, `Nhân viên kinh doanh thông thường`).
     - **CẤM TUYỆT ĐỐI lặp lại tiền tố:** Không lặp lại tiền tố của Title_1 trong Title_2 (❌ CẤM: `Quyền truy cập - Người dùng chỉ có quyền xem` ➔ ✅ ĐÚNG: Title_1: `Quyền truy cập`, Title_2: `Người dùng chỉ có quyền xem`).
     - **Quy tắc ca đơn lẻ (Không có kịch bản con):** Nếu ca kiểm thử độc lập không có các nhánh con, điền tên vào `Test Case Title_1`, còn `Test Case Title_2` **bắt buộc để trống `""`**. CẤM copy lặp lại y hệt nội dung của Title_1 sang Title_2.
   - **Quy tắc đặt tên giá trị biên / độ dài (Cực kỳ ngắn gọn, đi thẳng vào số liệu):**
     - Đặt tên ngắn gọn, nêu rõ số lượng/kích thước giá trị thử nghiệm, không viết câu giải thích dài dòng kèm ngoặc đơn.
     - ❌ CẤM: `Nhập thiếu chữ số (9 số hoặc 11 số)` ➔ ✅ ĐÚNG: `Nhập 9 chữ số` (hoặc `Nhập 11 chữ số`)
     - ❌ CẤM: `Nhập vượt quá 12 chữ số (13 số)` ➔ ✅ ĐÚNG: `Nhập 13 chữ số`
     - ❌ CẤM: `Nhập quá ký tự tối đa (256 ký tự)` ➔ ✅ ĐÚNG: `Nhập 256 ký tự`

5. **Quy Chuẩn Giãn Cách Dòng Trong Steps & Expected Result (BẮT BUỘC):**
   - Giữa các ý đánh số (`1. ...`, `2. ...`) hoặc gạch đầu dòng, **bắt buộc có 1 dòng trống** (`<br><br>` trong Markdown hoặc 2 dấu xuống dòng `\n\n` trên Google Sheet) để nhìn thoáng mắt, dễ theo dõi, tuyệt đối không viết dính sát một dòng.

6. **Xuất ra bảng Markdown chuẩn 9 cột:**

```markdown
| TC ID | Feature | Test Case Title_1 | Test Case Title_2 | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```