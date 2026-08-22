# Case D - Japanese/Vietnamese Free Text

Use when PM sends chat/email/free description without Jira/Redmine ID.

## Steps

1. Detect request type from keywords:
   - Bug: バグ, 不具合, エラー, 障害, 問題
   - New feature: 新機能, 追加, 要望, 改善
   - Change: 変更, 修正, 更新
2. Extract useful fields if present:
   - priority, environment/device/os/browser
   - steps to reproduce
   - expected/actual behavior
   - business purpose and requirements
3. If unclear, ask targeted follow-up questions.
4. Continue with shared modules:
   - `references/10-shared-translation.md`
   - `references/11-shared-draft-template.md`
