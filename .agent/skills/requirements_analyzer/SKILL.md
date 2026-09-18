---
name: requirements_analyzer
description: Kỹ năng phân tích màn hình/tính năng/UI Prototype và sinh ra Tài liệu Đặc tả Yêu cầu Chức năng (Requirements Specification) chuyên nghiệp chuẩn 10-12 phần theo quy chuẩn dự án VNTEST.
---

# Kỹ năng Phân tích Yêu cầu Chức năng (Requirements Analyzer)

Kỹ năng này hướng dẫn AI (Antigravity) phân tích chi tiết giao diện UI, Prototype, luồng nghiệp vụ hoặc cấu trúc DOM/HTML để sinh ra **Tài liệu Đặc tả Yêu cầu Chức năng (Requirements Specification Document)** hoàn chỉnh, chuyên nghiệp, phục vụ trực tiếp cho QA, Tester, Developer và Product Owner.

---

## 1. Mục tiêu cốt lõi
- Xây dựng tài liệu yêu cầu bám sát thực tế hệ thống đang chạy và các kịch bản Prototype UI.
- Đảm bảo tính nhất quán, bao quát toàn diện cả Happy Path, Phân quyền RBAC, Field Validations và Exception / Edge Cases.
- Định dạng chuẩn mực theo bộ khung 10–12 phần của dự án, xuất ra file Markdown tại thư mục `docs/requirements/req_<tên_tính_năng>.md`.

---

## 2. Quy trình trích xuất & Phân tích
Khi được yêu cầu phân tích yêu cầu từ URL, tài liệu thô hoặc UI Prototype:
1. **Khảo sát Tổng thể & Scenarios:**
   - Xác định vị trí phân hệ (ví dụ: `KH - ĐT - HĐ`, `NS`...), URL màn hình gốc, đối tượng sử dụng và các đường link kịch bản giao diện (Default, Invalid, Error, Saving, Unsaved Guard, Duplicate...).
2. **Thu thập Biểu mẫu & Form Inputs:**
   - Liệt kê toàn bộ các trường nhập liệu (`input`, `select`, `textarea`, `checkbox`, `radio`, `file upload`).
   - Ghi nhận thuộc tính chi tiết: nhãn (Label), kiểu dữ liệu (Type), bắt buộc (Required), min/max length, pattern regex, placeholder, giá trị mặc định.
3. **Phân tích Phân quyền (RBAC Matrix):**
   - Xác định quyền hạn của từng vai trò (Admin, Trưởng phòng, Quản trị kinh doanh, Nhân viên, Kế toán, KTV...). Nút nào được hiển thị, trường nào chỉ xem (read-only), thao tác nào bị chặn (403 Forbidden).
4. **Thu thập Nút bấm & Tương tác (Action Buttons Matrix):**
   - Nút Lưu, Lưu & tạo tiếp, Hủy, Đóng, Xóa, Đặt lại mật khẩu, Xuất file...
   - Trạng thái nút (Enable, Disabled, Loading spinner, UI lock).
   - Hộp thoại xác nhận (Modal) đi kèm và hành vi khi bấm Xác nhận/Hủy.
5. **Xác định Quy tắc Nghiệp vụ & Thông báo Lỗi (Business Rules & Errors):**
   - Kiểm tra trùng lặp (Duplicate check: CCCD, SĐT, Email, Mã số).
   - Cơ chế bảo vệ dữ liệu chưa lưu (`Unsaved Changes Guard` khi form `isDirty`).
   - Câu thông báo lỗi cụ thể (Validation error text) tại từng trường hoặc Banner/Toast notification.
6. **Kiến trúc CSDL & Phía nền (Backend & Audit Logs):**
   - Các bảng dữ liệu liên quan (`users`, `partners`, `audit_logs`...).
   - Quy tắc ghi log lịch sử hệ thống (`system_audit_logs`).
   - Danh sách API endpoints dự kiến.

---

## 3. Cấu trúc Tài liệu Đặc tả Chuẩn (Output Structure)

Tài liệu xuất ra **BẮT BUỘC** tuân thủ cấu trúc sau:

### 3.0. Header & Bảng Thông tin Tài liệu (Document Metadata)
```markdown
# 📋 TÀI LIỆU ĐẶC TẢ YÊU CẦU CHỨC NĂNG (REQUIREMENTS SPECIFICATION)
## Phân hệ: [Tên phân hệ] — Hệ thống VNTEST LIMS
### Tính năng: [Tên tính năng / Màn hình]

---

| Thông tin tài liệu | Chi tiết |
| :--- | :--- |
| **Mã tài liệu** | `REQ_VNTEST_[MODULE]_[FEATURE]` |
| **Tính năng / Màn hình** | [Tên modal / Sheet / Trang] |
| **Đường dẫn truy cập gốc** | `/[path]` |
| **Đối tượng sử dụng** | Quản trị viên, Trưởng phòng, Nhân viên... |
| **Phân quyền truy cập** | Quyền Xem / Tạo mới / Chỉnh sửa / Xóa |
| **Trạng thái tài liệu** | `Ready for Review & Testing` |
| **Cơ sở dữ liệu liên kết** | [Bảng CSDL liên quan] |
| **Link Prototype UI** | • Mặc định: [URL]<br>• Dữ liệu không hợp lệ: [URL]<br>• Lỗi hệ thống: [URL]<br>• Cảnh báo thay đổi chưa lưu: [URL] |
```

### 3.1. Mục lục Điều hướng Nhanh
Liệt kê các anchor link tới từng phần bên dưới.

### 3.2. Nội dung Chi tiết 10–12 Phần:

#### 1. ĐỊNH VỊ MÀN HÌNH & TỔNG QUAN TÍNH NĂNG (OVERVIEW & UI WIREFRAME)
- **1.1. Định vị màn hình & Vấn đề giải quyết:** Nêu rõ vị trí màn hình trong hệ thống, loại giao diện (Modal dialog, Slide-over sheet drawer 660px, hoặc Trang danh sách table), vấn đề nghiệp vụ giải quyết.
- **1.2. Mô tả cụ thể tính năng:** Tóm tắt chi tiết các nhóm thông tin, luồng thao tác chính, cơ chế bảo vệ form chưa lưu (Unsaved Guard).
- **1.3. Bố cục Giao diện (UI Layout Wireframe):** Khung ASCII/text wireframe trực quan thể hiện rõ các khối header, body inputs, footer actions.

#### 2. PHÂN QUYỀN & ĐIỀU KIỆN KÍCH HOẠT (ACCESS & PERMISSIONS)
- Bảng ma trận phân quyền chi tiết theo từng vai trò (Role):
  `| Vai trò (Role) | Thấy nút bấm | Quyền thao tác | Phạm vi dữ liệu | Ghi chú |`
- Xử lý chặn truy cập trái phép: Trả về mã lỗi 403 Forbidden hoặc ẩn hoàn toàn nút chức năng.

#### 3. THIẾT KẾ MÀN HÌNH & CÁC KỊCH BẢN GIAO DIỆN (UI SCENARIOS & LAYOUT)
Liệt kê và mô tả chi tiết tất cả các kịch bản giao diện:
- Kịch bản 1: Mặc định (Form trống / Dữ liệu khởi tạo)
- Kịch bản 2: Thông tin không hợp lệ (Validation Errors)
- Kịch bản 3: Không lưu được dữ liệu / Lỗi hệ thống (System Error Banner)
- Kịch bản 4: Trạng thái đang lưu (Saving Spinner & UI Lock)
- Kịch bản 5: Có thay đổi chưa lưu (Unsaved Changes Guard modal)
- Kịch bản 6: Dữ liệu bị trùng lặp (Duplicate Check Alert)
- Kịch bản 7: Kịch bản phân quyền theo vai trò (Role-specific UI view)

#### 4. ĐẶC TẢ CHI TIẾT CÁC USE CASES CHỨC NĂNG (FUNCTIONAL USE CASES)
Chia thành từng Use Case rõ ràng:
- **Use Case ID & Tên** (ví dụ: `UC_CREATE_01: Tạo mới bản ghi`)
- **Tác nhân (Actor)**
- **Tiền điều kiện (Pre-conditions)**
- **Luồng sự kiện chính (Basic Flow / Happy Path):** Đánh số từng bước từ khi người dùng thao tác đến khi hệ thống phản hồi.
- **Luồng sự kiện thay thế (Alternative Flows):** Ví dụ: Lưu & tạo tiếp, chọn loại chiết khấu khác...
- **Luồng ngoại lệ (Exception Flows):** Nhập sai định dạng, trùng lặp, mất kết nối mạng...
- **Hậu điều kiện (Post-conditions):** Bản ghi được lưu, đóng modal, danh sách tự động refresh.

#### 5. ĐẶC TẢ CHI TIẾT TRƯỜNG DỮ LIỆU (FIELD SPECIFICATIONS MATRIX)
Bảng ma trận bắt buộc mô tả chi tiết từng trường nhập liệu:
```markdown
| Tên trường (Field Name) | UI Label | Kiểu dữ liệu (Type) | Bắt buộc (Required) | Ràng buộc & Validation Rules | Giá trị mặc định / Placeholder | Ghi chú |
```
*Lưu ý:* CẤM gộp các trường. Mỗi trường phải có quy tắc độ dài (Min/Max length), định dạng chuẩn, RegEx (nếu có), kiểm tra unique.

#### 6. MA TRẬN NÚT BẤM & TƯƠNG TÁC GIAO DIỆN (ACTION BUTTONS MATRIX)
```markdown
| Tên nút (Button) | Vị trí | Icon / Class | Trạng thái mặc định | Điều kiện Kích hoạt | Hành vi khi click | Modal / Xác nhận đi kèm |
```
Mô tả rõ các nút: `[Lưu]`, `[Lưu & tạo tiếp]`, `[Hủy]`, `[Đóng]`, `[Xóa]`, `[Đặt lại mật khẩu]`...

#### 7. QUY TẮC NGHIỆP VỤ & LUỒNG XỬ LÝ LỖI (BUSINESS RULES & VALIDATION MATRIX)
- Bảng ma trận các mã lỗi và câu thông báo lỗi cụ thể:
  `| Mã lỗi (Code) | Quy tắc nghiệp vụ (Business Rule) | Điều kiện kích hoạt | Vị trí hiển thị | Câu thông báo lỗi hiển thị (Error Message) |`
- Câu thông báo lỗi phải viết nguyên văn Tiếng Việt đúng theo hệ thống.

#### 8. THIẾT KẾ CSDL & KIẾN TRÚC XỬ LÝ BACKEND (DATABASE & BACKEND ARCHITECTURE)
- **Bảng CSDL liên quan:** Danh sách bảng, khóa chính, khóa ngoại.
- **Kiểm toán hệ thống (Audit Logs):** Ghi nhận hành động vào bảng `system_audit_logs` (ai thực hiện, thời gian, IP, giá trị cũ/mới, ẩn các trường nhạy cảm như password).
- **Danh sách API Endpoints:** Phương thức (GET, POST, PUT, DELETE), Endpoint URI, Payload tóm tắt.

#### 9. YÊU CẦU PHI CHỨC NĂNG & TRẢI NGHIỆM NGƯỜI DÙNG (NON-FUNCTIONAL REQUIREMENTS)
- Tốc độ phản hồi API (< 500ms khi lưu dữ liệu bình thường).
- Cơ chế bảo vệ dữ liệu chưa lưu (`Unsaved Changes Guard`): Bật popup cảnh báo khi form bẩn (`isDirty`).
- Bảo mật: Mật khẩu mã hóa Bcrypt/Argon2, tuyệt đối không trả về phía client trong API chi tiết.
- Tính tiện dụng: Hỗ trợ phím tắt (`Enter` submit, `Esc` đóng modal), auto-focus vào ô đầu tiên.

#### 10. ĐIỂM CẦN LÀM RÕ VỚI PRODUCT OWNER / KHÁCH HÀNG (CLARIFICATIONS NEEDED)
- Đánh số câu hỏi `Q1`, `Q2`, `Q3`...
- Mỗi câu hỏi gồm: **Ngữ cảnh**, **Câu hỏi cần xác nhận**, **Đề xuất giải pháp mặc định (Assumption)** nếu chưa có phản hồi.

---

## 4. Quy tắc Bắt buộc (Strict Rules)
1. **Ngôn ngữ:** Luôn viết bằng **Tiếng Việt** chuẩn mực chuyên ngành công nghệ / QA.
2. **Tính toàn diện:** Không tự suy diễn tùy tiện logic phức tạp; nếu thiếu dữ kiện phải đưa vào mục "Điểm cần làm rõ".
3. **Lưu trữ file:** Mọi tài liệu phân tích yêu cầu phải được lưu thành file markdown tại đường dẫn:
   `docs/requirements/req_<tên_tính_năng>.md` (ví dụ: `docs/requirements/req_employee_create_modal.md`).
