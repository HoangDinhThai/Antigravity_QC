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
   - **Test Data**: CẤM viết chung chung ("nhập email đúng", "nhập pass sai"). BẮT BUỘC cấp dữ liệu thực tế (`qa_admin@sdr.vn`, `SecurePass@2026`, `SKU_SDR_8899`).
   - **Test Steps**: Các bước nguyên tử (Atomic steps), rõ ràng (1. Truy cập..., 2. Nhập..., 3. Click...).
   - **Expected Result**: Cụ thể, định lượng/định tính đo lường được (Ví dụ: "Hiển thị alert đỏ với text 'Email đã tồn tại'").

3. **Định Dạng Bảng Output (Markdown Table)**:

```markdown
| TC ID | Test Scenario | Test Case | Pre-Condition | Test Steps | Test Data | Expected Result | Priority |
|---|---|---|---|---|---|---|---|
| TC_01 | Đăng nhập hệ thống | Đăng nhập thành công (Admin) | Đã ở trang /login | 1. Nhập email vào ô Email<br>2. Nhập mật khẩu vào ô Mật khẩu<br>3. Click nút "Đăng nhập" | Email: `admin_test@sdr.vn`<br>Password: `Admin@123456` | 1. Đăng nhập thành công<br>2. Chuyển hướng sang `/dashboard` | High |
```

---

### Bước 4: Tóm Tắt & Đề Xuất Hành Động Tiếp Theo

1. **Báo cáo độ bao phủ (Test Coverage Summary)**:
   - Tổng số test cases đã sinh.
   - Số lượng kịch bản theo từng nhóm (Positive / Negative / Boundary / UI).
2. **Đề xuất tích hợp**:
   - Gợi ý người dùng: *"Bạn có muốn xuất bộ testcases này lên Google Sheet của dự án không?"* (Nếu có -> sử dụng skill `google_sheets_integration`).
   - Gợi ý người dùng: *"Bạn có muốn tạo tự động script Playwright/Selenium cho các Happy Path test cases này không?"* (Nếu có -> sử dụng skill `qa_automation_engineer`).
