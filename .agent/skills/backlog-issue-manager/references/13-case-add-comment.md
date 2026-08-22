# Case: Add Comment

Use when user wants to add a comment on a Backlog issue.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` and `01-shared-metadata` were read.
   - If attachments exist, confirm `02-shared-attachment-rules` was read.
   - If any missing, stop and read missing files first.
1. Confirm write intent:
   - If explicit comment push confirmation is missing in the current user turn, stop and ask.
   - Use this fixed question:
     - `Mình đã chuẩn bị xong comment. Bạn xác nhận "Đẩy comment" để mình gửi lên Backlog nhé?`
   - Allowed confirmation examples:
     - `Đẩy comment`, `Push comment`, `Confirm`, `Xác nhận`.
2. Require `issueKey`:
   - If missing/ambiguous, stop and ask user.
3. Require tag target:
   - If user does not specify who to tag, stop and ask.
4. Resolve mention user:
   - Look up numeric user ID from metadata.
   - Build mention line `<@U{userId}>`.
   - If any content contains `<@123456>` format, normalize to `<@U123456>` before final payload.
5. If comment has attachments:
   - Apply shared attachment rules (`02-shared-attachment-rules.md`).
6. Build comment content:
   - First line mention tag.
   - Then comment body block.
   - Run final validation: mention tag must match `<@U{digits}>`.
7. Call `mcp_backlog_add_issue_comment`:
   - `issueKey`
   - `notifiedUserId` (numeric IDs only)
   - `content`
   - `attachmentId` when available
   - Final gate before API call: re-check that confirmation exists in current user turn. If not, do not call API.
