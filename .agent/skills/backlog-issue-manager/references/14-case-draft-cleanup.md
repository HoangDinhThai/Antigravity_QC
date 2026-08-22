# Case: Draft Cleanup After Create

Run after issue creation when source was a draft file.

## Supported Draft Roots

- `backlog/draft/`
- `jira/draft/`
- `redmine/draft/`

## Steps

1. Move related draft attachment files (if any) to:
   - `backlog/attachments/<IssueKey>/`
2. Delete obsolete draft markdown file.
3. Delete obsolete draft attachment directory.
4. Keep repository clean and avoid duplicate draft artifacts.
