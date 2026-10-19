---
name: bug-reporter
description: >
  Router skill for QC bug reporting.
  Standardize raw bug descriptions and evidence into a Bug draft, then delegate
  Backlog creation to `backlog-issue-manager` after confirmation.
---

# Bug Reporter

## Overview

This is a lightweight router skill for Bug-only intake.
Use for QC free-text bug reports with image/video evidence.

## Scope

- Only for **Bug** issues.
- For Feature/Change or JP customer structured flows, use `jp-issue-creator`.

## Mandatory Draft File Rule (Bắt Buộc Xuất File MD)

- **LUÔN LUÔN** phải tạo và lưu bản nháp Bug ra file Markdown (`.md`) tại thư mục: `backlog/draft/bug-<feature-name>.md` (kebab-case).
- Tạo thư mục `backlog/draft/bug-<feature-name>/` và copy đầy đủ các file ảnh/video bằng chứng (evidence) vào đó.
- **TUYỆT ĐỐI KHÔNG** chỉ xuất bản nháp ra khung chat mà bỏ quên bước ghi file `.md`.
- Trình bày đường dẫn file `.md` đã lưu cùng nội dung bản nháp ra chat để QC kiểm tra và phê duyệt.

## Classification Principles (Nguyên Tắc Phân Loại Bug)

Xem chi tiết đầy đủ tại `references/bug_rules.md`:
1. **Program Logic Bug Type (8 loại):**
   - `Interface Error`: Lỗi giao diện *(kích thước không đúng, label/message sai, vị trí/size sai...)*.
   - `Workflow`: Lỗi User Navigation *(Back sai, Save and Exit, Previous Page...)*.
   - `Functional Bug`: Lỗi chức năng cụ thể không hoạt động như dự định *(button Login không thực hiện được, bấm thêm giỏ hàng không phản hồi...)*.
   - `Logical Bug`: Bug logic luồng phần mềm *(validate sai, tính toán sai, crash, xử lý data sai...)*.
   - `Security Bug`: Phân quyền / Permission, các lỗi bảo mật khác (SQL injection, XSS...).
   - `Performance Problem`: Hiệu năng, thời gian phản hồi, tốc độ xử lý trang, bộ nhớ...
   - `UAT Bug`: Bug từ khách hàng trả về.
   - `Release Bug`: Bug phát sinh khi release.
2. **Bug Severity (3 mức):**
   - `Critical`: Ảnh hưởng nghiêm trọng đến sản phẩm/tiến độ, chặn người dùng sử dụng (sập hệ thống, hỏng data, hỏng hoàn toàn 1 tính năng).
   - `Major`: Ảnh hưởng nhưng không nghiêm trọng toàn bộ (vấn đề hiệu năng, mất dữ liệu khi tải nặng, chức năng khác vẫn chạy).
   - `Minor`: Hành vi không mong muốn nhưng hệ thống vẫn hoạt động bình thường (lỗi tài liệu, thiếu giá trị mặc định cho trường bắt buộc).
3. **Bug Priority (3 mức):**
   - `High`: Phải giải quyết càng sớm càng tốt vì ảnh hưởng nghiêm trọng và không thể sử dụng.
   - `Medium` (hoặc `Normal` trên Backlog): Nên giải quyết trong tiến trình dự án hoặc phiên bản tiếp theo.
   - `Low`: Có thể giải quyết sau khi các lỗi nghiêm trọng hơn đã được khắc phục.

## Load Order (mandatory)

1. Read this file.
2. Read `references/00-shared-guardrails.md` (always required).
3. Read `references/10-case-build-bug-draft.md` (build/standardize draft).
4. If user confirms create/push, read `references/11-case-delegate-create.md`.
5. Before finishing, read `references/90-quality-checklist.md`.

Do not load unrelated case files.

## References Index

- Shared guardrails: `references/00-shared-guardrails.md`
- Case build draft: `references/10-case-build-bug-draft.md`
- Case delegate create: `references/11-case-delegate-create.md`
- Quality checklist: `references/90-quality-checklist.md`
- Classification rules: `references/bug_rules.md`
