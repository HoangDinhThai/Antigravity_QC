# MẪU BÁO CÁO BẰNG CHỨNG KIỂM THỬ (TEST EVIDENCE REPORT TEMPLATE)

## 📌 QUY TẮC CẤU TRÚC BÁO CÁO

1. **Tag reviewer ở dòng đầu tiên:** Ví dụ `<@U349011>` hoặc `@Hung Do (ドー)` (hoặc người phụ trách/review task).
2. **Thông báo hoàn thành cực kỳ ngắn gọn:** `"E đã test xong task này ạ!"` (hoặc `"E đã test xong request này ạ!"`).
3. **Đường kẻ ngang và tiêu đề mục ảnh:**
   ```markdown
   ---

   **Hình ảnh bằng chứng:**
   ```
4. **Các mục bằng chứng đánh số thứ tự in đậm:**
   - Cú pháp: `**1. <Mô tả cực kỳ ngắn gọn, đi thẳng vào kết quả kiểm chứng trực quan> (vùng khoanh đỏ):**`
   - Tuyệt đối không mô tả dài dòng, không giải thích kỹ thuật.
5. **Thẻ ảnh Backlog:** `![<Mô tả ảnh>][<tên_file_ảnh.png>]`
6. **Khoảng cách dòng (Line Spacing - BẮT BUỘC):**
   - Cách **1 dòng trống** (`\n\n`) giữa câu mô tả bằng chứng với thẻ ảnh `![alt][filename.png]`.
   - Cách **1 dòng trống** (`\n\n`) sau mỗi thẻ ảnh trước khi sang mục đánh số tiếp theo.

---

## 📝 VÍ DỤ MẪU CHUẨN ĐÃ THỰC THI THÀNH CÔNG

```markdown
<@U349011>

E đã test xong request này ạ!

---

**Hình ảnh bằng chứng:**


**1. Màn hình Trưởng BP Kiểm tra — Tab "Trả lại" hiển thị các chỉ tiêu bị trả lại độc lập; cột Checkbox chọn lẻ ở đầu dòng hoạt động chính xác và bộ đếm cập nhật ("Đang chọn 1 chỉ tiêu") (vùng khoanh đỏ):**

![Màn hình Trưởng BP Kiểm tra - Tab Trả lại và cột checkbox chọn lẻ chỉ tiêu][01_truong_bp_tab_tra_lai_va_checkbox_chon_le.png]



**2. Màn hình Trưởng BP Kiểm tra — Nút biểu tượng (?) nằm ngay bên trái nút "Duyệt", khi bấm mở popup hướng dẫn chi tiết cách xem thông tin, chọn lẻ, chọn nhanh cả hồ sơ và điều kiện duyệt / trả lại (vùng khoanh đỏ):**

![Màn hình Trưởng BP Kiểm tra - Nút hỏi chấm và popup hướng dẫn thao tác][02_truong_bp_nut_hoi_cham_va_popup_huong_dan.png]



**3. Màn hình Trưởng BP Kiểm tra — Tab "Đã duyệt" lọc đúng danh sách chỉ tiêu Đã hoàn thành (Đã HT); thanh phân trang ở chân bảng đếm chuẩn theo số lượng hồ sơ (Hiện 1–20 / 20 HS, tùy chọn 20/50/100/200) (vùng khoanh đỏ):**

![Màn hình Trưởng BP Kiểm tra - Tab Đã duyệt và thanh phân trang theo hồ sơ][03_truong_bp_tab_da_duyet_phan_trang.png]



**4. Màn hình Hồ sơ TN — Bản ghi có chỉ tiêu bị trả lại (HS-2026-0039) hiển thị nhãn "Trả lại" (màu đỏ), có vạch cam đánh dấu bên trái dòng và mở khóa các ô nhập liệu cho phép KNV sửa lại kết quả (vùng khoanh đỏ):**

![Màn hình Hồ sơ TN - Chỉ tiêu bị trả lại hiển thị nhãn đỏ và cho phép KNV nhập lại số liệu][04_ho_so_tn_chi_tieu_tra_lai_cho_phep_sua.png]



**5. Màn hình Giao việc — Bảo vệ chỉ tiêu đã hoàn thành (chấm xanh "Đã duyệt HS"): Vô hiệu hóa ô chọn KNV / thầu phụ (chặn đổi người thực hiện) và vô hiệu hóa checkbox (chặn gom tạo lại hồ sơ mới) (vùng khoanh đỏ):**

![Màn hình Giao việc - Chặn đổi KNV và chặn gom tạo lại hồ sơ đối với chỉ tiêu đã hoàn thành][05_giao_viec_chan_doi_knv_va_chan_gom_tao_lai_hs.png]
```

