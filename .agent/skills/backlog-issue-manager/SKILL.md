---
name: backlog-issue-manager
description: >
  Router skill for Backlog issue operations. Use when the user works with Backlog:
  create/sync/update/comment issues, summarize or investigate tickets, produce
  client-facing investigation reports in a fixed format, or mentions an issue key
  (e.g. ADF-123). Also matches Vietnamese phrasing such as "lên backlog", "đẩy
  backlog", "tóm tắt issue", "tổng hợp issue", "điều tra ticket". Classify the
  operation and load only the required reference files for metadata, create, sync,
  update, comment, and summary workflows; enforce confirmation gates for writes.
---

# Backlog Issue Manager

## Overview

This is a lightweight router skill.  
Load shared rules first, then load one case file by operation type.

## Load Order (mandatory)

1. Read this file.
2. Read `references/00-shared-guardrails.md` (always required).
3. Read `references/01-shared-metadata.md` (always required).
4. Classify operation type and read one case file:
   - Create issue -> `references/10-case-create-issue.md`
   - Sync down -> `references/11-case-sync-down.md`
   - Update up -> `references/12-case-update-up.md`
   - Add comment -> `references/13-case-add-comment.md`
   - Summarize issue -> `references/15-case-summarize-issue.md`
5. If operation includes file upload/markdown attachment conversion, also read:
   - `references/02-shared-attachment-rules.md`
6. If operation is create from draft, also read:
   - `references/14-case-draft-cleanup.md`
7. Before finishing any operation, read:
   - `references/90-quality-checklist.md`

Do not load unrelated case files.

## Read Verification Gate (hard stop)

Before executing any business/API step, verify you have read required files:

- Always required:
  - `references/00-shared-guardrails.md`
  - `references/01-shared-metadata.md`
- Exactly one operation case:
  - `10-case-create-issue` or `11-case-sync-down` or `12-case-update-up` or `13-case-add-comment` or `15-case-summarize-issue`
- Conditional:
  - `references/02-shared-attachment-rules.md` when attachments are present
  - `references/14-case-draft-cleanup.md` when source is draft

If any required file is not read yet, stop and read it first. Do not proceed to API calls.

## References Index

- Shared guardrails: `references/00-shared-guardrails.md`
- Shared metadata: `references/01-shared-metadata.md`
- Shared attachments: `references/02-shared-attachment-rules.md`
- Case create: `references/10-case-create-issue.md`
- Case sync-down: `references/11-case-sync-down.md`
- Case update-up: `references/12-case-update-up.md`
- Case add-comment: `references/13-case-add-comment.md`
- Case draft cleanup: `references/14-case-draft-cleanup.md`
- Case summarize: `references/15-case-summarize-issue.md`
- Final checklist: `references/90-quality-checklist.md`
- Local templates:
  - `references/template_base.md`
  - `references/template_bug.md`
  - `references/template_feature.md`
  - `references/template_change.md`

## Workspace-Aware Behavior

Because this skill lives in workspace scope, it can inspect code when needed.

- For dev-related issues, investigate related source files in the workspace when the user asks for investigation or implementation support.
- Prefer evidence from current code (files, symbols, configs) instead of only issue text/comments.
- In summary flow, code investigation is on-demand: summarize first, then ask user to choose save-to-file or investigate.
- Survey-style issues (usage investigation, client-facing format): after investigate, deliver in the section order from the issue description; next-step prompt may include save file or draft Backlog comment, not only implementation.