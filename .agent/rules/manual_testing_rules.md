---
trigger: always_on
---

# MANUAL TESTING RULES

**Luật này áp dụng BẮT BUỘC cho mọi tác vụ sinh Test Case thủ công.**

1. **Ràng buộc Dữ liệu (Test Data - Nơi DUY NHẤT chứa giá trị kiểm thử):**
   - Cột `Test Data` là nơi **DUY NHẤT** định nghĩa toàn bộ dữ liệu cụ thể cho kịch bản (dữ liệu nhập mới, dữ liệu giữ nguyên, dữ liệu bỏ trống `""`, hoặc dữ liệu vi phạm).
   - **Tuyệt đối KHÔNG thêm dấu nháy đơn `''` vào giá trị:** Chỉ ghi giá trị thuần túy (ví dụ: `SĐT: 0912345678`, CẤM ghi `SĐT: '0912345678'`) để thuận tiện cho việc quan sát và sao chép (copy) trực tiếp vào form mà không bị dính dấu nháy thừa.
   - **Bắt buộc xuống dòng khi có nhiều trường dữ liệu:** Trường hợp có nhiều dữ liệu test trong một kịch bản, **bắt buộc xuống dòng** (dùng `<br>` trong bảng Markdown, `\n` trên Google Sheets) giữa các dòng dữ liệu để dễ dàng quan sát và copy từng trường.
   - CẤM dùng từ chung chung: "Nhập tài khoản đúng", "Nhập sai mật khẩu", "Mã giảm giá hết hạn".
   - BẮT BUỘC giá trị thực tế cụ thể: `SĐT: 0987654321`, `CCCD: 001203004567`, `Email: user01@test.com`, `Mật khẩu: Abc@12345`.

2. **Cấu trúc Bước test (Test Steps - Chỉ ghi hành động thao tác, TUYỆT ĐỐI KHÔNG lặp lại giá trị dữ liệu):**
   - **Chỉ ghi hành động nguyên tử (Atomic actions)** của người dùng trên giao diện (ví dụ: `1. Nhập SĐT.`, `2. Nhấn nút "Cập nhật".`).
   - **TUYỆT ĐỐI CẤM đưa/lặp lại giá trị dữ liệu cụ thể vào bước test** (vì toàn bộ giá trị dữ liệu đã được khai báo ở cột `Test Data`).
   - **TUYỆT ĐỐI CẤM đưa các câu giải thích/ghi chú dữ liệu vào bước test** (ví dụ: cấm viết kiểu "2. CCCD và Email giữ nguyên của CTV-001" vào steps).
   - **Bảng đối chiếu chuẩn:**
     - ❌ CẤM: `1. Nhập SĐT 0987654321 -> 2. CCCD và Email giữ nguyên của CTV-001 -> 3. Bấm [Cập nhật]`
     - ✅ ĐÚNG: `1. Nhập SĐT.<br><br>2. Nhấn nút "Cập nhật".` *(Cột Test Data ghi: `SĐT: 0987654321<br>CCCD: 001203004567<br>Email: nguyenvanan@example.com`)*
     - ❌ CẤM: `1. Nhập email: abc@test.com -> 2. Nhập password: 123 -> 3. Click nút Đăng nhập`
     - ✅ ĐÚNG: `1. Nhập Email.<br><br>2. Nhập Mật khẩu.<br><br>3. Nhấn nút "Đăng nhập".` *(Cột Test Data ghi: `Email: abc@test.com, Mật khẩu: 123`)*

3. **Quy Chuẩn Thao Tác Nút Bấm (Button Actions - BẮT BUỘC):**
   - Khi thực hiện thao tác tương tác với bất kỳ nút bấm (Button) nào, cú pháp chuẩn **BẮT BUỘC**:
     `Nhấn nút "<Tên nút>"`
   - Tên nút phải nằm trong cặp dấu ngoặc kép `"..."`.
   - Từ khóa hành động thống nhất là `Nhấn nút` (không dùng "Bấm", "Click", "Nhấp", "Bấm nút").
   - **Ví dụ chuẩn:**
     - `Nhấn nút "Cập nhật"`
     - `Nhấn nút "Lưu"`
     - `Nhấn nút "Hủy"`
     - `Nhấn nút "Đóng"`
     - `Nhấn nút "Thêm mới"`
     - `Nhấn nút "Đăng nhập"`
     - `Nhấn nút "Xác nhận"`
     - `Nhấn nút "Sửa"`
     - `Nhấn nút "Xóa"`
   - **CẤM TUYỆT ĐỐI (ANTI-PATTERNS):**
     - ❌ CẤM dùng ngoặc vuông: `Bấm [Cập nhật]`, `Nhấn [Lưu]`, `[Cập nhật]`
     - ❌ CẤM dùng từ "Bấm": `Bấm nút "Cập nhật"`, `Bấm Cập nhật`
     - ❌ CẤM dùng từ tiếng Anh: `Click nút "Cập nhật"`, `Click "Lưu"`
     - ❌ CẤM thiếu ngoặc kép: `Nhấn nút Cập nhật`

4. **Quy Chuẩn Ngôn Ngữ & Cấm Kỹ Thuật Hóa (BẮT BUỘC & CỰC KỲ QUAN TRỌNG):**
   - **BẮT BUỘC:** Viết test case hoàn toàn bằng **Tiếng Việt thuần túy, tự nhiên, chuẩn mực theo góc nhìn người dùng cuối (End-User) và nghiệp vụ (Business)**.
   - **CẤM TUYỆT ĐỐI:**
     - CẤM viết test case nửa nạc nửa mỡ trộn tiếng Việt lẫn tiếng Anh kỹ thuật.
     - CẤM đưa tên CSS class, CSS selector, DOM element, ID, HTML tag, HTML attribute vào các cột (`Test Steps`, `Expected Result`, `Pre-Condition`, `Title`).
   - **Bảng đối chiếu chuẩn:**
     - ❌ CẤM: `Nút Lưu (disabled)` ➔ ✅ ĐÚNG: `Nút "Lưu" bị vô hiệu hóa (làm mờ, không thể bấm)`
     - ❌ CẤM: `Tiêu đề (.modal-title) hiển thị...` ➔ ✅ ĐÚNG: `Tiêu đề cửa sổ/hộp thoại hiển thị...`
     - ❌ CẤM: `Biểu tượng CheckCircle class .is-readonly` ➔ ✅ ĐÚNG: `Biểu tượng dấu tích xanh ở trạng thái chỉ đọc`
     - ❌ CẤM: `Trường Email (readonly)` ➔ ✅ ĐÚNG: `Trường "Email" ở chế độ chỉ đọc (không thể chỉnh sửa)`
     - ❌ CẤM: `Nhấp button .btn-close` ➔ ✅ ĐÚNG: `Nhấn nút "Đóng" [×]`
     - ❌ CẤM: `Hiển thị spinner loading` ➔ ✅ ĐÚNG: `Hiển thị biểu tượng vòng xoay đang tải dữ liệu`

5. **Quy Chuẩn Phân Cấp Tiêu Đề 3 Tầng & Đặt Tên Kịch Bản (BẮT BUỘC):**
   - **Tầng 1 - `Feature`**: Khối chức năng / nhóm tính năng lớn (ví dụ: `01. Bố cục & Hiển thị`, `02. Phân quyền & Điều kiện kích hoạt`, `03. Luồng nghiệp vụ chính`, `04. Field Validation`...).
   - **Tầng 2 - `Test Case Title_1`**: Nhóm con / Chủ đề kiểm thử cấp 1 (ví dụ: `Quyền truy cập`, `Phiên đăng nhập`, `Phân quyền trường Tên Sale`, `Kiểm tra trường Mã KH`...).
     - Tất cả các test case cùng chủ đề con này sẽ được gom nhóm liền kề để tự động gộp ô (Merge Cells).
   - **Tầng 3 - `Test Case Title_2`**: Kịch bản kiểm thử chi tiết.
     - **CẤM LẶP LẠI TIỀN TỐ:** Tuyệt đối không lặp lại tên Title_1 trong Title_2 (❌ CẤM: `Quyền truy cập - Người dùng chỉ có quyền xem` ➔ ✅ ĐÚNG: `Người dùng chỉ có quyền xem`).
     - **Khi không có kịch bản con / Ca đơn lẻ (Single Case):** Nếu một kịch bản đứng độc lập hoặc không có phân nhánh con, chỉ điền tên vào `Test Case Title_1`, còn `Test Case Title_2` **bắt buộc để trống hoàn toàn (tuyệt đối KHÔNG dùng `""`, không điền chuỗi hai dấu ngoặc kép)**. TUYỆT ĐỐI KHÔNG copy y hệt tên từ Title_1 sang Title_2.
       - ❌ CẤM: Title_1: `Thêm mới một khối Người liên hệ`, Title_2: `Thêm mới một khối Người liên hệ`.
       - ❌ CẤM: Title_1: `Thêm mới một khối Người liên hệ`, Title_2: `""`.
       - ✅ ĐÚNG: Title_1: `Thêm mới một khối Người liên hệ`, Title_2: để trống (trong bảng Markdown để ô trống `| |`, không điền `""`).
       - ❌ CẤM: Title_1: `Tìm kiếm và chọn hợp đồng từ danh sách`, Title_2: `Tìm kiếm và chọn hợp đồng từ danh sách`.
       - ❌ CẤM: Title_1: `Tìm kiếm và chọn hợp đồng từ danh sách`, Title_2: `""`.
       - ✅ ĐÚNG: Title_1: `Tìm kiếm và chọn hợp đồng từ danh sách`, Title_2: để trống.
   - **Quy tắc đặt tên Ca kiểm thử Giá trị biên / Độ dài (CỰC KỲ NGẮN GỌN & ĐI THẲNG VÀO SỐ LIỆU):**
     - Tuyệt đối không giải thích dài dòng hoặc chèn ngoặc đơn rườm rà.
     - ❌ CẤM: `Nhập thiếu chữ số (9 số hoặc 11 số)` ➔ ✅ ĐÚNG: `Nhập 9 chữ số` (hoặc `Nhập 11 chữ số`).
     - ❌ CẤM: `Nhập vượt quá 12 chữ số (13 số)` ➔ ✅ ĐÚNG: `Nhập 13 chữ số`.
     - ❌ CẤM: `Nhập chuỗi dài vượt quá biên tối đa (256 ký tự)` ➔ ✅ ĐÚNG: `Nhập 256 ký tự`.
   - **Quy tắc đặt tên Ca kiểm thử Bỏ trống trường (CẤM GHI CHUNG CHUNG "TRƯỜNG BẮT BUỘC"):**
     - Tuyệt đối CẤM ghi thêm "trường bắt buộc" một cách chung chung như `Bỏ trống trường bắt buộc`, `Để trống trường bắt buộc`.
     - Bắt buộc chọn 1 trong 2 cách viết chuẩn sau:
       - **Cách 1 (Khuyến nghị - Cực kỳ ngắn gọn):** Chỉ ghi đúng: `Bỏ trống` (vì cột `Test Case Title_1` đã ghi rõ tên trường rồi, ví dụ: Title_1: `Kiểm tra trường Tên khách hàng` ➔ Title_2: `Bỏ trống`).
       - **Cách 2:** Ghi đích danh tên trường: `Bỏ trống trường <Tên trường chính xác>` (sau chữ "Bỏ trống trường" là tên chính xác của trường đó, ví dụ: `Bỏ trống trường Tên khách hàng`).
     - ❌ CẤM: `Bỏ trống trường bắt buộc`, `Để trống trường bắt buộc`, `Không nhập trường bắt buộc`.
     - ✅ ĐÚNG: `Bỏ trống` hoặc `Bỏ trống trường Tên khách hàng`.

6. **Quy Chuẩn Viết Kết Quả Mong Muốn & Giãn Cách Dòng (Expected Result - BẮT BUỘC):**
   - **Tiêu chuẩn viết CỰC KỲ NGẮN GỌN & ĐÚNG TRỌNG TÂM:** Đi thẳng vào kết quả kiểm chứng trực quan của người dùng. Tuyệt đối **CẤM viết dài dòng lan man**, không mô tả quá trình backend/hệ thống xử lý.
   - **Bắt buộc có khoảng cách dòng trống** giữa các ý đánh số (`1. ...`, `2. ...`, `3. ...`) bằng cách dùng `<br><br>` trong bảng Markdown (hoặc 2 dấu xuống dòng `\n\n` trên Google Sheets) để văn bản thoáng đãng, trực quan, dễ theo dõi, không bị dính chùm vào nhau thành khối chữ khó nhìn.
   - **Quy chuẩn màn TẠO MỚI (Khi tạo mới thành công):**
     - **Linh động thông báo & điều hướng theo dự án:** Nội dung câu thông báo thành công và hành động đóng hộp thoại (hoặc chuyển về màn list) phải linh động theo đúng đặc tả/thực tế của từng dự án (ví dụ: `"Đã thêm nền mẫu."`, `"Thêm mới thành công."`, `"Tạo khách hàng thành công."`...), không dập khuôn cứng nhắc một câu.
     - Bắt buộc nêu rõ: Bản ghi mới hiển thị ngay lập tức ngoài màn hình danh sách (màn list), đồng thời các thông tin khi tạo mới xong sẽ hiển thị đúng và đủ ở các cột bên ngoài màn list (nếu có các cột tương ứng).
     - *Ví dụ tham khảo:*
       `1. Hiển thị thông báo "Thêm mới thành công." và đóng hộp thoại.<br><br>2. Bản ghi mới hiển thị ngay trên danh sách với đầy đủ và chính xác các thông tin tại các cột tương ứng.`
   - **Quy chuẩn màn CẬP NHẬT / CHỈNH SỬA (Khi cập nhật thành công):**
     - **Linh động thông báo & điều hướng theo dự án:** Nội dung câu thông báo thành công và đóng form linh động theo thực tế hệ thống (ví dụ: `"Đã cập nhật nền mẫu."`, `"Cập nhật thành công."`...).
     - Bắt buộc nêu rõ: Giá trị mới hiển thị ngay tại màn chi tiết của bản ghi, hiển thị ngoài màn danh sách (list), và khi mở lại bản ghi đó thì các giá trị bên trong màn hình chỉnh sửa cũng phải hiển thị đúng giá trị mới.
     - *Ví dụ tham khảo:*
       `1. Hiển thị thông báo "Cập nhật thành công." và đóng hộp thoại.<br><br>2. Giá trị mới hiển thị ngay ngoài màn hình danh sách và màn chi tiết.<br><br>3. Khi mở lại bản ghi, các thông tin vừa chỉnh sửa hiển thị đúng giá trị mới.`

7. **Quy Chuẩn Gộp Ô Cột Pre-Condition khi Trùng Lặp (BẮT BUỘC):**
   - **Được phép gộp ô khi trùng Pre-condition:** Trong trường hợp các test case liên tiếp có cùng tiền điều kiện (trùng hoàn toàn nội dung Pre-condition), **được phép gộp ô theo chiều dọc (`mergeCells` trên Cột F)** để bảng gọn gàng, trực quan và dễ quan sát.
   - **Ràng buộc chính xác tuyệt đối:** CHỈ ĐƯỢC PHÉP gộp khi các ca kiểm thử đó thực sự trùng khớp 100% về Pre-condition. Những test case có Pre-condition khác nhau thì **bắt buộc giữ nguyên từng ô riêng biệt**, tuyệt đối không được gộp.

8. **Xuất ra bảng Markdown chuẩn**

## Bảng Output

```markdown
| TC ID | Feature | Test Case Title_1 | Test Case Title_2 | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
```