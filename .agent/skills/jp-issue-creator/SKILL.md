---
name: jp-issue-creator
description: >
  Router skill for JP customer requests.
  Classify input type (A-F) and load only the corresponding case reference file.
  Supports Jira/Redmine issue intake, Jira/Redmine comment sync, Jira markdown,
  and Japanese free text to draft/push Backlog tasks.
---

# JP Issue Creator

## Overview

This is a lightweight router skill to reduce context usage.
Always classify request type first, then load only the needed case file.

## Load Order (mandatory)

1. Read this file.
2. Read `references/00-shared-guardrails.md` (always required).
3. Classify input into one type:
   - Type A: Jira ticket key/URL
   - Type B: Redmine issue ID/URL
   - Type C: Jira markdown pasted content
   - Type D: Japanese/Vietnamese free text
   - Type E: Jira comment URL or Jira comment sync request
   - Type F: Redmine journal/comment sync request
4. Read only one matching case file:
   - Type A -> `references/01-case-a-jira-ticket.md`
   - Type B -> `references/02-case-b-redmine-issue.md`
   - Type C -> `references/03-case-c-jira-markdown.md`
   - Type D -> `references/04-case-d-free-text.md`
   - Type E -> `references/05-case-e-jira-comment-sync.md`
   - Type F -> `references/06-case-f-redmine-comment-sync.md`
5. For A/B/C/D (draft-issue flow), also read:
   - `references/10-shared-translation.md`
   - `references/11-shared-draft-template.md`
6. For E/F (comment sync to Backlog), **must also load**:
   - `backlog-issue-manager` skill
   - If this skill is not loaded, stop and load it before continuing.

Do not read unrelated case files.

## Read Verification Gate (hard stop)

Before executing extraction/translation/delegation:

- Always required:
  - `references/00-shared-guardrails.md`
- Exactly one case file:
  - `01/02/03/04/05/06` based on classified input type
- For A/B/C/D:
  - `references/10-shared-translation.md`
  - `references/11-shared-draft-template.md`
- For E/F:
  - `backlog-issue-manager` skill must be loaded before continuing

If any required file/skill is missing, stop and load it first.

## Global Directive: No Ad-hoc Scripts

**DO NOT CREATE** temporary or ad-hoc scripts (e.g. Python, Bash, Node.js) and ask the user to run them. If a capability is unavailable, tell the user directly.

## References Index

- Shared guardrails: `references/00-shared-guardrails.md`
- Case A (Jira ticket): `references/01-case-a-jira-ticket.md`
- Case B (Redmine issue): `references/02-case-b-redmine-issue.md`
- Case C (Jira markdown): `references/03-case-c-jira-markdown.md`
- Case D (Free text): `references/04-case-d-free-text.md`
- Case E (Jira comment sync): `references/05-case-e-jira-comment-sync.md`
- Case F (Redmine comment sync): `references/06-case-f-redmine-comment-sync.md`
- Shared translation: `references/10-shared-translation.md`
- Shared draft/push: `references/11-shared-draft-template.md`
- Dictionary: `references/jp-vi-dictionary.md`
- Example: `references/examples/jira-bug-example.md`
