# MẪU BẢN NHÁP BÁO CÁO BUG (BUG DRAFT TEMPLATE)

## 📌 QUY TẮC BẮT BUỘC

1. **Vị trí lưu file nháp:** `backlog/draft/bug-<ten-loi>.md` kèm ảnh trong `backlog/draft/bug-<ten-loi>/`.
2. **Tiêu đề (Summary):** `[{Mã Task}][{Feature}]: {Hành vi lỗi}` (hoặc `[{Feature}]: {Hành vi lỗi}` nếu không có task cha).
3. **CẤM TUYỆT ĐỐI Heading 1 `# <Title>` trong phần mô tả:** Vì Backlog đã hiển thị tiêu đề task ở trên cùng. Bắt đầu thẳng từ `### 1. Các bước tái hiện:`.
4. **Thứ tự 4 phần chuẩn:**
   - `### 1. Các bước tái hiện:` (đánh số, cách dòng `\n\n`)
   - `### 2. Kết quả thực tế:` (viết TRƯỚC, 1 câu ngắn gọn trực diện)
   - `### 3. Kết quả mong đợi:` (viết SAU, 1 câu ngắn gọn trực diện)
   - `### 4. Tài liệu đính kèm / Bằng chứng:` (câu dẫn cực ngắn + `![Tên ảnh][file.png]`)
5. **Metadata Backlog (Frontmatter):**
   - `ProgramLogicBugType`: Interface Error | Workflow | Functional Bug | Logical Bug | Security Bug | Performance Problem | UAT Bug | Release Bug
   - `BugSeverity`: Critical | Major | Minor
   - `Priority`: High | Normal | Low
   - `PhaseDetected`: System Testing

---

## 📝 VÍ DỤ MẪU CHUẨN

```markdown
---
IssueKey: 
IssueType: Bug
Summary: [196_VNTEST_LIMS-164][Sửa gói chỉ tiêu]: Tên chỉ tiêu bị mất nội dung không thể cuộn ngang và nút xóa bộ chỉ tiêu bị lệch hàng tại bảng "Chỉ tiêu đã chọn"
Priority: Low
ProgramLogicBugType: Interface Error
BugSeverity: Minor
PhaseDetected: System Testing
---

### 1. Các bước tái hiện:
1. Đăng nhập hệ thống và truy cập màn hình **Gói chỉ tiêu** (`/goi-chi-tieu`).

2. Chọn một gói chỉ tiêu bất kỳ và nhấn nút **"Chỉnh sửa chỉ tiêu"** để mở hộp thoại **"Chỉnh sửa chỉ tiêu trong gói"**.

3. Tích chọn thêm chỉ tiêu lẻ và bộ chỉ tiêu để đưa vào bảng **"Chỉ tiêu đã chọn"** ở khung bên phải.

4. Quan sát hiển thị tên các chỉ tiêu và vị trí các nút xóa trên bảng **"Chỉ tiêu đã chọn"**.

### 2. Kết quả thực tế:
- Tên chỉ tiêu có độ dài lớn bị cắt cụt mất một phần nội dung và bảng không có thanh cuộn ngang để xem đầy đủ tên chỉ tiêu.

- Nút xóa (icon thùng rác) tại dòng tiêu đề của bộ chỉ tiêu bị lệch hàng, không được căn thẳng với các nút xóa ở các dòng phía trên.

### 3. Kết quả mong đợi:
- Tên chỉ tiêu phải hiển thị đầy đủ (tự động xuống dòng hoặc hỗ trợ thanh cuộn ngang/tooltip) để người dùng có thể xem trọn vẹn nội dung.

- Nút xóa tại dòng tiêu đề bộ chỉ tiêu phải được căn thẳng hàng theo chiều dọc với các nút xóa ở các dòng phía trên.

### 4. Tài liệu đính kèm / Bằng chứng:
- Giao diện tên chỉ tiêu bị cắt cụt nội dung và nút xóa bộ chỉ tiêu bị lệch hàng:

![Tên chỉ tiêu bị mất nội dung và nút xóa bộ chỉ tiêu bị lệch hàng][cac_loi_ui_bang_chi_tieu_da_chon.png]
```

