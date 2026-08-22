# Case: Sync Down

Use when user wants to sync issue data from Backlog to local file.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` and `01-shared-metadata` were read.
   - If missing, stop and read missing files first.
1. Require `issueKey`:
   - If missing/ambiguous, stop and ask user first.
2. Find local file location in `backlog/`:
   - Search `<IssueKey>.md`.
   - If not found, ask target folder or default to `backlog/`.
3. Fetch from Backlog:
   - `mcp_backlog_get_issue`
   - `mcp_backlog_get_issue_comments`
4. Write/overwrite local file using template structure.
5. Fetch attachment list:
   - `mcp_backlog_get_issue_attachments`
6. If user asks to download attachments:
   - `mcp_backlog_download_issue_attachment` to local output path.
