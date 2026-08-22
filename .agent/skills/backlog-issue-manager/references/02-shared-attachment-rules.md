# Shared Attachment Rules

## Upload First

- For create/update/comment with attachments:
  - Upload files first via `mcp_backlog_post_space_attachment`.
  - Collect returned IDs and pass to `attachmentId`.

## Supported Source Paths

- Accept local files from:
  - `backlog/attachments/`
  - `jira/attachments/`
  - `redmine/attachments/`
  - or explicit absolute paths from caller.

## Preflight

1. Verify each referenced local file exists before upload.
2. If any file missing, stop and ask user to correct/confirm.

## Markdown Conversion

- Convert local image references to Backlog format:
  - `![name](path/to/file.png)` -> `![name][file.png]`
- Ensure content references filenames that match uploaded files.
