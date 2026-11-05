---
name: qc-task-tester
description: >
  Chuyên viên Kiểm thử Thực tế trên Hệ thống Web (QC Task Testing & Verification). Nhận task kiểm thử (mã task Backlog như LIMS-xxx, URL Backlog, hoặc yêu cầu kiểm thử tính năng), tự động mở browser Chrome headed mode 1920x1080 với persistent login profile, phân tích Acceptance Criteria, thực hiện thao tác kiểm thử trực tiếp trên web, chụp ảnh bằng chứng (evidence) có khoanh đỏ, phát hiện và lập bản nháp Bug chuẩn chỉ, và soạn thảo Báo cáo Bằng chứng Kiểm thử (Test Evidence Report) chuyên nghiệp.
  Kích hoạt khi người dùng yêu cầu: "test task này", "test task LIMS-...", "test giúp tôi task...", "test cho tôi màn hình/chức năng...", "kiểm thử task", "chạy test trên web", "kiểm tra giao diện", "lấy evidence test", "báo cáo test task".
---

# QC Task Tester — Kỹ Năng Kiểm Thử Thực Tế trên Hệ Thống Web

## 1. TỔNG QUAN & LẰN RANH ĐỎ BẮT BUỘC (CRITICAL GUARDRAILS)

Kỹ năng này định nghĩa quy trình chuẩn mực từ A-Z để AI đóng vai trò như một **Senior QC Manual / Automation** thực hiện kiểm thử thực tế trên hệ thống web: tiếp nhận task -> khởi chạy browser thật với phiên đăng nhập có sẵn -> thực thi thao tác kiểm thử -> chụp ảnh bằng chứng có khoanh đỏ -> bắt lỗi (nếu có) / lập báo cáo bằng chứng kiểm thử chuẩn chỉ.

> [!CAUTION]
> **CÁC NGUYÊN TẮC BẤT BIẾN (MANDATORY RULES):**
> 1. **🖥️ Môi trường & Viewport:** Bắt buộc chạy trình duyệt thật (**headed mode**: `headless: false`) với desktop viewport chuẩn **`1920x1080`**. Headless chỉ dùng khi test đã pass hoặc trên CI.
> 2. **🔐 Phiên đăng nhập có sẵn (Persistent Context):** Sử dụng thư mục profile Chrome đã đăng nhập sẵn tại:
>    `/home/thai.hoang.dinh/VNTEST/scratch/vntest-manual-login` (không đăng nhập lại từ đầu gây mất session).
> 3. **🔍 Inspect DOM Thực tế:** Bắt buộc inspect DOM/HTML thực tế trên trình duyệt — **TUYỆT ĐỐI KHÔNG ĐOÁN LOCATOR**. Verify locator chạy được trước khi dùng.
> 4. **🛑 Cổng Phê Duyệt (Approval Gate - TUYỆT ĐỐI BẮT BUỘC):**
>    - **TUYỆT ĐỐI KHÔNG TỰ Ý ĐẨY COMMENT HOẶC TẠO BUG LÊN BACKLOG.**
>    - **TUYỆT ĐỐI KHÔNG TỰ Ý ĐỔI TRẠNG THÁI TASK (STATUS) TRÊN BACKLOG.**
>    - Mọi báo cáo evidence hoặc bản nháp bug CHỈ được lưu trên máy local và trình bày ra chat để User kiểm tra, phê duyệt trước khi phát lệnh đẩy.
> 5. **📝 Ngôn ngữ Non-Tech & Dev Friendly:** Báo cáo bằng chứng và bản nháp bug viết bằng Tiếng Việt cực kỳ ngắn gọn, trực diện kết quả kiểm chứng. **CẤM TUYỆT ĐỐI** đưa selector CSS (`.btn-close`), mã code hay giải thích kỹ thuật rườm rà vào báo cáo.
> 6. **📸 Chuẩn Bằng Chứng Có Khoanh Đỏ:** Mọi hình ảnh nghiệm thu đều phải được đóng khung đỏ (`#DC2626`, viền 4px) hoặc gắn mũi tên vào đúng phần tử kiểm chứng và chú thích trong báo cáo là `(vùng khoanh đỏ)` hoặc `(vùng mũi tên đỏ)`.
> 7. **🚫 Git Pull Restriction:** Tuyệt đối KHÔNG chạy các lệnh git làm thay đổi code (`git pull`, `git checkout`, `git reset`, `git merge`).
> 8. **📊 Google Sheets Test Execution Rules (Bảo Toàn Dropdown Chip Chuẩn Dự Án):**
>    - Khi có Google Sheet test case liên kết với task hoặc người dùng cung cấp link Sheet:
>      + **Cột Web (Cột K):** Đánh giá `Passed` hoặc `Failed` (bảo toàn 100% Smart Canvas Dropdown Chip trên nền trắng `#FFFFFF`).
>      + **Cột Bug_ID (Cột L):** Điền mã Bug (ví dụ: `196_VNTEST_LIMS-919`) nếu Failed; để trống nếu Passed.
>      + **Cột Test Date (Cột N):** Điền ngày kiểm thử thực tế `DD/MM/YYYY` (ví dụ: `05/11/2026`).
>      + **CẤM TUYỆT ĐỐI:** CẤM dùng `setDataValidation` làm mất chip bo tròn, CẤM dùng Conditional Formatting lem màu nền ô, CẤM ghi đè làm mất merge Cột B (Module) và Cột M (Tester).
>      + **Bắt buộc Dry-Run & Approval:** Luôn chạy preview bảng kết quả thay đổi và xin phép User trước khi ghi thật lên Sheet.

---

## 2. QUY TRÌNH KIỂM THỬ THỰC TẾ 5 BƯỚC (5-STEP WORKFLOW)

```
[Bước 1: Tiếp nhận & Phân tích Task] ➔ [Bước 2: Khởi tạo Browser 1920x1080]
                     ↓
[Bước 3: Thao tác Kiểm thử & Chụp Ảnh Evidence Khoanh Đỏ]
                     ↓
   ┌─────────────────┴─────────────────┐
   ▼ (Nếu gặp lỗi)                     ▼ (Nếu đạt yêu cầu)
[Nhánh A: Lập Draft Bug 4 phần]      [Nhánh B: Lập Báo Cáo Test Evidence]
   └─────────────────┬─────────────────┘
                     ↓
[Bước 4: Trình Bày Ra Chat & Chờ User Phê Duyệt (Approval Gate)]
                     ↓ (Khi User đồng ý)
[Bước 5: Đẩy Lên Backlog & Dọn Dẹp Tài Nguyên Tạm (Cleanup)]
```

---

### Bước 1: Tiếp Nhận & Phân Tích Yêu Cầu Task (Task Intake)

1. **Nhận diện thông tin task:**
   - Trích xuất `issueKey` (ví dụ: `196_VNTEST_LIMS-897`, `LIMS-750`), URL Backlog, hoặc mô tả từ người dùng.
   - Nếu có mã task: Gọi MCP `mcp_backlog_get_issue(issueKey)` và `mcp_backlog_get_issue_comments(issueKey)` để đọc:
     + Summary & Description.
     + Các thảo luận, thống nhất thay đổi giữa Dev, BA, QC trong comments.
     + File tài liệu đặc tả / ảnh đính kèm (nếu có).
     + **Phát hiện link Google Sheet test cases:** Kiểm tra mô tả, comments hoặc prompt xem có link Google Sheet chứa test cases không. Nếu có, trích xuất URL và tên tab/gid để sẵn sàng cập nhật kết quả kiểm thử.
2. **Lập nhanh Checklist các điểm cần kiểm chứng:**
   - **Luồng chính (Happy path):** Tính năng mới/sửa hoạt động đúng như mô tả.
   - **Ràng buộc & Validate:** Bỏ trống trường bắt buộc, nhập sai format, trùng lặp.
   - **Bố cục & Trạng thái UI:** Vị trí, kích thước, tooltip, nút bấm vô hiệu hóa (`disabled`) khi chưa đủ điều kiện, biểu tượng xoay đang lưu chống click đúp.
   - **Tính toàn vẹn & Đồng bộ dữ liệu:** Dữ liệu sau khi thao tác phải hiển thị đúng tại:
     1. Màn hình danh sách (list page).
     2. Màn hình / hộp thoại chi tiết (detail modal / panel).
     3. Tab lịch sử thay đổi (Audit log / History tab) — ghi nhận đúng tài khoản, thời gian, trường bị đổi.
   - **Cơ chế bảo vệ dữ liệu chưa lưu (Unsaved Changes Guard):** Khi sửa dở mà bấm Hủy/Đóng phải hiện popup cảnh báo xác nhận.

---

### Bước 2: Khởi Tạo Trình Duyệt & Môi Trường Kiểm Thử

1. **Cấu hình môi trường:**
   - **Base URL:** `https://vntest-lims.pirago.work` (hoặc URL môi trường chỉ định).
   - **User Data Profile:** `/home/thai.hoang.dinh/VNTEST/scratch/vntest-manual-login`.
   - **Browser Executable:** `/usr/bin/google-chrome` (hoặc Chromium tương thích).
   - **Viewport & Window:** `{ width: 1920, height: 1080 }` với args `['--window-size=1920,1080', '--no-sandbox']`.
   - **Thư mục lưu Evidence:** `Evidence/{YYYY-MM-DD}/` (hoặc `Evidence/{YYYY-MM-DD}/{task_name}/`).

2. **Mẫu khởi tạo Playwright script chuẩn:**
   ```javascript
   import { chromium } from 'playwright-core';

   const context = await chromium.launchPersistentContext('/home/thai.hoang.dinh/VNTEST/scratch/vntest-manual-login', {
     headless: false,
     executablePath: '/usr/bin/google-chrome',
     viewport: { width: 1920, height: 1080 },
     args: ['--window-size=1920,1080', '--no-sandbox', '--disable-dev-shm-usage'],
   });
   const page = context.pages()[0] || await context.newPage();
   await page.goto('https://vntest-lims.pirago.work', { waitUntil: 'networkidle' });
   ```

---

### Bước 3: Thao Tác Kiểm Thử & Chụp Ảnh Evidence Khoanh Đỏ

1. **Thực hiện tương tác:**
   - Tuân thủ thứ tự thao tác nguyên tử:
     `navigate → resize(1920×1080) → wait_for(page_load) → snapshot/inspect → interact → screenshot`
   - Nhập liệu dữ liệu test thực tế (không dùng placeholder).
   - Thao tác nút bấm theo đúng hành vi người dùng: `Nhấn nút "<Tên nút>"`.
2. **Chụp ảnh màn hình (Screenshots):**
   - Chụp toàn màn hình ở độ phân giải `1920x1080`.
   - Đặt tên file theo thứ tự rõ ràng: `01_<mo_ta_ngan_gon>.png`, `02_<mo_ta_ngan_gon>.png`...
   - Lưu ảnh gốc vào thư mục tạm (ví dụ `scratch/evidence_raw_<task>/`).
3. **Khoanh đỏ / Đóng khung vùng kiểm chứng:**
   - Dùng script có sẵn của skill:
     ```bash
     python3 .agent/skills/qc-task-tester/scripts/annotate_evidence.py \
       --input scratch/evidence_raw/01_raw.png \
       --output Evidence/2026-11-05/01_danh_sach.png \
       --box 450,220,1200,80 \
       --label "Vùng kiểm chứng"
     ```
   - Hoặc tạo file `scratch/evidence_boxes.json` định nghĩa tọa độ hộp cho toàn bộ các ảnh và chạy batch:
     ```bash
     python3 .agent/skills/qc-task-tester/scripts/annotate_evidence.py \
       --config scratch/evidence_boxes.json \
       --raw-dir scratch/evidence_raw \
       --out-dir Evidence/2026-11-05
     ```
   - Màu viền chuẩn: Đỏ tươi `#DC2626` (RGB: `220, 38, 38`), độ dày viền `4px`.

---

### Bước 4: Xử Lý Kết Quả Kiểm Thử (Phân Nhánh Bug vs Pass)

#### 🔴 NHÁNH A: PHÁT HIỆN LỖI (BUG FOUND)
Khi hệ thống có lỗi chức năng, giao diện, logic tính toán, hoặc lệch đặc tả:
1. Chụp ngay ảnh màn hình bằng chứng lỗi tại viewport 1920x1080 và khoanh đỏ điểm lỗi.
2. Soạn bản nháp Bug tại file `backlog/draft/bug-<ten-loi>.md` kèm ảnh trong thư mục `backlog/draft/bug-<ten-loi>/`.
3. Tuân thủ nghiêm ngặt **Quy tắc Bug Reporting 4 phần**:
   - **Summary:** `[{Mã Task}][{Feature}]: {Hành vi lỗi}`
   - **CẤM Heading 1 `# <Title>` trong phần mô tả.** Bắt đầu thẳng từ `### 1. Các bước tái hiện:`.
   - **Thứ tự 4 phần:**
     ```markdown
     ---
     IssueKey: 
     IssueType: Bug
     Summary: [Mã Task][Feature]: <Hành vi lỗi ngắn gọn>
     Priority: Low | Normal | High
     ProgramLogicBugType: Functional Bug | Logical Bug | Interface Error | Workflow
     BugSeverity: Critical | Major | Minor
     PhaseDetected: System Testing
     ---

     ### 1. Các bước tái hiện:
     1. ...
     
     2. ...

     ### 2. Kết quả thực tế:
     - <1 câu ngắn gọn nêu thẳng hành vi lỗi, viết TRƯỚC kết quả mong đợi>

     ### 3. Kết quả mong đợi:
     - <1 câu ngắn gọn nêu hành vi đúng chuẩn>

     ### 4. Tài liệu đính kèm / Bằng chứng:
     - <Câu dẫn cực ngắn>:

     ![Tên ảnh][ten_file_anh.png]
     ```
4. **Trình bày bản nháp ra chat kèm đường dẫn file local** và hỏi ý kiến User trước khi thực hiện bất kỳ thao tác nào khác.

---

#### 🟢 NHÁNH B: KIỂM THỬ ĐẠT YÊU CẦU / HOÀN TẤT (PASSED / COMPLETED)
Khi toàn bộ tính năng hoạt động chuẩn xác theo Acceptance Criteria:
1. Soạn thảo Báo cáo Bằng chứng Kiểm thử (Test Evidence Report) và lưu tại file local:
   `Evidence/{YYYY-MM-DD}/test-evidence-{issueKey}.md`
2. **Cấu trúc Báo cáo Chuẩn chỉ (BẮT BUỘC):**
   - **Dòng 1:** Tag reviewer (`<@U349011>` hoặc `@Hung Do (ドー)` hoặc tag người dùng yêu cầu).
   - **Dòng 3:** Câu thông báo ngắn gọn: `"E đã test xong task này ạ!"` (hoặc `"E đã test xong request này ạ!"`).
   - **Dòng 5:** Kẻ phân cách `---` và `**Hình ảnh bằng chứng:**`.
   - **Các mục bằng chứng đánh số in đậm:**
     `**1. <Mô tả cực kỳ ngắn gọn, đi thẳng vào kết quả kiểm chứng trực quan> (vùng khoanh đỏ):**`
   - **Thẻ ảnh Backlog:** `![<Mô tả ảnh>][01_ten_file.png]`
   - **Quy tắc dòng trống (Line Spacing):**
     + Cách **1 dòng trống** (`\n\n`) giữa câu mô tả bằng chứng với thẻ ảnh.
     + Cách **1 dòng trống** (`\n\n`) sau mỗi thẻ ảnh trước khi sang mục đánh số tiếp theo.

3. **Cổng Phê Duyệt (Approval Gate - MANDATORY):**
   - Trình bày toàn bộ nội dung báo cáo và đường dẫn file local cho User review.
   - **Hỏi User:**
     > *"Bản nháp báo cáo evidence đã được soạn xong tại `Evidence/...`. Bạn kiểm tra giúp mình nhé. Bạn có muốn đẩy comment này lên Backlog ticket `{issueKey}` không và có muốn chuyển trạng thái task sang `Review` / `Resolved` không?"*
   - **CHỈ GỌI API PUSH KHI USER ĐÃ PHÊ DUYỆT RÕ RÀNG.**

---

#### 📊 NHÁNH C: ĐÁNH GIÁ & ĐỒNG BỘ KẾT QUẢ GOOGLE SHEETS (TEST EXECUTION SYNC)

Khi có link Google Sheet test cases đi kèm (từ Backlog ticket hoặc người dùng cung cấp):
1. **Xác định các Test Case liên quan trong Sheet:**
   - Dò tìm theo mã TC ID (Cột O - Comments, ví dụ: `VNTEST_LIMS_GCT_TC_001` hoặc `TC_001`).
   - Hoặc dò tìm theo số thứ tự STT (Cột A) / số dòng (Row) / Tiêu đề (Cột D Title_1, Cột E Title_2).
2. **Quy tắc gán giá trị kết quả:**
   - **Ca kiểm thử PASS:**
     + **Cột K (Web):** `"Passed"` (Tự động hiển thị Dropdown Chip xanh lá `#CEEAD6` trên nền trắng `#FFFFFF`).
     + **Cột L (Bug_ID):** `""` (xóa mã bug cũ nếu có).
     + **Cột N (Test Date):** Ngày test thực tế `DD/MM/YYYY` (ví dụ: `05/11/2026`).
   - **Ca kiểm thử FAIL:**
     + **Cột K (Web):** `"Failed"` (Tự động hiển thị Dropdown Chip đỏ `#FCE8E6` trên nền trắng `#FFFFFF`).
     + **Cột L (Bug_ID):** Điền mã Bug (ví dụ: `196_VNTEST_LIMS-919` hoặc link issue).
     + **Cột N (Test Date):** Ngày test thực tế `DD/MM/YYYY` (ví dụ: `05/11/2026`).
3. **Chạy kiểm tra trước (Dry-Run Preview):**
   - Chạy script với cờ `--dry-run` để hiển thị bảng so sánh trước và sau khi thay đổi:
     ```bash
     node .agent/skills/qc-task-tester/scripts/update_sheet_results.js \
       --url "<URL_GOOGLE_SHEET>" \
       --tab "<Tên Tab hoặc gid>" \
       --dry-run \
       --results '[{"id": "VNTEST_LIMS_GCT_TC_001", "status": "Passed"}, {"id": "VNTEST_LIMS_GCT_TC_002", "status": "Failed", "bug": "196_VNTEST_LIMS-919"}]'
     ```
   - Trình bày bảng so sánh Preview này ra chat cho người dùng kiểm tra cùng với Evidence Report hoặc Bản nháp Bug trước khi ghi thật.

---

### Bước 5: Thực Thi Sau Phê Duyệt (Approval Gate Execution) & Dọn Dẹp (Cleanup)

1. **Khi User phê duyệt ("OK đẩy đi", "Duyệt rồi", "Cập nhật sheet đi"):**
   - **A. Đẩy Backlog (nếu có):**
     + Upload toàn bộ ảnh bằng chứng qua tool `mcp_backlog_post_space_attachment(filePaths=[...])` để nhận mảng `attachmentId`.
     + Đẩy comment báo cáo qua tool `mcp_backlog_add_issue_comment(issueKey, content, attachmentId=[...], notifiedUserId=[...])`.
     + Cập nhật trạng thái task nếu User yêu cầu (`mcp_backlog_update_issue(issueKey, statusId=...)`).
     + Trả về link trực tiếp của comment trên Backlog cho User.
   - **B. Cập nhật Google Sheets (nếu có):**
     + Thực thi ghi kết quả lên Sheet bằng script:
       ```bash
       node .agent/skills/qc-task-tester/scripts/update_sheet_results.js \
         --url "<URL_GOOGLE_SHEET>" \
         --tab "<Tên Tab hoặc gid>" \
         --results '<JSON_KẾT_QUẢ>' \
         --update-summary
       ```
     + Tự động đồng bộ số liệu trang tính SUMMARY nhờ cờ `--update-summary`.
     + Báo cáo xác nhận số lượng ca Passed/Failed đã cập nhật kèm link sheet.
2. **Dọn dẹp tài nguyên (Cleanup):**
   - Xóa bỏ các script test tạm thời, dump html, file log trung gian trong `scratch/` hoặc `/tmp/`.
   - Giữ nguyên các deliverable: Thư mục ảnh `Evidence/`, file báo cáo `.md`, bản nháp bug `backlog/draft/`.
   - Thông báo tóm tắt cleanup cho User.

---

## 3. CHECKLIST KIỂM THỬ KHÔNG ĐƯỢC BỎ SÓT

Trước khi kết luận tính năng đạt yêu cầu, kiểm tra toàn bộ checklist sau:

| Hạng mục | Điểm cần kiểm chứng |
| :--- | :--- |
| **Bố cục & Hiển thị** | Các khối, trường hiển thị đầy đủ, không vỡ layout ở 1920x1080, tiêu đề đúng ngữ cảnh. |
| **Giá trị mặc định** | Form mở lên hiển thị đúng các giá trị mặc định (ngày hiện tại, trạng thái ban đầu, select default). |
| **Trạng thái Nút bấm** | Nút bấm bị vô hiệu hóa (`disabled`) khi chưa đủ điều kiện; chuyển sang trạng thái đang lưu (loading) khi bấm để chống click đúp. |
| **Validate Dữ liệu** | Bỏ trống trường bắt buộc, nhập sai định dạng, vượt biên tối đa -> Hệ thống chặn lưu và viền đỏ / thông báo lỗi chính xác. |
| **Cảnh báo Chưa lưu** | Đang nhập dở mà bấm Hủy / Đóng / click backdrop -> Hiện popup `Unsaved Changes Guard`. |
| **Đồng bộ Màn List** | Sau khi tạo/sửa, bản ghi mới hoặc giá trị mới hiển thị ngay lập tức ngoài bảng danh sách cha. |
| **Đồng bộ Màn Chi tiết** | Mở lại bản ghi, các trường hiển thị chuẩn xác giá trị vừa cập nhật. |
| **Lịch sử Thay đổi** | Tab Lịch sử (Audit log) ghi nhận đúng các trường đã thay đổi, người sửa, và thời gian thực hiện. |

---

## 4. BỘ TOOLKIT HỖ TRỢ TRONG SKILL

- **Script cập nhật kết quả Google Sheets:** `.agent/skills/qc-task-tester/scripts/update_sheet_results.js`
  + Cập nhật Cột K (`Passed`/`Failed`), Cột L (`Bug_ID`), Cột N (`Test Date`).
  + Bảo toàn 100% Smart Canvas Dropdown Chip trên nền trắng `#FFFFFF`, không làm mất merge Cột B và Cột M.
  + Hỗ trợ `--dry-run` để preview bảng so sánh trước khi ghi, và `--update-summary` để tự động cập nhật tab SUMMARY.
  + Cú pháp:
    ```bash
    # Chạy xem trước (Dry-run preview):
    node .agent/skills/qc-task-tester/scripts/update_sheet_results.js --url "<URL>" --tab "<TAB>" --dry-run --results '<JSON>'

    # Cập nhật thật & đồng bộ SUMMARY:
    node .agent/skills/qc-task-tester/scripts/update_sheet_results.js --url "<URL>" --tab "<TAB>" --results '<JSON>' --update-summary

    # Đánh toàn bộ tab Passed:
    node .agent/skills/qc-task-tester/scripts/update_sheet_results.js --url "<URL>" --tab "<TAB>" --all-passed --update-summary
    ```
- **Script đóng khung đỏ ảnh:** `.agent/skills/qc-task-tester/scripts/annotate_evidence.py`
- **Mẫu báo cáo evidence:** `.agent/skills/qc-task-tester/references/evidence_template.md`
- **Mẫu bản nháp bug:** `.agent/skills/qc-task-tester/references/bug_draft_template.md`
- **Thư mục lưu trữ chuẩn:**
  + Bằng chứng: `Evidence/{YYYY-MM-DD}/`
  + Báo cáo: `Evidence/{YYYY-MM-DD}/test-evidence-{issueKey}.md`
  + Bản nháp Bug: `backlog/draft/bug-<ten-loi>.md`

