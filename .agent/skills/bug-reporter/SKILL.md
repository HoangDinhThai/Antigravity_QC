---
name: bug-reporter
description: >
  Router skill for QC bug reporting.
  Standardize raw bug descriptions and evidence into a Bug draft, then delegate
  Backlog creation to `backlog-issue-manager` after confirmation.
---

# Bug Reporter

## Overview

This is a lightweight router skill for Bug-only intake.
Use for QC free-text bug reports with image/video evidence.

## Scope

- Only for **Bug** issues.
- For Feature/Change or JP customer structured flows, use `jp-issue-creator`.

## Load Order (mandatory)

1. Read this file.
2. Read `references/00-shared-guardrails.md` (always required).
3. Read `references/10-case-build-bug-draft.md` (build/standardize draft).
4. If user confirms create/push, read `references/11-case-delegate-create.md`.
5. Before finishing, read `references/90-quality-checklist.md`.

Do not load unrelated case files.

## References Index

- Shared guardrails: `references/00-shared-guardrails.md`
- Case build draft: `references/10-case-build-bug-draft.md`
- Case delegate create: `references/11-case-delegate-create.md`
- Quality checklist: `references/90-quality-checklist.md`
- Classification rules: `references/bug_rules.md`
