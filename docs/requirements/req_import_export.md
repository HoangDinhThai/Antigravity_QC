# Tài liệu Đặc tả Yêu cầu: Tính năng Import và Export

Tài liệu này phân tích chi tiết các yêu cầu nghiệp vụ cho hai chức năng **Import CSV** và **Export dữ liệu** dựa trên mô tả yêu cầu của dự án.

---

## 1. Tổng quan (Overview)
- **Module**: Quản lý sự kiện / Dữ liệu liên kết với sự kiện.
- **Mục đích**: Cho phép người dùng đưa dữ liệu vào hệ thống (Import CSV) dựa trên một sự kiện cụ thể, hoặc trích xuất dữ liệu ra tệp (Export) theo kết quả tìm kiếm hiện tại hoặc theo toàn bộ dữ liệu của một sự kiện được chọn.

---

## 2. Yêu cầu Chức năng (Functional Requirements)

### 2.1. Chức năng Import CSV
* **Mô tả**: Người dùng chọn một sự kiện trước, sau đó thực hiện tải lên tệp CSV để import dữ liệu liên kết với sự kiện đó.
* **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - Khi chưa chọn sự kiện nào trong hệ thống (hoặc khu vực tìm kiếm), nút **"Import CSV"** bắt buộc phải ở trạng thái **Vô hiệu hóa (Disabled - 非活性)**.
  - Khi đã chọn một sự kiện hợp lệ, nút **"Import CSV"** sẽ được **Kích hoạt (Enabled - 活性)**.
  - Khi người dùng click vào nút **"Import CSV"** (đã được kích hoạt), hệ thống hiển thị một **Popup Import**.

### 2.2. Chức năng Export Dữ liệu
* **Mô tả**: Người dùng có thể export dữ liệu từ hệ thống bằng 2 cách thức khác nhau. Nút chức năng Export chính luôn được kích hoạt để người dùng tương tác lựa chọn phương thức.
* **Tiêu chí chấp nhận (Acceptance Criteria)**:
  - **Nút Export chính** luôn ở trạng thái kích hoạt để người dùng có thể mở menu chọn lựa chọn export.
  - **Phương thức 1: Export kết quả tìm kiếm (検索結果をエクスポート)**
    - Cho phép export toàn bộ danh sách kết quả đang hiển thị theo bộ lọc tìm kiếm hiện tại.
    - **Điều kiện**: Nếu danh sách tìm kiếm trống (không hiển thị dòng dữ liệu nào), nút/lựa chọn "Export kết quả tìm kiếm" sẽ bị **Vô hiệu hóa (Disabled)**.
  - **Phương thức 2: Chọn sự kiện và Export toàn bộ dữ liệu liên kết với sự kiện đó (イベントを選択し、イベントに紐づく全件をエクスポート)**
    - Cho phép export toàn bộ dữ liệu của một sự kiện, không phụ thuộc vào bộ lọc tìm kiếm danh sách.
    - **Điều kiện**: Người dùng bắt buộc phải chọn một sự kiện tại khu vực tìm kiếm. Nếu chưa chọn sự kiện, nút/lựa chọn này sẽ bị **Vô hiệu hóa (Disabled)**.

---

## 3. Đặc tả Trường Dữ liệu và Thành phần UI (Field Specifications)

| Tên Thành phần (UI Label) | Loại thành phần (UI Type) | Trạng thái mặc định | Điều kiện Kích hoạt (Enabled Condition) | Ghi chú / Hành vi |
| :--- | :--- | :--- | :--- | :--- |
| **Sự kiện (Event Selector)** | Dropdown / Combobox | Trống / Chưa chọn | Luôn kích hoạt | Dùng để chọn sự kiện mục tiêu |
| **Import CSV** | Button | Vô hiệu hóa (Disabled) | Khi `Sự kiện` đã được chọn | Nhấn để mở Popup Import |
| **Export (Nút chính)** | Dropdown Button | Kích hoạt (Enabled) | Luôn kích hoạt | Chứa menu lựa chọn 2 phương thức Export |
| **Export kết quả tìm kiếm** | MenuItem / Button con | Vô hiệu hóa (Disabled) | Khi danh sách kết quả tìm kiếm có ít nhất 1 bản ghi | Xuất dữ liệu hiển thị hiện tại |
| **Export toàn bộ theo sự kiện** | MenuItem / Button con | Vô hiệu hóa (Disabled) | Khi `Sự kiện` đã được chọn | Xuất toàn bộ dữ liệu của sự kiện |

---

## 4. Các luồng xử lý và Câu hỏi cần làm rõ (Ambiguities & Clarifications)

Để đảm bảo quá trình phát triển (Development) và kiểm thử (Testing) không xảy ra sai sót, cần làm rõ các điểm chưa rõ ràng (Ambiguities) sau với PO/BA:

> [!WARNING]
> ### Các điểm cần làm rõ với PO/BA (Questions for PO/BA)
>
> 1. **Cấu trúc Giao diện Nút Export:**
>    - Nút Export chính là một dropdown menu chứa 2 lựa chọn con, hay là 2 nút bấm riêng biệt hiển thị trên màn hình? 
>    - Nếu là dropdown menu, việc "luôn ở trạng thái kích hoạt" áp dụng cho nút cha, còn các nút con bên trong sẽ tự động disable/enable tùy theo điều kiện đúng không?
> 
> 2. **Quy trình và Giao diện của Popup Import:**
>    - Popup Import gồm những thành phần nào? (Ví dụ: Nút "Chọn file", Nút "Tải lên/Bắt đầu Import", Nút "Hủy", Khu vực hiển thị tên file đã chọn).
>    - Định dạng file tải lên có giới hạn dung lượng tối đa (Max file size) là bao nhiêu không? Có giới hạn định dạng file (ví dụ chỉ chấp nhận `.csv`) hay không?
> 
> 3. **Quy tắc Validation khi Import dữ liệu:**
>    - Nếu file CSV tải lên có dòng dữ liệu lỗi (sai định dạng, thiếu cột bắt buộc, trùng lặp,...), hệ thống sẽ xử lý như thế nào?
>      - *Phương án A*: Dừng hoàn toàn và rollback toàn bộ dữ liệu (All or Nothing).
>      - *Phương án B*: Vẫn import các dòng hợp lệ và xuất file log báo lỗi cho các dòng không hợp lệ.
>    - Sau khi Import thành công, hệ thống có tự động tải lại (reload) danh sách tìm kiếm trên màn hình không?
> 
> 4. **Phạm vi dữ liệu của Export kết quả tìm kiếm:**
>    - Nếu danh sách tìm kiếm có phân trang (Pagination), ví dụ kết quả tìm kiếm có 100 dòng nhưng trang hiện tại chỉ hiển thị 20 dòng. Khi bấm "Export kết quả tìm kiếm", hệ thống sẽ export toàn bộ 100 dòng hay chỉ export 20 dòng của trang hiện tại?
> 
> 5. **Định dạng file xuất ra (Export):**
>    - Định dạng file export của 2 phương thức là gì? (CSV UTF-8, Excel `.xlsx`,...). Tên file mặc định khi tải xuống sẽ được đặt theo định dạng nào? (Ví dụ: `KetQuaTimKiem_YYYYMMDD.csv` hoặc `SuKien_[TenSuKien]_All_YYYYMMDD.csv`).
