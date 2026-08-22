# 🧹 Global Rule

## Ngôn ngữ

- Mặc định giao tiếp, phân tích và giải thích mã nguồn bằng Tiếng Việt.
- Code comments có thể viết bằng Tiếng Anh để đảm bảo tính quốc tế.
- Tên biến, hàm, class luôn viết bằng Tiếng Anh.

## An toàn dữ liệu (CRITICAL)

- CẤM tự ý thực thi các lệnh phá hủy (DROP TABLE, DELETE, rm -rf, Remove-Item -Recurse -Force) mà không có sự đồng ý rõ ràng từ USER.
- CẤM in các thông tin nhạy cảm (API Keys, Passwords, Tokens, Connection Strings) ra màn hình chat.
- CẤM commit hoặc push các file chứa credentials lên repository.
- Luôn kiểm tra lại trước khi thực thi bất kỳ lệnh nào có khả năng thay đổi/xóa dữ liệu.

## Cleanup Temp & Debug Files

### Mục đích

AI **bắt buộc** phải dọn dẹp mọi file tạm, file debug, hoặc file trung gian sinh ra trong quá trình phân tích/chạy thử trước khi kết thúc nhiệm vụ.

---

### Các loại file phải xóa

| Pattern                                                             | Mô tả                                        |
| ------------------------------------------------------------------- | ---------------------------------------------- |
| `*_debug.txt`                                                     | File debug tạm thời (vd:`tc029_debug.txt`) |
| `debug_output.txt`, `*_output.txt`                              | Output dump tạm thời                         |
| `*.tmp`, `*.temp`                                               | File temp hệ thống                           |
| `page_snapshot.md`, `snapshot_*.md`                             | Snapshot trang web tạm                        |
| `dom_dump.txt`, `html_dump.html`                                | DOM dump tạm                                  |
| `network_requests.txt`, `console_log.txt`                       | Log mạng/console tạm                         |
| `scratch_*.py`, `scratch_*.js`, `scratch_*.ts`                | Script tạm thời                              |
| File `.py/.js/.ts` nằm ngoài `src/`, `tests/`, `scripts/` | Script lạc chỗ                               |

---

### Quy trình bắt buộc (cuối mỗi nhiệm vụ)

1. **Scan** thư mục gốc workspace và các thư mục con cấp 1 tìm file thuộc danh sách trên.
2. **Xóa** tất cả file xác nhận là tạm thời và không phải deliverable.
3. **Báo cáo** danh sách file đã xóa trong phần tóm tắt cuối cùng.

---

### KHÔNG được xóa

- `playwright-report/**`, `test-results/**` — báo cáo test chính thức do Playwright sinh ra
- `logs/` — thư mục log có chủ ý của dự án
- `artifacts/` — deliverable đã được xác nhận
- `node_modules/`, `.git/`, `target/`, `build/` — thư mục hệ thống
- `*.config.ts`, `*.config.js`, `package.json`, `.gitignore` — cấu hình dự án
- Bất kỳ file nào USER yêu cầu giữ lại (ưu tiên cao nhất)

---

### Quy tắc quan trọng

1. **File sinh ra trong quá trình debug** (snapshot, output, script tạm) phải được lưu vào `/tmp/`, **không** để tràn vào thư mục gốc dự án.
2. **Nếu không chắc** file có phải tạm thời không, hỏi USER trước khi xóa.
3. **Không được xóa** file nằm trong các thư mục hệ thống.
4. **Cuối mỗi nhiệm vụ**, phải thông báo kết quả cleanup rõ ràng.

---

### Ví dụ báo cáo cleanup cuối nhiệm vụ

```
🧹 Cleanup Summary:
- Đã xóa: playwright-typescript/tc029_debug.txt
- Đã xóa: playwright-typescript/debug_output.txt
✅ Workspace sạch. Sẵn sàng commit.
```
