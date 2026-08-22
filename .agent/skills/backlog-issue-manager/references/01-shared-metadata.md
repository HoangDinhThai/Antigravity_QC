# Shared Metadata Flow

## Metadata Cache File

- Path: `backlog/.backlog-metadata.json`

## Rules

1. Always check this file first before any ID resolution.
2. If file missing or `last_updated` older than 7 days:
   - If both `projectId` and `projectKey` are missing, stop and ask user for one.
   - Call `mcp_backlog_get_project_metadata` and save output to `backlog/.backlog-metadata.json`.
   - Verify file exists after refresh.
3. Resolve IDs from metadata:
   - `issueTypes`, `categories`, `customFields`, `priorities`, `users`.
