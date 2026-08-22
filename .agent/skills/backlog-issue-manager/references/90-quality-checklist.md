# Final Quality Checklist

Before finishing any operation:

- [ ] Correct flow file(s) loaded: shared + one case file.
- [ ] Metadata cache checked/refreshed if needed.
- [ ] For Sync/Update/Comment: `issueKey` explicitly confirmed.
- [ ] For write operations: explicit user confirmation exists in current turn.
- [ ] For comment: tagged user explicitly provided by user and mention uses `<@U{userId}>`.
- [ ] For comment: no raw mention format like `<@123456>` remains; normalized to `<@U123456>`.
- [ ] For summarize issue: issue comments loaded with pagination (`count` up to 100 and `minId` until no full page remains), not a single default page only.
- [ ] For summarize + survey-style issues (e.g. usage investigation / 調査): output matches the **section order** in the issue description; evidence includes **code and SQL/migrations**, not UI assumptions alone.
- [ ] Attachment file paths validated before upload.
- [ ] Attachment IDs passed to API when attachments are used.
- [ ] Local markdown file created/updated correctly for create/sync/update workflows.
- [ ] No direct API call that violates guardrails.
