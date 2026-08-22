# Shared Guardrails

## Output Language

- All output must be Vietnamese.
- Keep original Japanese text verbatim in a reference block when relevant.
  - Do not summarize or truncate original text (no `...`, `…`, `(省略)`).
- Common technical terms may stay in English.

## Delegation And Confirmation (Flash-safe)

To avoid missed skill loading and accidental pushes:

1. Any Backlog write action must be delegated to `backlog-issue-manager`.
   - Includes: create issue, update issue, add comment.
   - Do not call Backlog write APIs directly from this skill.
   - If user message includes Backlog intent (e.g. "lên backlog", "đẩy backlog", "tag ... trong backlog"), you must load `backlog-issue-manager` before executing handoff.
   - Hard gate: for Type E/F, if `backlog-issue-manager` is not loaded yet, stop current flow and load it first.
2. Hard confirmation gate before write delegation.
   - Accepted confirmations: `Create`, `Push`, `OK create`, `OK push`, `Confirm`, `Xác nhận`, `Đồng ý tạo`, `Đồng ý đẩy comment`.
   - If missing in current user turn, stop and ask for confirmation.
3. Pass structured payload when delegating:
   - `issueKey` (for comment/update)
   - `comment body` or draft path
   - `attachment file paths` (if any)

## Intake Questions (when unclear)

1. Input kind? (A/B/C/D/E/F)
2. If A/B/C/D: issue type? (Bug / New Feature / Change)
3. Priority? (Urgent / Normal / Low)
4. Related module/system?
