# Case B - Redmine Issue ID/URL

Use when PM provides Redmine issue ID or URL.

## Steps

1. Fetch issue:
   - `mcp_redmine_get_issue(id, include="attachments,journals")`
2. Map fields for draft:
   - `id -> {Source}` as `Redmine #<id>`
   - `subject -> {Summary}` (translate)
   - `description -> Description` (if empty use `[Không có mô tả]`)
   - `tracker.name -> IssueType`: Bug->Bug, Feature->New Feature, Support->Change Request
   - `priority.name -> Priority`: Urgent/High->Cao, Normal->Trung bình, Low->Thấp
   - `status/project/assignee` as context in description or mapped fields
   - Original text -> `{OriginalText}`
3. Handle Redmine attachments:
   - Read `attachments[]` and `journals[]`
   - Scan main `description` and all journal `notes` for each attachment filename
   - Build referenced filename set
   - Download rule:
     - Referenced filenames: always download (including videos/large files)
     - Unreferenced: images/PDF only; skip unreferenced videos/very large files
   - Use Redmine download capability (`mcp_redmine_download_attachment` if available, or `content_url` path)
   - Save to `redmine/attachments/{RedmineId}/`
4. Optional metadata lookup:
   - `mcp_redmine_get_trackers`
   - `mcp_redmine_get_issue_statuses`
   - `mcp_redmine_get_issue_priorities`
5. Continue with shared modules:
   - `references/10-shared-translation.md`
   - `references/11-shared-draft-template.md`
