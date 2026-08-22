# Shared Draft And Push Flow (A/B/C/D)

## Structure Draft

Choose template:

- Bug: `backlog-issue-manager/references/template_bug.md`
- New Feature: `backlog-issue-manager/references/template_feature.md`
- Change Request: `backlog-issue-manager/references/template_change.md`

Fill rules:

- Keep YAML IDs empty before Backlog creation (`IssueKey`, `IssueId`, `ProjectId`, `ProjectKey`).
- Prefix title with source ticket when available:
  - Jira: `[PROJ-123] ...`
  - Redmine: `[#1234] ...`
- Put translated discussion under `{OriginalComments}` inside Description.
- Keep `## Bình luận (Comments)` block empty in draft.
- Keep original Japanese text in `{OriginalText}`.
  - **Must be verbatim**: do not summarize, do not truncate, do not replace long parts with `...`, `…`, `(省略)`, or similar.
  - If the original is long, keep it fully and rely on the collapsible `details` block in templates.

## Save Draft

- Use source-specific draft root:
  - Jira source (Type A/C): `jira/draft/`
  - Redmine source (Type B): `redmine/draft/`
  - Free text (Type D): `backlog/draft/`
- Filename pattern:
  - With ticket ID: `<TICKET>-task-<short-name>.md`
  - Without ticket ID: `task-<short-name>.md`
- Examples:
  - `jira/draft/PROJ-123-task-update-a-tag-link.md`
  - `redmine/draft/1234-task-fix-login-error.md`
  - `backlog/draft/task-fix-login-error.md`
- Use English kebab-case for `<short-name>`.

## Push Rule

- Never push without explicit confirmation.
- On confirmation, delegate to `backlog-issue-manager` with draft path.
- `backlog-issue-manager` performs create/update and writes real IDs back.

## Quality Checklist

- Draft format matches backlog template with YAML frontmatter.
- Title and description are clear Vietnamese.
- Source and original text are preserved.
- Evidence list reflects downloaded attachments (if any), using the correct attachment markup:
  - Image: `![image][<filename>]`
  - Non-image: `<filename>`
  - Do not use inline image links like `![image](...)` because drafts may not have stable URLs at creation time.
- Not pushed without confirmation.
