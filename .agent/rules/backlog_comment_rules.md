# BACKLOG COMMENT REPORTING RULES

> **Scope:** Áp dụng BẮT BUỘC cho tất cả tác vụ soạn thảo, chuẩn hóa bản nháp và đẩy comment báo cáo kiểm thử (Test Evidence Report / Progress Report / Bug Evidence) lên hệ thống Backlog.

---

## ⛔ 1. QUY TRÌNH PHÊ DUYỆT BẢN NHÁP & KÉO TRẠNG THÁI TASK (APPROVAL GATES)

1. **CẤM TỰ Ý PUSH COMMENT TRỰC TIẾP (KỂ CẢ KHI ĐANG SỬA NỘI DUNG):**
   - **TUYỆT ĐỐI NÓI KHÔNG** với việc gọi API `mcp_backlog_add_issue_comment` hoặc script push comment lên Backlog khi chưa qua bước User kiểm tra và phê duyệt bản nháp.
   - **Trong quá trình chỉnh sửa / cập nhật nội dung task hoặc comment:** Tất cả chỉnh sửa CHỈ ĐƯỢC LƯU VÀO FILE NHÁP LOCAL (`evidence/test-evidence-{issueKey}.md`). KHÔNG ĐƯỢC tự động push bất kỳ comment nào lên Backlog cho đến khi User phát lệnh push cụ thể.
2. **CẤM TỰ Ý KÉO/THAY ĐỔI TRẠNG THÁI TASK (STATUS):**
   - **TUYỆT ĐỐI KHÔNG TỰ Ý KÉO/ĐỔI STATUS TASK** (ví dụ: chuyển từ `Testing` sang `Review` - ID: 31773, hoặc `Resolved`/`Closed`).
   - Luôn **hỏi ý kiến User** rõ ràng trong lúc duyệt bản nháp (ví dụ: *"Có đổi status task sang Review không bạn?"*). Chỉ thực hiện chuyển status khi User xác nhận đồng ý.
3. **QUY TẮC SỬA TRỰC TIẾP COMMENT ĐÃ CÓ (CẤM TẠO COMMENT MỚI KHI SỬA LỖI/CẬP NHẬT):**
   - Trong trường hợp comment đã được push lên nhưng gặp lỗi lưu/hiển thị ảnh đính kèm, hoặc cần sửa đổi/bổ sung nội dung của comment đó: **BẮT BUỘC phải sửa trực tiếp (Update/Edit) vào chính comment đã tạo**.
   - **TUYỆT ĐỐI CẤM TẠO COMMENT MỚI** để đính kèm lại ảnh sửa lỗi hoặc gửi lại nội dung đè lên comment cũ, tránh làm rác và trùng lặp comment trên ticket Backlog.
4. **QUY TRÌNH 4 BƯỚC THỰC THI BẮT BUỘC:**
   - **Bước 1 (Drafting & Editing):** Soạn hoặc chỉnh sửa nội dung báo cáo ra file nháp local tại thư mục `evidence/test-evidence-{issueKey}.md` (hoặc `test-evidence-{issueKey}-tc{X}.md`).
   - **Bước 2 (User Review):** Hiển thị đường dẫn file nháp + tóm tắt bản nháp trong conversation để User duyệt, **kèm câu hỏi xác nhận có muốn chuyển trạng thái task hay không**.
   - **Bước 3 (Upload Attachment & Push Comment):**
     - Chỉ thực thi khi User đồng ý / phát lệnh push (ví dụ: *"Đẩy comment lên backlog"*, *"Push report đi"*).
     - Upload toàn bộ ảnh bằng chứng (`media_xxx.png`) qua API `mcp_backlog_post_space_attachment` để lấy danh sách `attachmentId`.
     - Gọi API push comment (hoặc update comment cũ nếu đang sửa lỗi) kèm theo mảng `attachmentId` và **bắt buộc** truyền `notifiedUserId` (ví dụ `[327651]` cho `@Hung Do (ドー)`).
   - **Bước 4 (Status Update & Reporting):**
     - Chỉ cập nhật trạng thái ticket (`mcp_backlog_update_issue`) NẾU VÀ CHỈ NẾU User đã đồng ý ở Bước 2/Bước 3. Nếu User không yêu cầu đổi status thì GIỮ NGUYÊN trạng thái hiện tại.
     - Báo cáo kết quả kèm link trực tiếp comment trên Backlog cho User.

---

## 📋 2. CẤU TRÚC VÀ ĐỊNH DẠNG COMMENT (COMPACT & NON-TECH FRIENDLY)

1. **Tiêu chí Hàng đầu (Ngắn gọn & Dễ hiểu cho mọi đối tượng):**
   - Báo cáo phải **CỰC KỲ NGẮN GỌN, CỰC KỲ DỄ HIỂU** để Developer, Khách hàng (Client), hoặc PM non-tech đọc đều nắm bắt được ngay vấn đề và kết quả mà không cần giải thích thêm.
   - Tránh dùng thuật ngữ kỹ thuật rườm rà, giải thích lê thê. Dùng ngôn từ trực diện, mạch lạc, minh họa rõ ràng bằng hình ảnh.
2. **Đầu Comment (Tag & Polite Request):**
   - **Dòng 1:** Tag tên người nhận: `@Hung Do (ドー)` (hoặc username/developer phụ trách).
   - **Dòng ngay bên dưới Tag:** Thêm câu nhắn ngắn gọn, lịch sự:
     `* Anh check lại giúp em ticket {TICKET_KEY} nhé!` (hoặc `- A chek lại nhé a`).
3. **Phong cách Gọn Nhẹ (Compact Mode):**
   - Đi thẳng vào **Chi tiết các Bước kiểm thử / Test Cases kèm Bằng chứng Ảnh (Evidence)**.
   - **BỎ Bảng Tổng hợp rườm rà (Summary Table) & Mục Kết luận thừa ở đầu/cuối** (trừ khi User yêu cầu rõ ràng).
4. **Chi tiết Các Bước / Test Case:**
   - Đánh số rõ ràng từng bước/kịch bản: `#### 🔹 Bước X:` hoặc `### 🔹 TC_0X:`.
   - **Thao tác (Action):** Mô tả ngắn gọn, chính xác (UI CRM, DB SQL query, API Core response, Command execution).
   - **Test Data / Dữ liệu thực tế:** Ghi rõ ID, Email, Mã NV, Record ID thực tế (ví dụ: User A `id = 12`, `staff_number = DEV4`). **KHÔNG** dùng placeholder hay dữ liệu giả lập chung chung.
   - **Kết quả xác nhận:** Nêu rõ các mục đã verify thành công (`PASSED ✅`).

---

## 🖼️ 3. HIỂN THỊ HÌNH ẢNH & GIÃN CÁCH DÒNG (IMAGE EVIDENCE & SPACING)

1. **Cú pháp Ảnh đính kèm trên Backlog (BẮT BUỘC):**
   - Backlog **KHÔNG** hiển thị ảnh nếu dùng ngoặc tròn Markdown tiêu chuẩn `![alt](filename.png)`.
   - **BẮT BUỘC** dùng cú pháp ngoặc vuông cho Backlog attachments:
     `![Trạng thái DB][media__1787381436337.png]` hoặc `![Alt][filename.png]`
2. **Dòng trống Giãn cách (Line Breaks):**
   - **BẮT BUỘC** chèn khoảng trống (dòng trống `\n\n`) ở cả phía **TRÊN** và phía **DƯỚI** mỗi hình ảnh evidence.
   - Giúp giao diện comment trên Backlog thoáng, đẹp mắt và ảnh không dính liền vào văn bản.
3. **Không chèn SQL Code block dài:**
   - Khi đã có ảnh chụp màn hình DBeaver/Database minh họa, **KHÔNG** paste cả đoạn SQL dài lê thê dưới dạng text code block.

---

## 🔔 4. KÍCH HOẠT NOTIFICATION & TAG MÀU XANH (TAGGING RULE)

- Khi gọi API Backlog `mcp_backlog_add_issue_comment` hoặc `mcp_backlog_update_issue`:
  - **BẮT BUỘC** phải truyền mảng `notifiedUserId: [userId]` (ví dụ: `notifiedUserId: [327651]` cho `@Hung Do (ドー)`).
  - Thao tác này kích hoạt hiển thị tag màu xanh chuẩn trên UI Backlog và gửi thông báo trực tiếp tới tài khoản người nhận.

---

## 📝 5. MẪU BÁO CÁO NHÁP CHUẨN (TEMPLATE)

```markdown
@Hung Do (ドー)

* Anh check lại giúp em ticket SDR-186 nhé!

---

### 📋 CHI TIẾT CÁC BƯỚC KIỂM THỬ VÀ BẰNG CHỨNG (TEST EVIDENCE)

#### 🔹 Bước 1: Kiểm tra thông tin User ban đầu trong DB
* **Thao tác:** Tra cứu trong bảng `t_accounts`, xác nhận User A (`id = 12`) có `email = sfit_choice_ie-verification4@initial-engine.io` và `staff_number = DEV4`.

![Trạng thái ban đầu User id=12][media__1787381436337.png]

---

#### 🔹 Bước 2: Thực thi Command dọn dẹp dữ liệu thừa
* **Thao tác:** Chạy Command gộp và xóa tài khoản trùng lặp/không tồn tại trên hệ thống CORE.

![Thực thi Command dọn dẹp data thừa][media__1787382470722.png]

---

#### 🔹 Bước 3: Kiểm tra lại DB & UI sau khi Command thực thi thành công
* **Thao tác:** Kiểm tra lại thông tin trong DB và danh sách nhân viên trên giao diện UI.
* **Kết quả xác nhận:**
  1. **User A (`id = 12`):** Tự động được cập nhật lại `staff_number` về lại đúng mã **`DEV4`**.
  2. **User B (`id = 1811`):** Record trùng lặp đã bị xóa khỏi DB.

![Xác minh DB sau khi Command chạy thành công][media__1787382486399.png]

![Xác minh UI danh sách nhân viên sau khi dọn dẹp][media__1787383828647.png]
```
