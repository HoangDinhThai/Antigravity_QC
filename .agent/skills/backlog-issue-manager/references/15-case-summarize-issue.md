# Case: Summarize Issue

Use when the user wants to summarize a Backlog issue and its comments.

## Steps

0. Read verification:
   - Confirm `00-shared-guardrails` and `01-shared-metadata` were read.
   - If any missing, stop and read missing files first.
1. Require `issueKey`:
   - If missing/ambiguous, stop and ask user first.
2. Fetch issue data:
   - `mcp_backlog_get_issue` (with `issueKey`).
   - **Load all comments (pagination required):** `mcp_backlog_get_issue_comments` defaults to **`count` 20**, so one call can miss comments. Load the **full** thread before synthesizing:
     - Call with `issueKey`, **`count`: 100** (API max per request), **`order`: `"asc"`** (oldest → newest).
     - First call: omit `minId`.
     - **While** the returned array length is **100**, call again with the same `issueKey`, `count`, `order`, and **`minId`** = **last comment `id` + 1** from the previous page.
     - **Concatenate** pages in order; dedupe by `id` if duplicates appear.
     - Stop when the response is empty or length **< 100**.
3. Synthesize summary:
   - Follow `00-shared-guardrails` for language (e.g. Vietnamese for synthesis unless the user specifies otherwise).
   - Keep Japanese text snippets exactly as-is.
   - Include: context, key discussion points, decisions, open questions, and next steps.
4. Output the summary in chat first:
   - Do not write or create files by default.
5. Ask next step explicitly, for example:
   - Offer **(1)** save summary to file, or **(2)** investigate code in the workspace first (use the user’s language if they are not English-first).
6. If the user chooses save-to-file:
   - Ask for or confirm the path (default: `backlog/summary/<IssueKey>-summary.md`).
   - Then write the file.
7. If the user chooses investigate, or asks for investigation / client-format answer / survey directly (with or without a prior summary):
   - Inspect the workspace: search, read code, SQL/migrations, configs; prefer repository evidence over paraphrasing the ticket alone.
   - **Survey / usage-investigation issues** (e.g. 利用箇所, 調査, investigation of where a field is used):
     - If the issue description defines a **section order** (e.g. usage locations → logic → implementation → data flow / impact), answer in **that order and cover every section** after reviewing code and SQL.
     - Output language: follow `00-shared-guardrails` and user preference; preserve official Japanese UI/field names where relevant.
   - **Dev-oriented issues** (fix/feature):
     - Summarize constraints, touched modules/files, risks, and a concise implementation direction.
8. After investigation, **tailor the follow-up to ticket type** (do not default only to “write code”):
   - **Survey / client-facing report:** offer short options such as: save report to file, draft a Backlog comment, or implementation—only if needed.
   - **Dev task (code change likely):** ask whether to start implementation (e.g. after confirming code context is sufficient).
9. Implement code or run write APIs only when the user explicitly confirms in the **current** turn (see guardrails).
