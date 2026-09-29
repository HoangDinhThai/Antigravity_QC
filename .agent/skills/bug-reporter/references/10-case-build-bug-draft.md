# Case: Build Bug Draft

Use when QC provides raw bug description and optional evidence folder.

## Steps

1. Intake:
   - QC sends error description (VI/JA/EN).
   - If evidence exists, QC provides folder in `backlog/draft/<folder-name>/`.
2. Build title (Tiêu đề Bug / Summary):
   - Cú pháp chuẩn: `[{Mã Task}][{Feature}]: <hành vi lỗi>`
   - Ví dụ: `[196_VNTEST_LIMS-48][Thêm mới khách hàng]: Trường "MÃ ĐT/CTV" bị vô hiệu hóa khi tạo mới khách hàng`
   - Trường hợp không có Mã Task (task cha): `[{Feature}]: <hành vi lỗi>`
   - Trên Mobile (nếu cần chỉ định nền tảng/thiết bị): `[{Mã Task}][{Feature}][{Platform}]: <hành vi lỗi>`
3. Build description using template:
   - `backlog-issue-manager/references/template_bug.md`
   - Fill known fields from QC text.
   - Thứ tự chuẩn: Các bước tái hiện -> **Kết quả thực tế (Actual Result)** -> **Kết quả mong đợi (Expected Result)** -> Bằng chứng (Evidence).
   - Unknown fields -> `[Cần QC bổ sung]`.
4. Evidence handling:
   - Read files from `backlog/draft/<folder-name>/` when provided.
   - Images: Cú pháp ảnh khi lên Backlog bắt buộc dùng ngoặc vuông: `![Tên ảnh][file.png]` (tuyệt đối không dùng ngoặc tròn `](file.png)`).
   - Non-image/video: `- [Tên file](backlog/draft/<folder-name>/<file>)`
   - If no evidence folder: `[Chưa có bằng chứng]`.
5. Classify custom fields from `references/bug_rules.md`:
   - ProgramLogicBugType
   - BugSeverity
   - PhaseDetected
6. Save draft:
   - `backlog/draft/bug-<feature-name>.md` (kebab-case)
   - Keep YAML IDs blank (`IssueKey`, `IssueId`, `ProjectId`, `ProjectKey`)
   - Keep `## Bình luận (Comments)` blank
7. Return draft path and ask for review/confirmation.
