# Case: Delegate Create To Backlog

Use only after QC explicitly confirms create/push.

## Steps

1. Confirmation gate:
   - If explicit confirmation missing, stop and ask.
2. Load `backlog-issue-manager` skill.
3. Delegate with draft file path:
   - `backlog/draft/bug-<feature-name>.md` (or explicit draft path user provided)
4. `backlog-issue-manager` is responsible for:
   - metadata/ID resolution
   - attachment upload and markdown conversion
   - create API call
   - writing returned IDs and `IssueKey` back to local file
5. Return result to QC:
   - created issue key + local file path.
