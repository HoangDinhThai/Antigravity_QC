---
description: Sinh manual test cases nhanh từ requirements (QUICK mode — không qua quy trình 6 bước).
skills:
  - rbt_manual_testing
---

> **BẮT BUỘC (MANDATORY SKILL):** Bạn PHẢI nạp và đọc kỹ nội dung của skill **`rbt_manual_testing`** (tại `.agent/skills/rbt_manual_testing/SKILL.md`) trước khi bắt đầu thực hiện tác vụ này. Sử dụng **Mode QUICK** của skill.

# Workflow: Sinh Manual Test Cases Nhanh từ Requirements

Workflow này sử dụng **Mode QUICK** của skill `rbt_manual_testing` để sinh test cases nhanh từ requirements đã sẵn có.

## ⚠️ Nguyên tắc

- **Mode:** QUICK (1 lượt duy nhất, không chờ user giữa chừng)
- Phù hợp cho module đơn giản, requirements đã rõ ràng
- Nếu phát hiện requirements quá phức tạp hoặc mơ hồ → **tự động chuyển sang FULL RBT** và thông báo user
- **Ngôn ngữ thuần Việt (BẮT BUỘC):** Tất cả output và nội dung test case viết bằng **Tiếng Việt thuần túy**, diễn giải theo góc nhìn người dùng/nghiệp vụ. **TUYỆT ĐỐI CẤM** viết tiếng Việt pha trộn tiếng Anh kỹ thuật hoặc chèn tên CSS class, selector, thuộc tính DOM (như `(disabled)`, `(.modal-title)`, `CheckCircle class .is-readonly`, `input readonly`).

## Các bước thực hiện

1. **Đọc và hiểu requirements** được user cung cấp
2. **Xác định các luồng chính:** Happy Path, Negative Path, Boundary Cases, Edge Cases
3. **Áp dụng kỹ thuật thiết kế test case tự động:**
   - Equivalence Partitioning (EP)
   - Boundary Value Analysis (BVA)
   - Decision Table (nếu có nhiều rules)
   - State Transition (nếu có workflow)
4. **Validation chuyên biệt từng trường (Field-Level Validation):**
   - Liệt kê tất cả input fields trên form/UI
   - Sinh validation TCs **riêng cho TỪNG trường** theo đặc tính riêng (text, email, phone, date, number, dropdown, file upload, password...)
   - Áp dụng **Bảng Field-Level Validation** trong skill `rbt_manual_testing` để chọn validation phù hợp
   - **KHÔNG** gộp validation nhiều trường vào 1 test case
5. **Sinh test cases đầy đủ fields theo chuẩn dự án:**
   - TC ID (format: `VNTEST_[MODULE]_TC_[SỐ 3 CHỮ SỐ]`)
   - Title 1 (Tên Feature / Phân nhóm chức năng)
   - Title 2 (Nếu có) (Tiêu đề kịch bản chi tiết)
   - Pre-conditions
   - Test Steps (đánh số, hành động nguyên tử)
   - Expected Results (đánh số tương ứng)
   - Test Data (**phải cụ thể**, không placeholder)
   - Priority (Critical / High / Medium / Low)
6. **Xuất ra bảng Markdown chuẩn và lưu vào thư mục** `docs/test_cases/` (ví dụ: `docs/test_cases/tc_[ten_chuc_nang].md`)
7. **Đẩy Test Cases lên Google Sheets (Tùy chọn)**: Nếu người dùng cung cấp đường dẫn Google Sheets, sử dụng skill `google_sheets_integration` để đẩy trực tiếp testcase lên Google Sheets (kèm `--module` để hệ thống tự động đổi tên tab sheet sang tên module):
   ```bash
   node .agent/skills/google_sheets_integration/scripts/push_testcases.js --url "<url_gg_sheet>" --file "<duong_dan_file_markdown>" --module "<ten_module>"
   ```
   *(hoặc dùng python: `python .agent/skills/google_sheets_integration/scripts/push_testcases.py --url "<url_gg_sheet>" --file "<duong_dan_file_markdown>" --module "<ten_module>" `)*

## Bảng Output

```
| TC ID | Title 1 | Title 2 (Nếu có) | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```

## Quy tắc quan trọng

- **Tuyệt đối không chèn class CSS/selector/thuộc tính tiếng Anh:** Không viết `(disabled)`, `(.modal-title)`, `CheckCircle class .is-readonly`. Phải dùng lời văn tiếng Việt mô tả trực quan: `bị vô hiệu hóa`, `tiêu đề popup`, `biểu tượng chỉ đọc`.
- Test Data phải cụ thể: `test_login_01@domain.com`, không phải "email hợp lệ"
- Phải bao gồm cả Positive, Negative, Boundary, và Edge cases
- Mỗi trường input phải có validation TCs riêng (không gộp nhiều trường vào 1 TC)
- TC ID theo format thống nhất `VNTEST_[MODULE]_TC_[SỐ 3 CHỮ SỐ]`
- Nếu quá nhiều TCs → chia thành Part 1, Part 2 và hỏi user

## Khi nào chuyển sang FULL RBT

Agent **tự động đề xuất chuyển mode** nếu phát hiện:
- Requirements mơ hồ, cần hỏi Q&A
- Scope lớn (>3 modules)
- Logic nghiệp vụ phức tạp, nhiều điều kiện chồng chéo
- User yêu cầu Traceability Matrix hoặc Risk Assessment