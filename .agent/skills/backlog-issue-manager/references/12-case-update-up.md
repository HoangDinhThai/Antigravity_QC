# Case: Update Up

Use when user wants to update an existing Backlog issue from local markdown edits.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` and `01-shared-metadata` were read.
   - If attachments exist, confirm `02-shared-attachment-rules` was read.
   - If any missing, stop and read missing files first.
1. Require `issueKey`:
   - If missing/ambiguous, stop and ask user first.
2. Confirm write intent:
   - If explicit update confirmation missing, stop and ask.
3. Find and read local `<IssueKey>.md`.
4. Extract edited fields for update payload.
5. Resolve all ID-based fields via metadata.
6. If new attachments exist:
   - Apply shared attachment rules (`02-shared-attachment-rules.md`).
7. Convert image links to Backlog markdown format.
8. Call `mcp_backlog_update_issue` with only edited fields + `attachmentId` when present.
9. Keep local markdown content synchronized with final markdown image format.
