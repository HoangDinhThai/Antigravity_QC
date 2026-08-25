# Case: Build Bug Draft

Use when QC provides raw bug description and optional evidence folder.

## Steps

1. Intake:
   - QC sends error description (VI/JA/EN).
   - If evidence exists, QC provides folder in `backlog/draft/<folder-name>/`.
2. Build title:
   - Web default: `[Web][Feature Name] <hành vi lỗi>`
   - Mobile format: `[Platform][Browser][Feature Name] <hành vi lỗi>`
3. Build description using template:
   - `backlog-issue-manager/references/template_bug.md`
   - Fill known fields from QC text.
   - Unknown fields -> `[Cần QC bổ sung]`.
4. Evidence handling:
   - Read files from `backlog/draft/<folder-name>/` when provided.
   - Images: `![Tên ảnh](backlog/draft/<folder-name>/<file>)`
   - Non-image/video: `- [Tên file](backlog/draft/<folder-name>/<file>)`
   - If no evidence folder: `[Chưa có bằng chứng]`.
5. Auto-detect custom fields from `references/bug_rules.md` as initial recommendations:
   - ProgramLogicBugType
   - BugSeverity
   - PhaseDetected
6. Save draft:
   - `Bug/bug-<feature-name>.md` (kebab-case)
   - Keep YAML IDs blank (`IssueKey`, `IssueId`, `ProjectId`, `ProjectKey`)
   - Keep `## Bình luận (Comments)` blank
7. Return draft path and prompt user to confirm/choose Custom Fields:
   - Present the 3 Custom Fields in radio-button format (options list with auto-suggested default selected: `[x]` / `🔘` or `[ ]` / `⚪`).
   - Ask QC to confirm or pick different options before creating the issue on Backlog.
