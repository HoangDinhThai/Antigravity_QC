# Case E - Jira Comment Sync

Use when PM provides Jira comment URL (`focusedCommentId=`) or asks to sync Jira comment.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` was read.
   - Confirm `backlog-issue-manager` skill is loaded.
   - If missing, stop and load missing prerequisites first.
1. Load `backlog-issue-manager` skill first for Backlog handoff.
   - Hard gate: if not loaded, stop and load `backlog-issue-manager` skill first.
2. Fetch issue:
   - `mcp_jira_get_issue(issueKey)`
3. Extract target comment:
   - If `focusedCommentId` exists, pick matching comment.
   - Else pick the latest comment when PM requests sync.
4. Download referenced comment attachments:
   - Call `mcp_jira_get_attachments(issueKey)`
   - Scan comment body for `[filename id=<uuid>]`
   - Match UUID to attachment and download all matched files (including videos)
   - Save to `jira/attachments/{JiraIssueKey}/`
5. Build translated payload block:
   - `{Người comment}: {Translated Text}`
   - `(Nguồn: {JiraIssueKey} – {JiraCommentUrl})`
   - `Đính kèm: ...` (image as `![image][filename]`, non-image as filename text)
   - `----`
   - `Bản gốc: {Original Text}`
   - Do not add Backlog mention tags (`<@...>`) in this block; mention format is owned by `backlog-issue-manager`.
6. Prepare handoff payload for `backlog-issue-manager`:
   - target `issueKey` (resolved from local backlog mapping)
   - formatted comment block
   - local attachment file paths from `jira/attachments/{JiraIssueKey}/`
7. Confirmation gate before delegation:
   - If user has not explicitly confirmed comment push in current turn, stop and ask:
     - `Mình đã chuẩn bị xong nội dung. Bạn xác nhận "Đẩy comment" để mình chuyển cho backlog-issue-manager push lên Backlog nhé?`
   - Do not delegate write action until confirmation is present.
