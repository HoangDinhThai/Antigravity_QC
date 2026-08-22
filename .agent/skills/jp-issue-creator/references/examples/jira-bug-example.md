# Example: Sample Input and Output from Japanese Jira

### Input (Japanese Jira)

```
## 商品一覧画面でエラーが発生

### 説明
商品一覧画面で検索ボタンを押すと500エラーが表示される。

### 再現手順
1. 商品管理メニューをクリック
2. 商品一覧画面を開く
3. 検索条件を入力せずに検索ボタンをクリック
4. 500エラーが表示される

### 期待動作
全商品が一覧表示される

### 優先度
高（本番環境で発生中）
```

### Output — `backlog/draft/PROJ-123-task-loi-500-danh-sach-sp.md` (Vietnamese output)

```markdown
---
IssueKey: 
IssueId: 
ProjectId: 
ProjectKey: 
IssueType: Bug
Status: Open
Priority: Cao
Assignee: 
CreatedBy: 
CreatedDate: 
UpdatedDate: 
StartDate: 
DueDate: 
EstimatedHours: 
ActualHours: 
ParentIssueId: 
Milestones: 
Versions: 
Categories: 
ProgramLogicBugType: Logical Bug
BugSeverity: Critical
---

# [BUG] [PROJ-123] Lỗi 500 khi tìm kiếm trên màn hình Danh sách Sản phẩm

## Mô tả (Description)
**Nguồn:** Jira PROJ-123
**Ngày nhận:** 2026-03-05
**Môi trường (Environment):** Production
**Thiết bị (Device):** [Chưa cung cấp]
**Hệ điều hành (OS):** [Chưa cung cấp]
**Trình duyệt (Browser):** [Chưa cung cấp]

**Điều kiện tiên quyết (Pre-condition):**
Đã đăng nhập hệ thống, có quyền truy cập màn hình Quản lý Sản phẩm.

**Mô tả vấn đề:**
Màn hình Danh sách Sản phẩm hiển thị lỗi 500 khi người dùng nhấn nút Tìm kiếm mà không nhập điều kiện lọc.

**Các bước tái hiện:**
1. Click vào menu Quản lý Sản phẩm
2. Mở màn hình Danh sách Sản phẩm
3. Không nhập điều kiện tìm kiếm, nhấn nút Tìm kiếm
4. Lỗi 500 xuất hiện

**Kết quả mong đợi:**
Hiển thị toàn bộ danh sách sản phẩm.

**Kết quả thực tế:**
Lỗi 500 (Internal Server Error) hiển thị trên màn hình.

**Tài liệu đính kèm / Bằng chứng (Evidence):**
[Chưa có bằng chứng]

---
<details>
<summary><b>📝 Ghi chú / Nguyên văn (Reference)</b></summary>

```text
商品一覧画面で検索ボタンを押すと500エラーが表示される。
```
</details>

## Bình luận (Comments)
<!-- Vùng hiển thị/đồng bộ các bình luận. Mỗi bình luận cách nhau rõ ràng. -->
```
