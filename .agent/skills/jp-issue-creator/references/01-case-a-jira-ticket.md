# Case A - Jira Ticket ID/URL

Use when PM provides Jira key or Jira URL.

## Steps

1. Fetch issue:
   - `mcp_jira_get_issue(issueKey)`
2. Map fields for draft:
   - `key -> {Source}` as `Jira <key>`
   - `summary -> {Summary}` (translate to Vietnamese)
   - `description -> Description` (if empty use `[Không có mô tả]`)
   - `issuetype -> IssueType` mapping: Bug/バグ->Bug, タスク/Story/Task->New Feature, Improvement->Change Request
   - `priority -> Priority` mapping: Highest/High/高->Cao, Medium/中->Trung bình, Low/Lowest/低->Thấp
   - Important comments -> `{OriginalComments}` in Description body only
   - Original text -> `{OriginalText}`
3. Handle Jira attachments:
   - Call `mcp_jira_get_attachments(issueKey)`
   - Scan issue `description` and all `comment[].body` for `[filename id=<uuid>]`
   - Build referenced attachment ID set by UUID
   - Download rule:
     - Referenced IDs: always download (including videos/large files)
     - Unreferenced: download images/PDF only; skip unreferenced videos and files >10MB
   - Download tool: `mcp_jira_download_attachment(attachmentId, outputPath)`
   - Save to `jira/attachments/{issueKey}/`
4. Continue with shared modules:
   - `references/10-shared-translation.md`
   - `references/11-shared-draft-template.md`
