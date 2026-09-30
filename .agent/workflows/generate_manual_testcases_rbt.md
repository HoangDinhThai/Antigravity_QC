---
description: Sinh manual test cases chất lượng cao theo quy trình AI-RBT 6 bước (Risk-Based Testing) từ requirements.
skills:
  - rbt_manual_testing
  - requirements_analyzer
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`rbt_manual_testing`** (tại `.agent/skills/rbt_manual_testing/SKILL.md`) trước khi bắt đầu thực hiện tác vụ này. Sử dụng **Mode FULL RBT** của skill. Ngoài ra, tham khảo thêm skill **`requirements_analyzer`** để hiểu cách phân tích giao diện nếu cần.

# Workflow: Sinh Manual Test Cases theo AI-RBT Framework (FULL RBT Mode)

Workflow này sử dụng **Mode FULL RBT** của skill `rbt_manual_testing` — quy trình **AI-RBT (AI-Driven Risk-Based Testing)** gồm 6 bước tuần tự để sinh manual test cases từ tài liệu yêu cầu.

> [!NOTE]
> **Luồng này dành cho Antigravity (slash command).** Agent thực hiện theo hướng dẫn trong skill, KHÔNG cần đọc file prompt.txt.
> Nếu QA team muốn dùng prompt chi tiết hơn (ChatGPT/Claude), hãy copy-paste từng bước từ `plans/manual/01-06/prompt.txt`.

## ⚠️ Nguyên tắc thực thi

- **Mode:** FULL RBT (6 bước tuần tự)
- **BẮT BUỘC chạy tuần tự** từng bước, KHÔNG gộp nhiều bước
- **PHẢI dừng lại** chờ user phản hồi tại Bước 2 (Q&A) và Bước 4 (Review Scenarios)
- Nếu user chưa cung cấp requirements, hỏi user cung cấp trước khi bắt đầu
- **Ngôn ngữ thuần Việt (BẮT BUỘC):** Tất cả output và nội dung test case viết bằng **Tiếng Việt thuần túy**, diễn giải theo góc nhìn người dùng/nghiệp vụ. **TUYỆT ĐỐI CẤM** viết tiếng Việt pha trộn tiếng Anh kỹ thuật hoặc chèn tên CSS class, selector, thuộc tính DOM (như `(disabled)`, `(.modal-title)`, `CheckCircle class .is-readonly`, `input readonly`).

## Các bước thực hiện

Thực hiện theo hướng dẫn chi tiết trong skill `rbt_manual_testing` → phần **Mode 2: FULL RBT**.

### Bước 1: Khởi tạo ngữ cảnh (Context & Role-play)
1. Yêu cầu user cung cấp: tên dự án, mô tả hệ thống, mục tiêu MVP, tài liệu yêu cầu
2. Đọc kỹ tài liệu, xác nhận hiểu bối cảnh
3. **Chờ user xác nhận** → sang Bước 2

### Bước 2: Phân tích yêu cầu (Analysis & QnA)
1. Xác định Happy Path, Alternate Paths, Exception Paths
2. Phát hiện Ambiguities (thiếu sót, mâu thuẫn, chưa rõ ràng)
3. Đặt câu hỏi Q&A có đánh số (Q1, Q2...) cho user/PO/BA, kèm ngữ cảnh + assumption
4. **DỪNG LẠI — Chờ user trả lời câu hỏi** → sang Bước 3

### Bước 3: Phân rã hệ thống (Decomposition)
1. Chia tính năng thành Modules / Sub-modules
2. Mô tả chức năng từng Module + Dependencies giữa chúng

### Bước 4: Đảm bảo độ bao phủ (Traceability)
1. Map Module → mã Yêu cầu (REQ-01, REQ-02...)
2. Cross-check thiếu sót (Gap Analysis), liệt kê High-Level Scenarios
3. **Chờ user review** scenarios → sang Bước 5

### Bước 5: Sinh Test Case chi tiết (RBT & TC Generation)
1. Đánh giá Risk Level (High/Medium/Low) cho mỗi Module
2. Sinh test cases đầy đủ: Title, Pre-condition, Steps, Expected, Test Data, Priority
3. Áp dụng kỹ thuật: EP, BVA, Decision Table, State Transition
4. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê tất cả input fields trên form/UI đang test
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng
   - Tham chiếu **Bảng Field-Level Validation** trong skill `rbt_manual_testing`
   - **KHÔNG** gộp validation nhiều trường vào 1 TC
5. **Tuân thủ quy chuẩn ngôn ngữ:**
   - Dùng Tiếng Việt thuần túy mô tả hành vi: `bị vô hiệu hóa`, `ở chế độ chỉ đọc`, `tiêu đề hộp thoại`...
   - Cấm chèn CSS class, selector, thuộc tính DOM kỹ thuật vào các bước test và kết quả mong đợi.
6. Bao phủ đầy đủ: Happy Path, Negative, Boundary, Edge Cases
7. Test Data phải cụ thể (không placeholder chung)
8. Nếu quá nhiều → sinh từng Module, hỏi user để tiếp tục

### Bước 6: Chuẩn hóa Format (Template Mapping)
1. Đóng gói toàn bộ test cases vào bảng Markdown chuẩn 9 cột của dự án VNTEST:
   ```markdown
   | TC ID | Feature | Test Case Title_1 | Test Case Title_2 | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
   ```
2. **Quy chuẩn phân cấp tiêu đề 3 tầng (BẮT BUỘC):**
   - **Feature**: Khối tính năng lớn (ví dụ: `01. Bố cục & Hiển thị`, `02. Phân quyền & Điều kiện kích hoạt`...).
   - **Test Case Title_1**: Tên nhóm con / Chủ đề kiểm thử cấp 1 (ví dụ: `Quyền truy cập`, `Phiên đăng nhập`, `Phân quyền trường Tên Sale`...). Gom các test case liên tiếp để tự động gộp ô (Merge Cells).
   - **Test Case Title_2**: Tiêu đề kịch bản chi tiết.
     - **CẤM lặp lại tiền tố Title_1**: Không lặp lại tiền tố của Title_1 trong Title_2 (❌ CẤM: `Quyền truy cập - Người dùng chỉ có quyền xem` ➔ ✅ ĐÚNG: `Người dùng chỉ có quyền xem`).
     - **Chống trùng lặp ca đơn lẻ:** Nếu kịch bản đứng độc lập, không có phân nhánh con thì điền tên vào `Test Case Title_1`, còn `Test Case Title_2` **bắt buộc để trống `""`**. Tuyệt đối KHÔNG copy y hệt tên từ Title_1 sang Title_2.
     - **Quy tắc giá trị biên / độ dài:** Đi thẳng vào số liệu cụ thể, cực kỳ ngắn gọn (ví dụ: `Nhập 9 chữ số`, `Nhập 13 chữ số`, `Nhập 256 ký tự`; CẤM viết rườm rà kèm ngoặc đơn như `Nhập thiếu chữ số (9 số hoặc 11 số)`).
   - **Giãn cách dòng trong Steps & Expected Result:** Bắt buộc có dòng trống `<br><br>` giữa các ý đánh số.
3. Không được bỏ sót test case nào.
4. Lưu tệp testcase dưới dạng tệp Markdown tại thư mục `docs/test_cases/` (ví dụ: `docs/test_cases/tc_[ten_chuc_nang].md`).

### Bước 7: Đẩy Test Cases Lên Google Sheets (Tùy chọn)
Nếu người dùng cung cấp đường dẫn Google Sheets (ví dụ: `Hãy đẩy testcase từ <tệp> vào trong gg sheet: <url>`), hãy thực hiện:
1. Đảm bảo các thư viện python / nodejs cần thiết đã được cài đặt.
2. Nhắc nhở người dùng thiết lập file credentials xác thực Google API như hướng dẫn tại `SKILL.md` của skill `google_sheets_integration`.
3. Chạy script đẩy testcase (kèm tham số `--module` để hệ thống tự động đổi tên tab sheet sang tên module):
   ```bash
   node .agent/skills/google_sheets_integration/scripts/push_testcases.js --url "<url_gg_sheet>" --file "<duong_dan_file_markdown>" --module "<ten_module>"
   ```
   *(hoặc dùng python: `python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<url_gg_sheet>" --file "<duong_dan_file_markdown>" --module "<ten_module>" `)*
4. Báo cáo kết quả đẩy testcase và xác nhận tab sheet đã được đổi tên theo module thành công.

## Output

- Bảng Test Cases Markdown hoàn chỉnh được lưu tại `docs/test_cases/tc_[ten_chuc_nang].md`
- Traceability Matrix
- Danh sách Ambiguities đã giải quyết
- Dữ liệu test cases được đẩy trực tiếp lên các cột tương ứng trong Google Sheet (nếu thực hiện Bước 7)
