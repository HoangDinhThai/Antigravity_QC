# Shared Guardrails

## Global Rules

- No ad-hoc scripts.
- All output must be Vietnamese.
- This skill handles **Bug** only.
- Mọi nội dung mô tả bug phải **cực kỳ ngắn gọn, súc tích, dễ hiểu nhất có thể** để PM non-tech, Dev hoặc bất kỳ ai đọc vào cũng hiểu ngay. Tuyệt đối không kỹ thuật hóa lan man.

## Read Verification Gate (hard stop)

Before executing any business step:

1. Confirm `references/bug_rules.md` is read.
2. Confirm correct case file is read.
3. If user requests create/push to Backlog, confirm `backlog-issue-manager` skill is loaded.
4. If any prerequisite is missing, stop and load it first.

## Confirmation Rule (BẮT BUỘC PHÊ DUYỆT TRƯỚC KHI ĐẨY)

- **TUYỆT ĐỐI KHÔNG** tự ý gọi API tạo hoặc đẩy Bug lên Backlog ngay khi tiếp nhận hoặc sinh ra lỗi.
- **BẮT BUỘC XUẤT FILE MD:** Luôn tạo bản nháp (Draft) lưu ra file Markdown (`.md`) tại thư mục `backlog/draft/bug-<feature-name>.md` kèm thư mục lưu ảnh bằng chứng (`backlog/draft/bug-<feature-name>/`).
- **TUYỆT ĐỐI KHÔNG** chỉ xuất bản nháp ra khung chat mà bỏ quên bước ghi file `.md`.
- **CHỈ ĐƯỢC PHÉP** gọi API đẩy bug lên Backlog sau khi User đã xem bản nháp, duyệt và đưa ra xác nhận/chỉ thị rõ ràng (ví dụ: "Duyệt rồi, đẩy đi", "OK đẩy bug lên", "Tạo bug nhé") trong lượt hội thoại hiện tại.

## Mandatory Evaluation Fields & Assignee Rule (BẮT BUỘC ĐÁNH GIÁ 3 TRƯỜNG & HỎI ASSIGNEE)

- **LUÔN ĐÁNH GIÁ VÀ ĐIỀN ĐỦ 3 TRƯỜNG:** Trong MỌI bản nháp Bug và khi đẩy lên Backlog, bắt buộc phải đánh giá và điền đủ 3 thông tin:
  1. `Bug Type`: `Logical Bug`, `Functional Bug`, `Interface Error`, `Workflow`, `Security Bug`, `Performance Problem`, `UAT Bug`, `Release Bug`.
  2. `Bug Severity`: `Critical`, `Major`, `Minor`.
  3. `Phase Detected`: `Unit Testing`, `Intergration Testing`, `System Testing`, `Acceptance Testing`.
- **LUÔN HỎI ASSIGNEE KHI TẠO BUG:** Khi trình bày bản nháp hoặc trước khi đẩy bug lên Backlog, bắt buộc phải hỏi người dùng muốn gán (assign) ticket cho ai phụ trách (kèm gợi ý danh sách thành viên dự án nếu có).
