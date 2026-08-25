---
name: backlog-comment-reporter
description: >
  Skill chuyên dùng để soạn thảo, chuẩn hóa bản nháp và đẩy comment báo cáo kiểm thử (Test Evidence Report / Progress Report) lên các ticket trên hệ thống Backlog.
  Trigger khi người dùng yêu cầu: "đẩy comment lên task", "báo cáo evidence", "push report backlog", "tạo report test evidence", "báo cáo tiến độ test", hoặc đề cập việc tag @Hung Do / push comment lên Backlog ticket.
---

# Backlog Comment Reporter Skill

## Overview

Skill này quy định quy trình thực thi và điều phối việc soạn thảo bản nháp, chuẩn hóa định dạng hình ảnh bằng chứng (evidence), tag thông báo (notification tag), và đẩy comment báo cáo kiểm thử lên ticket Backlog theo đúng quy định tại `.agent/rules/backlog_comment_rules.md`.

---

## 📜 RULE REFERENCE

Tất cả các quy tắc chi tiết về cấu trúc comment, cú pháp ảnh Backlog, khoảng trống dòng, tag notification và quy trình phê duyệt bản nháp được quy định tại:
👉 **[Quy tắc Backlog Comment Reporting](file:///home/thai.hoang.dinh/SDR/.agent/rules/backlog_comment_rules.md)**

---

## ⛔ CRITICAL WORKFLOW (QUY TRÌNH 4 BƯỚC)

1. **Bước 1 - Drafting & Editing:** 
   - Soạn hoặc chỉnh sửa nội dung báo cáo ra file nháp local tại đường dẫn `evidence/test-evidence-{issueKey}.md` (hoặc `test-evidence-{issueKey}-tc{X}.md`).
   - **BÁO CÁO BẮT BUỘC CỰC KỲ NGẮN GỌN, CỰC KỲ DỄ HIỂU:** Đảm bảo Developer, Khách hàng (Client) hoặc PM non-tech đọc đều nắm được ngay vấn đề và kết quả kiểm thử mà không cần giải thích thêm.
   - Tuân thủ cấu trúc gọn nhẹ (Compact Mode) và cú pháp ảnh ngoặc vuông `![alt][filename.png]` kèm dòng trống giãn cách 2 đầu.
   - **Kể cả khi đang chỉnh sửa/cập nhật nội dung:** Mọi thao tác sửa đổi CHỈ thực hiện trên file nháp local, TUYỆT ĐỐI KHÔNG tự động push comment lên Backlog.
2. **Bước 2 - User Review (Approval Gate):**
   - **TUYỆT ĐỐI KHÔNG PUSH TRỰC TIẾP LÊN BACKLOG VÀ KHÔNG TỰ Ý ĐỔI STATUS TASK.**
   - Trình bày nội dung bản nháp (hoặc phần vừa chỉnh sửa) và đường dẫn file local cho User review và phê duyệt, **hỏi ý kiến User có muốn chuyển trạng thái task (status) hay không**.
3. **Bước 3 - Attachment Upload & Push/Update Comment:**
   - Khi User đồng ý / phát lệnh push:
     - Upload toàn bộ ảnh bằng chứng (`media_xxx.png`) qua API `mcp_backlog_post_space_attachment` (hoặc script upload) để lấy danh sách `attachmentId`.
     - **Nếu tạo comment lần đầu:** Đẩy comment bằng `mcp_backlog_add_issue_comment` kèm mảng `attachmentId` và **bắt buộc** truyền `notifiedUserId` (ví dụ `[327651]` cho `@Hung Do (ドー)`).
     - **Nếu sửa lỗi hiển thị ảnh hoặc chỉnh sửa nội dung của comment đã tạo:** **SỬA TRỰC TIẾP TRÊN COMMENT CŨ**, tuyệt đối **KHÔNG TẠO COMMENT MỚI** gây trùng lặp/rác ticket.
4. **Bước 4 - Status Update & Reporting:**
   - **Chỉ kéo/cập nhật status ticket khi được User đồng ý/phê duyệt cụ thể.** Nếu không có yêu cầu từ User, giữ nguyên status hiện tại.
   - Trả về link trực tiếp của comment trên Backlog cho User.

---

## 🛠️ MCP TOOLING MAPPING

| Thao tác | Tool MCP sử dụng |
| :--- | :--- |
| **Upload file ảnh đính kèm** | `mcp_backlog_post_space_attachment(filePaths=[...])` |
| **Đẩy comment kèm tag & ảnh** | `mcp_backlog_add_issue_comment(issueKey, content, attachmentId=[...], notifiedUserId=[...])` |
| **Cập nhật status ticket (Chỉ khi User duyệt)** | `mcp_backlog_update_issue(issueKey, statusId=...)` *(Ví dụ: 31773 = Review)* |
