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

4. **Xuất ra bảng Markdown chuẩn**

## Bảng Output

```
| TC ID | Title 1 | Title 2 (Nếu có)| Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```