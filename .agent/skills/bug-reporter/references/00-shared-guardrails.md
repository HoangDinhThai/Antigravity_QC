# Shared Guardrails

## Global Rules

- No ad-hoc scripts.
- All output must be Vietnamese.
- This skill handles **Bug** only.

## Read Verification Gate (hard stop)

Before executing any business step:

1. Confirm `references/bug_rules.md` is read.
2. Confirm correct case file is read.
3. If user requests create/push to Backlog, confirm `backlog-issue-manager` skill is loaded.
4. If any prerequisite is missing, stop and load it first.

## Confirmation Rule (BẮT BUỘC PHÊ DUYỆT TRƯỚC KHI ĐẨY)

- **TUYỆT ĐỐI KHÔNG** tự ý gọi API tạo hoặc đẩy Bug lên Backlog ngay khi tiếp nhận hoặc sinh ra lỗi.
- Luôn tạo bản nháp (Draft), lưu tại `backlog/draft/bug-<feature-name>.md` và trình bày đầy đủ chi tiết cho User kiểm tra, chỉnh sửa trước.
- **CHỈ ĐƯỢC PHÉP** gọi API đẩy bug lên Backlog sau khi User đã xem bản nháp, duyệt và đưa ra xác nhận/chỉ thị rõ ràng (ví dụ: "Duyệt rồi, đẩy đi", "OK đẩy bug lên", "Tạo bug nhé") trong lượt hội thoại hiện tại.
