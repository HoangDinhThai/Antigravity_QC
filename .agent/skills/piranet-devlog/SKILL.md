---
name: pi:devlog
description: >
  Register Piranet devlogs via MCP tools. Use when user says "devlog", "nhập devlog", "log time",
  "ghi nhận giờ", "register devlog", mentions issue codes (OE-10, PRJ-5), or wants to log work hours
  in Piranet. Handles the full flow: find project → find issue → register devlog.
  Also use for "list projects", "liệt kê project", "list issues", "xem issue" queries.
metadata:
  type: project
---

# Devlog Skill

Register work hours in Piranet via MCP tools (`piranet_list_projects`, `piranet_list_issues`, `piranet_register_devlog`).

## Flow: Always Follow This Order

```
piranet_list_projects → piranet_list_issues(projectId) → piranet_register_devlog(date, projectId, taskId, hours)
```

**NEVER skip steps.** `taskId` is NOT NULL in DB — you MUST call `piranet_list_issues` before `piranet_register_devlog`.

## Parsing User Input

### Natural Language Patterns

| Input | Parse |
|-------|-------|
| `devlog OE-10 8h` | issue=`OE-10`, hours=8, date=today |
| `devlog 2026-05-20 OE-10 6h` | date=2026-05-20, issue=`OE-10`, hours=6 |
| `devlog OE-10 2h OT` | issue=`OE-10`, hours=2, isOt=true |
| `devlog OE-10 2h note: fix bug` | issue=`OE-10`, hours=2, note="fix bug" |
| `devlog OE-10 2h làm thêm` | issue=`OE-10`, hours=2, isOt=true |
| `nhập devlog PRJ-5 4 tiếng` | issue=`PRJ-5`, hours=4, date=today |
| `ghi nhận 3h cho OE-10` | issue=`OE-10`, hours=3, date=today |
| `log 1.5h OE-10 hôm qua` | issue=`OE-10`, hours=1.5, date=yesterday |

### Extraction Rules

1. **Date**: Default = today (YYYY-MM-DD). Accept `hôm qua`/`yesterday`, `YYYY-MM-DD`, `DD/MM/YYYY`. Must be within last 45 days, NOT future.
2. **Issue code**: Match patterns like `OE-10`, `PRJ-5`, `ABC-123` (uppercase letters hyphen digits). Use as `q` param in `piranet_list_issues` to find the taskId.
3. **Hours**: Extract number before `h`/`hours`/`tiếng`/`giờ`. Range 0.05–24, rounded to 0.05 increments (15-min).
4. **OT flag**: Detect `OT`, `overtime`, `làm thêm`, `làm thêm giờ` → `isOt=true`.
5. **Note**: Text after `note:` or `ghi chú:` or `memo:`.

## Step-by-Step Execution

### Step 1: Find Project

Call `piranet_list_projects`. If user mentioned project name/code, pass as `q`.

```
piranet_list_projects(q?) → returns [{id, code, name, label}]
```

- If single result → use that project's `id` as `projectId`.
- If multiple → show list, ask user to pick.
- If zero → error, ask user to check project exists in Piranet.

### Step 2: Find Issue/Task

Call `piranet_list_issues` with the `projectId` from step 1. Pass issue code as `q` to filter.

```
piranet_list_issues(projectId, q?) → returns [{id, code, name, label}]
```

- If user gave an issue code (e.g., `OE-10`) → pass as `q` to filter.
- If single match → use that issue's `id` as `taskId`.
- If multiple → show list, ask user to pick.
- If zero → error, ask user to check issue exists in Piranet.

### Step 3: Register Devlog

Call `piranet_register_devlog` with all collected params.

```
piranet_register_devlog({
  date: "YYYY-MM-DD",
  projectId: number,
  taskId: number,
  hours: number,
  isOt?: boolean,
  note?: string
})
```

### Step 4: Confirm

Show confirmation with the returned entry details:
- Date, project, issue, hours, OT status
- Entry ID from response

## Error Handling

| Error | Action |
|-------|--------|
| Auth failed (401) | Tell user to check API key (`pk_*`), suggest reconfiguring MCP server |
| `piranet_list_issues` empty | Project may not have issues synced. Suggest checking Piranet UI. |
| `taskId` missing | NEVER call `piranet_register_devlog` without taskId. Go back to Step 2. |
| Hours out of range | Clamp to 0.05–24, inform user of the adjustment |
| Date out of range (>45 days) | Tell user the 45-day limit, ask for valid date |
| Future date | Reject, explain dates must be today or earlier |
| API 500 | Check if `taskId` was provided. Retry once. If persists, report to user. |

## Multi-Entry Scenarios

If user wants to log multiple issues at once:
- Process each entry independently through the 3-step flow
- Batch registrations one at a time (the API accepts single entries)
- Show summary after all complete

Example: `devlog OE-10 4h, OE-11 3h` → process OE-10 first, then OE-11.

## Validation Checklist Before piranet_register_devlog

- [ ] `date` is valid YYYY-MM-DD, within last 45 days, not future
- [ ] `projectId` obtained from `list_projects` result
- [ ] `taskId` obtained from `list_issues` result (NOT guessed)
- [ ] `hours` is number 0.05–24
- [ ] `isOt` is boolean or omitted (defaults false)
- [ ] `note` is string ≤1000 chars or omitted

## Security

- This skill handles devlog registration only via MCP tools.
- Does NOT handle: project CRUD, user management, API key management, or any admin operations.
- Never store or log API keys.
- Never expose internal server error details to user — show user-friendly messages.
