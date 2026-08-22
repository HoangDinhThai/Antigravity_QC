---
name: backlog-task-analyzer
description: Đọc task từ link/key Backlog, phân tích và giải thích yêu cầu nghiệp vụ một cách chi tiết, dễ hiểu, sau đó tự động sinh bộ manual test cases đầy đủ các trường hợp (Happy path, Negative, Boundary, Edge cases, UI/UX, Authorization) theo chuẩn bảng Markdown. Kích hoạt khi người dùng dán link Backlog (e.g., https://xxx.backlog.com/view/PROJ-123), nhắc tới issue key (e.g. PROJ-123), hoặc yêu cầu "đọc task backlog", "phân tích task backlog", "lên testcase từ link backlog", "đọc link backlog phân tích và tạo testcase".
---

# Backlog Task Analyzer & Test Case Generator

Skill này chịu trách nhiệm tự động lấy thông tin chi tiết một task/issue từ Backlog qua link URL hoặc Issue Key, thực hiện phân tích và giải thích nghiệp vụ một cách cực kỳ chi tiết, dễ hiểu, sau đó xây dựng bộ Manual Test Cases bao phủ toàn bộ các kịch bản (Positive, Negative, Boundary, Edge cases, UI/UX, Security/Permission).

---

## 🎯 Khi Nào Kích Hoạt (Triggers)

Tự động kích hoạt khi người dùng:
- Dán URL Backlog (Ví dụ: `https://<space>.backlog.com/view/PROJ-123` hoặc `https://<space>.backlog.jp/view/PROJ-123`).
- Nhắc tới Issue Key kết hợp yêu cầu đọc/lên testcase (Ví dụ: "Đọc giúp mình task SDR-456", "Phân tích task ADF-789 và lên testcase").
- Sử dụng các câu lệnh: `phân tích task backlog`, `đọc link backlog`, `lên testcase từ backlog`, `tạo test case cho task này`.

---

## 🛠️ Quy Trình Thực Hiện (Workflow 4 Bước)

### Bước 1: Trích Xuất & Truy Vấn Thông Tin Từ Backlog

1. **Parse Input**:
   - Trích xuất `issueKey` từ URL hoặc văn bản người dùng gửi (Ví dụ: từ `https://sdr.backlog.com/view/SDR-205` lấy ra `SDR-205`).
2. **Gửi API Lấy Thông Tin (MCP Backlog Tools)**:
   - Lấy thông tin Task chính: Gọi `mcp_backlog_get_issue(issueKey="SDR-205")`. Thu thập `summary`, `description`, `issueType`, `priority`, `status`, `assignee`, `customFields`.
   - Lấy thảo luận bổ sung: Gọi `mcp_backlog_get_issue_comments(issueKey="SDR-205")` để nắm các yêu cầu làm rõ, trao đổi giữa Dev, BA, QC.
   - Nếu task có file đính kèm/spec: Gọi `mcp_backlog_get_issue_attachments(issueKey="SDR-205")` để kiểm tra.

---

### Bước 2: Phân Tích & Giải Thích Task Chi Tiết, Cực Kỳ Dễ Hiểu

Trình bày nội dung phân tích nghiệp vụ rõ ràng, chi tiết, sử dụng ngôn phong dễ tiếp cận (có thể giải thích cho cả QC mới hoặc Stakeholder cùng hiểu):

1. 📌 **Tóm Tắt Mục Tiêu (Executive Summary)**:
   - Task này làm gì? Giải quyết bài toán gì? Cho đối tượng người dùng nào?
2. 🔄 **Luồng Nghiệp Vụ Thực Tế (User Journey / Workflow)**:
   - Diễn giải từng bước thao tác từ góc nhìn người dùng (Who - When - What - How).
   - Ví dụ minh họa thực tế dễ hình dung.
3. ⚙️ **Quy Tắc Nghiệp Vụ & Logic Kiểm Tra (Business Rules & Validation Rules)**:
   - **Điều kiện đầu vào (Pre-conditions)**: Người dùng phải có quyền gì, trạng thái hệ thống ban đầu ra sao.
   - **Ràng buộc trường dữ liệu (Field Constraints)**: Bắt buộc/Không bắt buộc, độ dài min/max, ký tự cho phép, tính duy nhất (unique), định dạng (Email, Phone, Date...).
   - **Xử lý logic backend (Business Logic)**: Quy trình tính toán, lưu trữ DB, gửi notification, gọi API bên thứ 3.
   - **Kết quả đầu ra (Output / Post-conditions)**: Giao diện thay đổi như thế nào, thông báo thành công/lỗi ra sao.
4. ⚠️ **Các Điểm Cần Lưu Ý / Edge Cases Nghiệp Vụ**:
   - Rủi ro logic, trường hợp tiềm ẩn lỗi (Corner cases), sự tương tác với các tính năng/module khác.

---

### Bước 3: Xây Dựng Bộ Test Cases Bao Phủ Toàn Diện

Áp dụng kỹ thuật QA chuẩn (Equivalence Partitioning, Boundary Value Analysis, Decision Table, Error Guessing):

1. **Phân Nhóm Test Scenarios**:
   - 🟢 **Happy Path (Positive)**: Các kịch bản sử dụng chuẩn, dữ liệu nhập hợp lệ, thực thi thành công.
   - 🔴 **Negative & Validation**: Nhập thiếu trường bắt buộc, nhập sai định dạng, dữ liệu đã tồn tại, vượt giới hạn cho phép.
   - 🟡 **Boundary Value Analysis (BVA)**: Giá trị biên dưới, biên trên, sát biên (`min-1`, `min`, `max`, `max+1`).
   - 🟣 **Edge Cases & System Exceptions**: Chuỗi văn bản siêu dài, ký tự đặc biệt/HTML/Emoji, click đúp liên tục (double click), mất kết nối giữa chừng, timeout.
   - 🔵 **UI/UX & Ergonomics**: Căn chỉnh button, hiển thị tooltip, màu sắc thông báo lỗi, trạng thái disable nút submit khi form chưa đủ điều kiện.
   - 🟠 **Permission & Role Security (nếu có)**: Phân quyền theo vai trò (Admin, Manager, User), truy cập không hợp lệ qua URL.

2. **Quy Tắc Viết Test Case (BẮT BUỘC NGUYÊN TẮC)**:
   - **Tên Test Scenario & Test Case**: Viết bằng **TIẾNG VIỆT CỰC KỲ NGẮN GỌN, RÕ RÀNG**, câu từ chuẩn hóa để BrSE/Comtor có thể đọc hiểu và dịch ngay sang tiếng Nhật một cách dễ dàng. Không cần dịch sẵn tiếng Nhật trong bảng (trừ các tên nút/UI element bằng tiếng Nhật giữ nguyên trong ngoặc vuốt `[物件詳細]`).
     * Cấu trúc tiêu chuẩn: `[Hành động / Hiển thị] + [Đối tượng] + [Màn hình / Điều kiện]`
     * Ví dụ chuẩn gọn:
       - Scenario: `Hiển thị nút bấm (Admin)`
       - Test Case: `Hiển thị nút [物件詳細] trên Card (Admin)`
   - **Test Data (BẮT BUỘC BÁM SÁT NGỮ CẢNH TASK & DOMAIN)**:
     * ❌ **CẤM HOÀN TOÀN**: Dùng dữ liệu test kiểu chung chung, rập khuôn, ngây ngô (như `nhập email đúng`, `nhập pass sai`, `abc@gmail.com`, `admin@123`, `123456`, `test_data_1`).
     * ✅ **BẮT BUỘC BÁM SÁT NGỮ CẢNH TASK & DỰ ÁN**:
       - **Trích xuất trực tiếp từ Task Spec & Comments**: Thu thập toàn bộ các trường thông tin, mã entity, role, trạng thái, định dạng, giới hạn ký tự (min/max), regex xuất hiện trong mô tả task, bình luận của BA/Dev hoặc tài liệu đính kèm để làm Test Data.
       - **Bám sát Lĩnh vực Nghiệp vụ (Domain Context)**: Dùng danh từ, thuật ngữ, mẫu dữ liệu thực tế đúng lĩnh vực nghiệp vụ của dự án (ví dụ: với dự án Bất động sản Nhật Bản -> Mã BĐS `RE-2026-TK01`, Tên dự án `パークホームズ恵比寿`, Địa chỉ `東京都渋谷区恵比寿1-2-3`, Giá bán `65,000,000 JPY`, Diện tích `75.5m²`; với E-commerce -> Mã SKU `SKU-IP15-PRO-256`, Tên sản phẩm `iPhone 15 Pro 256GB Gold`...).
       - **Đúng Role & Account quy định**: Dùng đúng tên tài khoản, role/quyền hạn được đề cập trong task (ví dụ: `property_mgr_01@sdr.jp` với Role `[Property Manager]`, không dùng role `admin` chung chung nếu task yêu cầu role cụ thể).
       - **Data Negative / Boundary bám sát Rule Task**: Dữ liệu vi phạm phải phản ánh đúng điểm gãy nghiệp vụ được định nghĩa trong task. (Ví dụ: Task yêu cầu nhập Mã bưu điện Nhật 7 chữ số -> Negative Data: `100-0001` (chứa dấu gạch ngang), `100001` (thiếu số), `10000012` (thừa số)).
       - **Minh họa so sánh Data**:
         | Trường hợp | ❌ Data Chung Chung (CẤM) | ✅ Data Bám Sát Task & Ngữ Cảnh (BẮT BUỘC) |
         |---|---|---|
         | Form BĐS hợp lệ | `Tên: House 1`, `Giá: 1000`, `Địa chỉ: ABC` | `Tên: パークホームズ恵比寿`, `Giá: 65,000,000 JPY`, `Địa chỉ: 東京都渋谷区恵比寿1-2-3` |
         | Vượt giới hạn ký tự | `Tên dài: abcdefghijklmnopqrstuvwxyz...` | `Tên dài > 50 chars`: "Dự án căn hộ chung cư cao cấp Grand Maison Shinjuku Tower Block A (Phiên bản mở rộng 2026)" |
         | Tài khoản & Quyền | `User: admin`, `Role: user` | `Account: property_mgr_01@sdr.jp`, `Role: [Property Manager]` (đúng role trong task) |
   - **Test Steps**: Các bước nguyên tử (Atomic steps), rõ ràng (1. Truy cập..., 2. Nhập..., 3. Click...).
   - **Expected Result**: Cụ thể, định lượng/định tính đo lường được (Ví dụ: "Hiển thị alert đỏ với text 'Email đã tồn tại'").

3. **Định Dạng Bảng Output (Markdown Table)**:

```markdown
| TC ID | Test Scenario | Test Case | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC_01 | Tạo mới thông tin BĐS | Tạo mới BĐS thành công với dữ liệu hợp lệ (Property Manager) | 1. Đã đăng nhập bằng tài khoản `property_mgr_01@sdr.jp`<br>2. Đã ở trang `/properties/create` | 1. Nhập Mã BĐS vào ô [物件コード]<br>2. Nhập Tên BĐS vào ô [物件名]<br>3. Nhập Giá bán vào ô [販売価格]<br>4. Click nút [登録する] | Mã BĐS: `RE-2026-TK01`<br>Tên BĐS: `パークホームズ恵比寿`<br>Giá bán: `65000000` | 1. Tạo BĐS thành công<br>2. Hiển thị thông báo Toast "物件情報が正常に登録されました"<br>3. Chuyển hướng sang màn hình chi tiết BĐS `/properties/RE-2026-TK01` | High |
```

---

### Bước 4: Tóm Tắt & Đề Xuất Hành Động Tiếp Theo

1. **Báo cáo độ bao phủ (Test Coverage Summary)**:
   - Tổng số test cases đã sinh.
   - Số lượng kịch bản theo từng nhóm (Positive / Negative / Boundary / UI).
2. **Đề xuất tích hợp**:
   - Gợi ý người dùng: *"Bạn có muốn xuất bộ testcases này lên Google Sheet của dự án không?"* (Nếu có -> sử dụng skill `google_sheets_integration`).
   - Gợi ý người dùng: *"Bạn có muốn tạo tự động script Playwright/Selenium cho các Happy Path test cases này không?"* (Nếu có -> sử dụng skill `qa_automation_engineer`).
