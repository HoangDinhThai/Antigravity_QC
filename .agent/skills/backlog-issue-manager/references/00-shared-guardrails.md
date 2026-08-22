# Shared Guardrails

## Global Directives

- Do not create ad-hoc scripts.
- All generated issue content/comments/local markdown must be Vietnamese.

## Critical Rules

1. Issue key gate:
   - For Sync/Update/Comment, if `issueKey` is missing or ambiguous, stop and ask user.
   - Never guess target issue.
2. No API without confirmation:
   - Never call Create/Update/Comment APIs unless user explicitly confirms in current turn.
   - Sync/Get/Read operations are exempt.
   - For comment writes, preferred confirmation text is `Đẩy comment` / `Push comment`.
3. Investigate mode is read-only:
   - When user asks to "investigate", only perform read/research actions (read files, search code, fetch issue data).
   - Do not edit source files, do not create/modify local markdown, and do not run write APIs during investigate mode.
   - After investigation, always ask explicit implementation confirmation before any code/file changes.
4. Mention format:
   - Must use `<@U{userId}>` in comment content.
   - Never use `<@{userId}>` or `<@123>`.
   - Validation before comment API call:
     - If a mention matches `<@<digits>>`, rewrite to `<@U<digits>>` before sending.
     - If mention does not match `<@U{digits}>`, stop and fix format first.
5. ID lookup:
   - Resolve dropdown/select values using `.backlog-metadata.json`.
   - Never send display names to API for ID fields.
