# Case F - Redmine Comment/Journal Sync

Use when PM asks to sync a Redmine journal/comment into Backlog.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` was read.
   - Confirm `backlog-issue-manager` skill is loaded.
   - If missing, stop and load missing prerequisites first.
1. Load `backlog-issue-manager` skill first for Backlog handoff.
   - Hard gate: if not loaded, stop and load `backlog-issue-manager` skill first.
2. Fetch issue:
   - `mcp_redmine_get_issue(id, include="journals,attachments")`
3. Extract target journal:
   - If URL has fragment `#note-<n>` (example: `#note-37`), treat `<n>` as note index.
   - In Redmine response, use `journals[].order` as the primary mapping:
     - select journal where `journal.order == <n>`, then use that journal's `notes`.
   - If `order` field is unavailable in legacy payload, fallback to positional mapping (1-based).
   - If PM gives journal ID/index explicitly, prioritize that value.
   - Else use latest journal with non-empty `notes`.
4. Download referenced comment attachments:
   - Match filenames in selected journal `notes` against `attachments[]`
   - Download referenced files to `redmine/attachments/{RedmineIssueId}/`
5. Build translated payload block:
   - `{Người comment}: {Translated Text}`
   - `(Nguồn: Redmine #{issueId})`
   - `Đính kèm: ...` (image as `![image][filename]`, non-image as filename text)
   - `----`
   - `Bản gốc: {Original Text}`
   - Do not add Backlog mention tags (`<@...>`) in this block; mention format is owned by `backlog-issue-manager`.
6. Prepare handoff payload for `backlog-issue-manager`:
   - target Backlog `issueKey`
   - formatted comment block
   - local attachment file paths from `redmine/attachments/{RedmineIssueId}/`
7. Confirmation gate before delegation:
   - If user has not explicitly confirmed comment push in current turn, stop and ask:
     - `Mình đã chuẩn bị xong nội dung. Bạn xác nhận "Đẩy comment" để mình chuyển cho backlog-issue-manager push lên Backlog nhé?`
   - Do not delegate write action until confirmation is present.
