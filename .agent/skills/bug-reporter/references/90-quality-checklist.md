# Quality Checklist

Before final response:

- [ ] `bug_rules.md` has been used for classification.
- [ ] Draft follows bug template structure.
- [ ] Title follows format: `[{Mã Task}][{Feature}]: <hành vi lỗi>` (hoặc `[{Feature}]: <hành vi lỗi>`).
- [ ] Thứ tự mô tả: Các bước tái hiện -> Kết quả thực tế -> Kết quả mong đợi -> Bằng chứng.
- [ ] Nội dung cực kỳ ngắn gọn, súc tích, dễ hiểu nhất có thể (PM non-tech và Dev đọc đều hiểu ngay).
- [ ] Missing fields are marked `[Cần QC bổ sung]`.
- [ ] Evidence links are valid local paths (or `[Chưa có bằng chứng]`).
- [ ] Draft path is `backlog/draft/bug-<feature-name>.md` (or user-specified draft path).
- [ ] YAML IDs remain blank before create.
- [ ] `## Bình luận (Comments)` stays blank.
- [ ] Đã trình bày bản nháp chi tiết ra chat để QC duyệt và sửa đổi (tuyệt đối KHÔNG tự ý đẩy bug lên).
- [ ] Chỉ gọi API đẩy lên Backlog khi QC đã xác nhận/phê duyệt rõ ràng trong lượt hiện tại.
