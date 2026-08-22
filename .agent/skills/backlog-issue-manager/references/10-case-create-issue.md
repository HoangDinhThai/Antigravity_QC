# Case: Create Issue

Use when user wants to create/push a new Backlog issue.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` and `01-shared-metadata` were read.
   - If attachments exist, confirm `02-shared-attachment-rules` was read.
   - If source is draft, confirm `14-case-draft-cleanup` was read.
   - If any missing, stop and read missing files first.
1. Confirm write intent:
   - If explicit confirmation missing, stop and ask.
2. Prepare issue fields from user input or draft file.
3. Resolve ID-based fields via metadata:
   - Assignee, Status, Category, Priority, Custom Fields.
4. If attachments exist:
   - Apply shared attachment rules (`02-shared-attachment-rules.md`).
5. Convert description image links to Backlog markdown format.
6. Call `mcp_backlog_add_issue` with resolved IDs and `attachmentId`.
7. Save local markdown file:
   - `backlog/[Folder if any]/<IssueKey>.md`
   - Use `references/template_base.md` structure and fill metadata fields.
8. If created from draft, run cleanup case (`14-case-draft-cleanup.md`).
