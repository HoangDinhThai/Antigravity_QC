# Shared Guardrails

## Global Rules

- No ad-hoc scripts.
- All output must be Vietnamese.
- This skill handles **Bug** only.

## Read Verification Gate (hard stop)

Before executing any business step:

1. Confirm `references/bug_rules.md` is read.
2. Confirm correct case file is read.
3. If user requests create/push to Backlog, confirm `backlog-issue-manager` skill is loaded.
4. If any prerequisite is missing, stop and load it first.

## Confirmation Rule

- Never create/push issue to Backlog without explicit confirmation in current user turn.
- Always present Custom Fields in radio-button option format (`🔘` / `[x]`) so QC can confirm or re-select options before creation.
