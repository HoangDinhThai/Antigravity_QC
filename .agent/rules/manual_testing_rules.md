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

3. **Xuất ra bảng Markdown chuẩn**

## Bảng Output

```
| TC ID | Module | Test Scenario | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```