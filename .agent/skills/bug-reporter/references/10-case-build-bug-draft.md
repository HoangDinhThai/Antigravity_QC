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
     1. Các bước tái hiện (Steps to Reproduce): Chỉ ghi thao tác ngắn gọn, **CẤM** chèn giải thích trong ngoặc hoặc câu `"và quan sát..."`.
     2. Kết quả thực tế (Actual Result): Trình bày trước kết quả mong đợi, chỉ viết **1 câu ngắn gọn** nêu thẳng lỗi xảy ra, **CẤM** liệt kê dài dòng tên từng trường hoặc giải thích lý do UX.
     3. Kết quả mong đợi (Expected Result): Trình bày sau kết quả thực tế, chỉ viết **1 câu ngắn gọn** nêu hành vi đúng, **CẤM** lặp lại vế điều kiện `"Khi..., hệ thống phải..."`.
     4. Tài liệu đính kèm / Bằng chứng (Evidence): Câu dẫn cực ngắn + cú pháp ảnh ngoặc vuông `![Tên ảnh][file.png]`.
   - **Tiêu chuẩn viết nội dung (CỰC KỲ QUAN TRỌNG - CẤM VIẾT DÀI DÒNG):**
     - Viết **cực kỳ ngắn gọn, súc tích, dễ hiểu nhất có thể** (mỗi ý tối đa 1 câu ngắn).
     - Đảm bảo **PM Non-tech, Dev hoặc bất kỳ ai đọc vào cũng hiểu ngay lập tức** (lỗi ở đâu, làm sao để bị, hành vi sai là gì, hành vi đúng là gì).
     - Tuyệt đối không viết lan man dài dòng, không liệt kê tên từng trường khi có thể gọi chung, không kỹ thuật hóa (không chèn selector CSS, mã code hay thuật ngữ backend phức tạp vào phần mô tả nghiệp vụ).
   - **Quy tắc khoảng cách dòng (Line Spacing - BẮT BUỘC):**
     - Cách **1 dòng trống** (`\n\n`) giữa các bước trong `Các bước tái hiện` (`1. ...`, `2. ...`, `3. ...`) và giữa các gạch đầu dòng (`- ...`) trong `Kết quả thực tế`, `Kết quả mong đợi`.
     - Cách **1 dòng trống** (`\n\n`) giữa câu dẫn mô tả bằng chứng với thẻ ảnh `![Tên ảnh][file.png]` và cách **1 dòng trống** sau mỗi thẻ ảnh.
4. Evidence handling:
   - Read files from `backlog/draft/<folder-name>/` when provided.
   - Images: Cú pháp ảnh khi lên Backlog bắt buộc dùng ngoặc vuông: `![Tên ảnh][file.png]` (tuyệt đối không dùng ngoặc tròn `](file.png)`).
   - Non-image/video: `- [Tên file](backlog/draft/<folder-name>/<file>)`
   - If no evidence folder: `[Chưa có bằng chứng]`.
5. Classify custom fields from `references/bug_rules.md`:
   - ProgramLogicBugType: Phân loại chuẩn xác theo 8 loại (`Interface Error`, `Workflow`, `Functional Bug`, `Logical Bug`, `Security Bug`, `Performance Problem`, `UAT Bug`, `Release Bug`).
   - BugSeverity: (`Critical`, `Major`, `Minor`).
   - Priority (Bug Priority): (`High`, `Medium` / `Normal`, `Low`).
   - PhaseDetected: (`Unit Testing`, `Intergration Testing`, `System Testing`, `Acceptance Testing`).
   - **Categories:** **TUYỆT ĐỐI CẤM điền Category** (luôn để trống `Categories:` trong bản nháp và không truyền `categoryId` khi đẩy lên Backlog).
6. Save draft:
   - `backlog/draft/bug-<feature-name>.md` (kebab-case)
   - Keep YAML IDs blank (`IssueKey`, `IssueId`, `ProjectId`, `ProjectKey`)
7. Trình bày bản nháp & Chờ phê duyệt (BẮT BUỘC):
   - Xuất toàn bộ nội dung bản nháp chi tiết (Tiêu đề, Bước tái hiện, Kết quả thực tế, Kết quả mong đợi, Bằng chứng, Phân loại lỗi) ra chat để QC kiểm tra và chỉnh sửa.
   - Nêu rõ đường dẫn file draft đã lưu tại `backlog/draft/bug-<feature-name>.md`.
   - **DỪNG LẠI và CHỜ** phản hồi/chỉnh sửa từ QC. **TUYỆT ĐỐI KHÔNG** tự ý gọi API tạo/đẩy bug khi QC chưa duyệt và xác nhận.
