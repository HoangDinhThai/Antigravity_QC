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

## Mandatory Evaluation Fields & Assignee Rule (Bắt Buộc Đánh Giá 3 Trường & Hỏi Assignee)

- **LUÔN ĐÁNH GIÁ VÀ ĐIỀN ĐỦ 3 TRƯỜNG:** Trong MỌI bản nháp Bug và khi đẩy lên Backlog, bắt buộc phải đánh giá và điền đủ 3 thông tin:
  1. `Bug Type`: `Logical Bug`, `Functional Bug`, `Interface Error`, `Workflow`, `Security Bug`, `Performance Problem`, `UAT Bug`, `Release Bug`.
  2. `Bug Severity`: `Critical`, `Major`, `Minor`.
  3. `Phase Detected`: `Unit Testing`, `Intergration Testing`, `System Testing`, `Acceptance Testing`.
- **LUÔN HỎI ASSIGNEE KHI TẠO BUG:** Khi trình bày bản nháp hoặc trước khi đẩy bug lên Backlog, bắt buộc phải hỏi người dùng muốn gán (assign) ticket cho ai phụ trách (kèm gợi ý danh sách thành viên dự án nếu có).

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
