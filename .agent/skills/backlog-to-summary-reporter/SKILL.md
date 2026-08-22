---
name: backlog-to-summary-reporter
description: Skill dùng để lấy thông tin các bug từ dự án Backlog và điền/append vào trang tính Summary của một file Google Sheet được chỉ định, tự động phát hiện hàng trống để điền tiếp và giữ nguyên dữ liệu cũ. Trigger khi QC yêu cầu 'Export bug' kèm theo thời gian, dự án, link Google Sheet và trang tính.
---

# Backlog to Summary Reporter

## Overview
Skill này hỗ trợ QC tự động kết xuất (export) danh sách bug từ dự án Backlog trong một khoảng thời gian xác định, sau đó điền nối tiếp vào file Google Sheet báo cáo (Summary report) được chỉ định mà không làm ảnh hưởng đến dữ liệu cũ.

## 🛑 Global Directives: No Ad-hoc Scripts & No Sheet Formatting Changes
1. **KHÔNG TỰ Ý TẠO** các script tạm thời hoặc ad-hoc (Node.js, Python, Bash...) để chạy trực tiếp trên máy của người dùng. Thay vào đó, **luôn luôn sử dụng** script được đóng gói sẵn đi kèm với skill này tại `scripts/export_bugs.js`.
2. **KHÔNG TỰ Ý THAY ĐỔI ĐỊNH DẠNG (FORMAT, STYLE, HEADER)**: Tuyệt đối không tự viết code, gọi API hay thực hiện bất kỳ hành động nào nhằm thay đổi màu sắc, font chữ, đường viền, tiêu đề cột hoặc xóa/chỉnh sửa các dòng tóm tắt (Summary) hiện có ở phía trên bảng tính. Skill chỉ được phép chạy script `scripts/export_bugs.js` để ghi dữ liệu thô (raw values) nối tiếp vào các hàng trống của bảng.

---

## Cấu trúc yêu cầu của QC (Triggers)
Skill này sẽ được kích hoạt khi QC cung cấp yêu cầu xuất bug theo cấu trúc sau:

```text
Export bug:
Thời gian: từ <ngày_bắt_đầu> đến <ngày_kết_thúc>
Dự án: <mã_dự_án_backlog>
File google sheet: <link_hoặc_id_google_sheet>
Trang tính: Summary (hoặc tên trang tính khác)
```

Ví dụ:
```text
Export bug:
Thời gian: từ 1/4/2026 đến 30/6/2026
Dự án: IHC
File google sheet: https://docs.google.com/spreadsheets/d/16fhgkC4uPRUcUF7fd0oyvG39WzSfWCth5HjZgw2LgSE/edit
Trang tính: Summary
```

---

## Quy trình thực hiện (Workflow)

### Bước 1 — Phân tích yêu cầu từ QC
1. Trích xuất các tham số từ yêu cầu của QC:
   * **Project Key**: Ví dụ `IHC`
   * **Start Date**: Định dạng lại thành `YYYY-MM-DD` (Ví dụ `1/4/2026` chuyển thành `2026-04-01`)
   * **End Date** (nếu có): Định dạng lại thành `YYYY-MM-DD` (Ví dụ `30/6/2026` chuyển thành `2026-06-30`)
   * **Google Sheet Link**: Lấy URL hoặc ID của Google Sheet từ link gửi kèm.
   * **Worksheet Name**: Mặc định là `Summary` nếu không chỉ định.

### Bước 2 — Chạy script đồng bộ
Sử dụng công cụ `run_command` để thực thi script Node.js đi kèm trong thư mục `scripts/` của skill này.

**Lệnh thực thi mẫu:**
```bash
node c:\Users\minh.nguyen\Documents\IHC\skills-20260312-151912\.agent\skills\backlog-to-summary-reporter\scripts\export_bugs.js --project <projectKey> --start <startDate> --end <endDate> --sheet "<sheetUrlOrId>" --tab "<tabName>"
```

**Cách hoạt động của script:**
1. **Xác thực tự động**: Sử dụng file credentials dịch vụ Google Sheet tại đường dẫn mặc định `C:/Users/minh.nguyen/Documents/mcp-minhnt97-1a99840a5f64.json`.
2. **Tìm nạp Bug**: Gọi API của Backlog tìm tất cả các bug thuộc dự án chỉ định trong khoảng thời gian yêu cầu.
3. **Đọc dữ liệu hiện tại**: Đọc trang tính bắt đầu từ ô `A9` để tính toán số lượng hàng hiện có.
4. **Ghi tiếp (Append)**: Xác định hàng trống đầu tiên (bằng cách lấy `9 + số_hàng_hiện_tại`) và thực hiện ghi toàn bộ dữ liệu mới tìm được từ Backlog từ hàng đó. Toàn bộ hàng cũ và thứ tự cũ được giữ nguyên vẹn.

### Mapping trường dữ liệu

Dữ liệu ghi vào Google Sheet tuân theo mapping sau:

| Google Sheet | Backlog Field / Custom Field | Detail |
| :--- | :--- | :--- |
| **No.** | `issueKey` | e.g. `IHC-988` |
| **Bug Name** | `summary` | Subject của bug |
| **Bug Description** | `description` | Mô tả chi tiết bug |
| **Create Date** | `created` | Định dạng `D/M/YYYY` |
| **Bug Type** | Custom Field `26315` | Ví dụ `Functional Bug` |
| **Bug Severity** | Custom Field `26316` | Ví dụ `Major` |
| **Bug Priority** | `priority.name` | Ví dụ `Normal` |
| **Phase Detected** | Custom Field `26317` | Ví dụ `System Testing` |
| **Tester** | `createdUser.name` | Người tạo bug |
| **Status** | `status.name` | Trạng thái hiện tại |
| **Assignee** | `assignee.name` | Người xử lý (nếu có) |
| **Bug Cause** | Custom Field `26318` | Nguyên nhân lỗi |
| **Phase Injected** | Custom Field `26319` | Giai đoạn lỗi phát sinh |
| **Cause Description** | Custom Field `26320` | Chi tiết nguyên nhân |
| **How to fix** | Custom Field `26321` | Cách khắc phục |

---

## Checklist chất lượng (Quality Checklist)

Trước khi xác nhận hoàn thành với QC, hãy đảm bảo:

- [ ] Phân tích chính xác khoảng thời gian và mã dự án từ yêu cầu của QC.
- [ ] Chạy đúng script đóng gói sẵn của skill, không viết code ad-hoc.
- [ ] Xác nhận số lượng hàng cũ và vị trí hàng trống đầu tiên được in ra trong log chạy.
- [ ] Xác nhận thông tin bug mới được ghi nối tiếp thành công từ hàng trống phát hiện được.
- [ ] Không có dữ liệu cũ nào bị ghi đè hoặc xáo trộn thứ tự.
