---
name: RBT Manual Testing
description: Master skill sinh manual test cases chuẩn cho dự án VNTEST với 2 modes — QUICK (sinh nhanh từ requirements) và FULL RBT (quy trình AI-RBT 6 bước có đánh giá rủi ro).
---

# RBT Manual Testing

## 1. Description

Đây là **Master Skill** cho mọi tác vụ thiết kế và sinh manual test cases của dự án **VNTEST**. Skill cung cấp **2 chế độ hoạt động** (modes) phù hợp với từng quy mô:

| Mode | Khi nào dùng | Thời gian | Đặc điểm |
|------|-------------|-----------|----------|
| **QUICK** | Module đơn giản, yêu cầu đã rõ ràng, cần bộ TC hoàn chỉnh ngay | 1 lượt thực thi | Sinh trực tiếp bộ test case chi tiết |
| **FULL RBT** | Module phức tạp, hệ thống lớn, cần phân tích rủi ro bài bản | 6 bước tuần tự | Có các điểm dừng (checkpoint) để chốt với User/PO |

**Nguyên tắc cốt lõi:**
- **Human Strategy:** Con người xác định chiến lược, mức độ rủi ro và các tiêu chuẩn nghiệp vụ.
- **AI Execution:** AI thực hiện phân tích, viết kịch bản chi tiết, bám sát validation và rà soát lỗ hổng.
- **Human Verification:** Con người kiểm tra lại kết quả trước khi chốt hoặc đẩy lên Google Sheets.

---

## 2. Bảng Markdown Chuẩn của Dự án (BẮT BUỘC)

Tất cả các test cases sinh ra (dù ở Mode QUICK hay FULL RBT) **BẮT BUỘC** phải tuân theo cấu trúc bảng Markdown sau:

```markdown
| TC ID | Title 1 | Title 2 (Nếu có) | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

### Chi tiết các cột:
1. **`TC ID`**: Mã kịch bản chuẩn hóa dạng `VNTEST_[MODULE]_TC_[SỐ 3 CHỮ SỐ]` (Ví dụ: `VNTEST_PERSONNEL_DETAIL_TC_001`, `VNTEST_CONTRACT_TC_045`).
2. **`Title 1`**: Tên Phân nhóm kịch bản / Khối tính năng / Feature (Ví dụ: `Mở / Đóng Sheet`, `Tab Thông tin — Khối 1: Thông tin cá nhân`, `Phân quyền truy cập`).
3. **`Title 2 (Nếu có)`**: Tiêu đề kịch bản kiểm thử cụ thể, phản ánh rõ mục đích của ca kiểm thử.
4. **`Pre-Condition`**: Tiền điều kiện rõ ràng (Tài khoản nào đã đăng nhập, đang đứng tại màn hình/URL nào, bản ghi nào đã tồn tại trong CSDL).
5. **`Test Steps`**: Các hành động nguyên tử (Atomic actions), đánh số thứ tự và nối bằng ` -> ` hoặc xuống dòng bằng `<br>` trong cell.
   * *Ví dụ:* `1. Tìm nhân sự NS-0028 -> 2. Nhấp vào liên kết Họ và tên -> 3. Quan sát góc phải màn hình.`
6. **`Test Data`**: **NGHIÊM CẤM** dùng từ chung chung/placeholder như `"Nhập đúng"`, `"Nhập sai mật khẩu"`, `"Nhập email hợp lệ"`. **BẮT BUỘC** dữ liệu thực tế:
   * *Đúng:* `admin@vntest.vn`, `NS-0028`, `0987654321`, `001201012345`, `<script>alert(1)</script>`.
7. **`Expected Result`**: Kết quả mong đợi đánh số tương ứng với các bước, dùng `<br>` xuống dòng:
   * *Ví dụ:* `1. Sheet chi tiết trượt mở từ mép phải.<br>2. Hiển thị đúng hồ sơ nhân sự NS-0028.<br>3. Backdrop hiển thị làm mờ màn hình danh sách.`
8. **`Priority`**: Mức độ ưu tiên chuẩn hóa theo 4 mức: `Critical`, `High`, `Medium`, `Low`.

---

## 3. Ràng buộc Dữ liệu & Kiểm thử chuyên biệt từng trường (Field-Level Validation)

### 3.1. Ràng buộc Test Data (BẮT BUỘC)
```
❌ Sai: "Nhập mã số hợp lệ"
✅ Đúng: "Nhập mã: KH-2026-0012"

❌ Sai: "Nhập email hợp lệ"
✅ Đúng: "Nhập email: user01@vntest.vn"

❌ Sai: "Nhập giá trị vượt giới hạn"
✅ Đúng: "Nhập chuỗi 256 ký tự vào ô Họ và tên (giới hạn max: 255)"
```

### 3.2. Bảng Field-Level Validation (CẤM GỘP TRƯỜNG)
Khi màn hình có các trường nhập liệu, agent **BẮT BUỘC** phải sinh kịch bản kiểm tra riêng cho **TỪNG TRƯỜNG** theo bảng đặc tính sau:

| Loại trường | Validation cần kiểm thử |
|---|---|
| **Họ và tên / Text chung** | Bắt buộc (bỏ trống) · Giới hạn ký tự (Min/Max) · Chỉ chứa khoảng trắng (whitespace-only) · Ký tự đặc biệt · XSS Injection (`<script>alert(1)</script>`) · SQL Injection (`' OR 1=1--`) · Khoảng trắng đầu/cuối chuỗi. |
| **Email** | Format hợp lệ (`name@vntest.vn`) · Thiếu `@` · Thiếu domain · Nhiều ký tự `@` · Email đã tồn tại trong hệ thống (Duplicate check). |
| **Số điện thoại** | Chỉ chấp nhận chữ số · Đầu số hợp lệ (`03`, `05`, `07`, `08`, `09`, `+84`) · Độ dài không đủ 10 số (ví dụ: 9 số) · Quá 11 số · Chứa chữ cái hoặc ký tự đặc biệt · Kiểm tra trùng lặp. |
| **CCCD / CMTND** | Đúng định dạng 12 chữ số · Nhập 11 số hoặc 13 số · Chứa ký tự chữ · Trùng số CCCD với người khác trong hệ thống. |
| **Ngày tháng (Date)** | Đúng định dạng `dd/mm/yyyy` · Ngày không có thực (`31/02/2026`) · Ngày cấp CCCD lớn hơn ngày hiện tại · Ngày sinh < 18 tuổi hoặc > 65 tuổi (tùy business rule) · Chọn từ Datepicker popup. |
| **Số / Tiền tệ** | Nhập số âm · Nhập số 0 · Nhập chữ cái · Số thập phân (nếu chỉ cho phép số nguyên) · Giá trị vượt ngưỡng max (overflow). |
| **Dropdown / Select** | Giá trị mặc định · Tìm kiếm trong dropdown · Chọn giá trị hợp lệ · Bỏ trống khi là trường bắt buộc. |
| **Tệp đính kèm (Upload)** | File hợp lệ (.pdf, .jpg, .png) · File sai định dạng (.exe, .bat, .zip) · File vượt dung lượng tối đa (> 10MB) · File dung lượng 0KB. |
| **Mật khẩu** | Độ dài tối thiểu/tối đa · Chữ hoa, chữ thường, số, ký tự đặc biệt · Xác nhận mật khẩu không khớp · Ẩn/Hiện mật khẩu · Copy-paste mật khẩu. |

> ⚠️ **Nguyên tắc bất biến:** Mỗi trường có đặc tính riêng biệt → phải có test case validation riêng. **TUYỆT ĐỐI KHÔNG** gộp validation của nhiều trường vào một kịch bản chung.

---

## 4. Các Nhóm Kịch bản Bắt buộc Bao phủ

Một bộ Test Cases hoàn chỉnh cho bất kỳ tính năng nào của VNTEST **BẮT BUỘC** phải có đầy đủ các nhóm sau:

1. **Nhóm Phân quyền & Điều kiện truy cập (RBAC Matrix):**
   - Tài khoản có quyền (Admin, Quản lý...) thao tác thành công.
   - Tài khoản không có quyền: Bị ẩn nút hoặc chuyển hướng sang màn hình lỗi 403 Forbidden kèm thông báo: `"Bạn không có quyền thực hiện thao tác này."`
2. **Nhóm Bố cục Giao diện & Điều hướng UI:**
   - Mở/Đóng Sheet / Modal bằng nút thao tác, nút Đóng [×], phím Esc, hoặc click ra ngoài vùng mờ Backdrop.
   - Chuyển đổi giữa các Tabs (nếu có), đảm bảo dữ liệu hiển thị đúng tab.
3. **Nhóm Luồng Nghiệp vụ Chính (Happy Path):**
   - Nhập đầy đủ thông tin hợp lệ -> Lưu thành công -> Hiển thị Toast thông báo thành công -> Tự động đóng form và cập nhật danh sách cha.
   - Luồng `[Lưu & tạo tiếp]`: Lưu bản ghi thành công, reset form về trống và giữ nguyên form mở để nhập tiếp.
4. **Nhóm Field-Level Validation & Dữ liệu Biên:**
   - Kiểm tra lần lượt từng trường theo Bảng Field-Level Validation ở Mục 3.2.
5. **Nhóm Kiểm tra Trùng lặp (Duplicate Check):**
   - Nhập trùng CCCD, SĐT, Email với bản ghi đã tồn tại trong DB -> Chặn lưu và hiển thị câu cảnh báo lỗi chính xác.
6. **Nhóm Trạng thái Giao diện Đặc thù (UI Scenarios):**
   - **Cơ chế bảo vệ thay đổi chưa lưu (Unsaved Changes Guard):** Khi form đã bị chỉnh sửa (`isDirty`), người dùng bấm Hủy / Đóng / Click Backdrop -> Bật popup xác nhận: `"Bạn có các thay đổi chưa lưu. Bạn có chắc chắn muốn thoát?"`.
   - **Trạng thái đang lưu (Saving State):** Nút Lưu hiển thị icon loading spinner, vô hiệu hóa toàn bộ nút để chống double-click.
   - **Xử lý lỗi hệ thống:** Giả lập API trả về lỗi 500 hoặc mất mạng -> Hiển thị banner lỗi màu đỏ kèm nút Thử lại.
7. **Nhóm An ninh & Bảo mật:**
   - Nhập chuỗi XSS Injection (`<script>alert(1)</script>`) vào các trường text -> Hệ thống escape an toàn, không thực thi script.
   - Nhập chuỗi SQL Injection (`admin' OR 1=1--`) -> Không gây lỗi hệ thống hoặc lộ dữ liệu.
   - Tuyệt đối không hiển thị mật khẩu ở dạng plain-text tại màn hình xem chi tiết.

---

## 5. Hướng Dẫn Vận Hành 2 Modes

### 5.1. Mode 1: QUICK (Sinh Test Cases Nhanh)
- **Áp dụng khi:** Người dùng yêu cầu tạo nhanh test cases cho một tính năng/form đã có tài liệu yêu cầu.
- **Quy trình:**
  1. Đọc và phân tích kỹ tài liệu yêu cầu (trong `docs/requirements/` hoặc nội dung được cung cấp).
  2. Tự động áp dụng Equivalence Partitioning (EP), Boundary Value Analysis (BVA), và Checklist Validation từng trường.
  3. Lên danh sách kịch bản bao phủ đủ 7 nhóm ở Mục 4.
  4. Xuất trực tiếp bảng Markdown chuẩn ra file `docs/test_cases/tc_<feature_name>.md`.

### 5.2. Mode 2: FULL RBT (Quy Trình 6 Bước Tuần Tự)
- **Áp dụng khi:** Module phức tạp, quy mô lớn, cần đánh giá rủi ro và có sự tham gia chốt của User/PO.
- **BẮT BUỘC CHẠY TUẦN TỰ:**
  - **Bước 1 (Context & Scope):** Xác nhận bối cảnh, hiểu rõ mục tiêu và phạm vi tính năng.
  - **Bước 2 (Analysis & QnA):** Phân tích tài liệu, tìm điểm mờ (Ambiguities), đặt câu hỏi Q&A có đánh số (Q1, Q2...) và **DỪNG LẠI CHỜ USER TRẢ LỜI**.
  - **Bước 3 (Decomposition):** Phân rã tính năng thành các Modules / Khối chức năng nhỏ và xác định sự phụ thuộc.
  - **Bước 4 (Traceability Matrix):** Lập ma trận truy vết giữa yêu cầu (REQ) và High-level Test Scenarios. **Chờ user review**.
  - **Bước 5 (RBT Generation):** Đánh giá mức độ rủi ro (High/Medium/Low Risk) cho từng khối và sinh chi tiết các test cases.
  - **Bước 6 (Template Mapping):** Đóng gói toàn bộ test cases vào Bảng Markdown chuẩn (Mục 2) và lưu vào `docs/test_cases/tc_<feature_name>.md`.

---

## 6. Quy tắc Lưu trữ & Tích hợp
1. **Thư mục lưu file:** Tất cả các bộ test case tạo ra phải được lưu dưới dạng file Markdown tại:
   `docs/test_cases/tc_<tên_tính_năng>.md` (Ví dụ: `docs/test_cases/tc_personnel_detail_sheet.md`).
2. **Sẵn sàng tích hợp Google Sheets:** Bảng Markdown sinh ra từ skill này luôn tương thích 100% với skill `google_sheets_integration` để có thể tự động bóc tách và đẩy lên Google Sheets của dự án.
