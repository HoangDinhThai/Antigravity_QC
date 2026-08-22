# Case C - Jira Markdown Paste

Use when PM pastes Jira markdown content directly.

## Steps

1. Parse markdown manually and extract:
   - ticket key/source (if present)
   - summary/title
   - description
   - comments/discussion
   - attachment references (filenames/ids if present)
2. Map extracted fields into draft placeholders.
3. If attachment files already exist locally, list in `{Evidence}`:
   - Image: `![image][<filename>]`
   - Non-image: `<filename>`
4. If attachment IDs/URLs are available and downloadable, fetch into `backlog/attachments/{ticketKeyOrAlias}/`.
5. Continue with shared modules:
   - `references/10-shared-translation.md`
   - `references/11-shared-draft-template.md`
