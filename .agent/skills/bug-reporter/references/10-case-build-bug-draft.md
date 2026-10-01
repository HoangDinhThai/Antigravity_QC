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
   - **Bắt buộc tuân theo thứ tự 4 phần duy nhất (TUYỆT ĐỐI KHÔNG thêm thông tin môi trường, nguồn, thiết bị, hệ điều hành, điều kiện tiên quyết làm loãng nội dung):**
     1. Các bước tái hiện (Steps to Reproduce)
     2. Kết quả thực tế (Actual Result): Trình bày trước kết quả mong đợi, mô tả chi tiết lỗi xảy ra, không kỹ thuật hóa.
     3. Kết quả mong đợi (Expected Result): Trình bày sau kết quả thực tế, nêu rõ hành vi đúng theo đặc tả nghiệp vụ.
     4. Tài liệu đính kèm / Bằng chứng (Evidence): Cú pháp ảnh bắt buộc dùng ngoặc vuông `![Tên ảnh][file.png]`.
   - **Tiêu chuẩn viết nội dung (CỰC KỲ QUAN TRỌNG):**
     - Viết **cực kỳ ngắn gọn, súc tích, dễ hiểu nhất có thể**.
     - Đảm bảo **PM Non-tech, Dev hoặc bất kỳ ai đọc vào cũng hiểu ngay lập tức** (lỗi ở đâu, làm sao để bị, hành vi sai là gì, hành vi đúng là gì).
     - Tuyệt đối không viết lan man dài dòng, không kỹ thuật hóa (không chèn selector CSS, mã code hay thuật ngữ backend phức tạp vào phần mô tả nghiệp vụ).
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
7. Trình bày bản nháp & Chờ phê duyệt (BẮT BUỘC):
   - Xuất toàn bộ nội dung bản nháp chi tiết (Tiêu đề, Bước tái hiện, Kết quả thực tế, Kết quả mong đợi, Bằng chứng, Phân loại lỗi) ra chat để QC kiểm tra và chỉnh sửa.
   - Nêu rõ đường dẫn file draft đã lưu tại `backlog/draft/bug-<feature-name>.md`.
   - **DỪNG LẠI và CHỜ** phản hồi/chỉnh sửa từ QC. **TUYỆT ĐỐI KHÔNG** tự ý gọi API tạo/đẩy bug khi QC chưa duyệt và xác nhận.
