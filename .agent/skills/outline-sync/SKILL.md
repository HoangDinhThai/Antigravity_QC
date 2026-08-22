---
name: outline-sync
description: Sync documents between Outline cloud and the local outline folder as nested markdown files. Use this skill to download, create, synchronize, or update documents between Outline and the local machine via outline-mcp-server, keeping links intact.
---

# Outline Sync Skill

This skill synchronizes document hierarchies between Outline and the local directory. It uses the `outline-mcp-server` to sync Outline documents into a neatly structured nested folder hierarchy, or upload local modifications back to Outline.

## 🛑 Global Directive: No Ad-hoc Scripts
**DO NOT CREATE** temporary or ad-hoc scripts (e.g. Python, Bash, Node.js) and ask the user to run them in order to complete a task. If a requested tool or capability is not supported by your current environment or tools, **just tell the user directly** what you cannot do, rather than attempting to script a workaround.

## Core Rules

1. **Nested Document Structure**: 
   - The local directory structure systematically matches the parent-child hierarchical structure from Outline.
   - Files are saved as Markdown files (`.md`) with YAML frontmatter containing Outline metadata (id, url, title).

2. **Bidirectional Sync with Two Main Tools**:
   - The `outline-mcp-server` provides two dedicated tools for this logic: `mcp_outline_sync_documents` and `mcp_outline_sync_documents_to_cloud`.
   - You **do not** need to manually loop through documents or manually resolve links. The specialized sync tools handle the recursive tree traversal, local folder creation, frontmatter management, and link conversion automatically.

## Recommended Workflows

### Scenario 1: Syncing from Cloud to Local

1. **Identify Target**: Use `mcp_outline_search_documents` or list tools to find the `id` of the root document you want to sync.
2. **Sync**: Call `mcp_outline_sync_documents` with:
   - `id`: The root document ID.
   - `outputFolder`: The absolute path to the local folder where documents will be saved (default is the `outline` folder).
3. **Verify**: The tool will automatically create the folder hierarchy, download all nested child documents, save them with YAML frontmatter, and rewrite Outline cloud URLs into local relative paths.

### Scenario 2: Syncing back to Cloud (Update & Create)

1. **Review and Confirm**: Before executing any uploads or updates to the Outline cloud, summarize the local changes that were made and explicitly **ask the user for confirmation** to push these changes to the Cloud. Do not proceed until the user says yes.
   - You can optionally perform a "Dry Run" by calling `mcp_outline_sync_documents_to_cloud` with `dryRun: true` to validate and plan changes before committing them. This will output the plan.
2. **Ensure Root Context**: Identify the `rootDocumentId` in Outline that serves as the anchor for the sync tree, and the local `inputFolder` where the synced markdown files reside.
3. **Sync to Cloud**: Call `mcp_outline_sync_documents_to_cloud` with:
   - `rootDocumentId`: The root document ID.
   - `inputFolder`: The absolute path to the local folder (default is the `outline` folder).
   - `publish`: Set to `true` to ensure the updates/creations are immediately visible.
   - `createMissing`: Set to `true` (default) if there are new local files you want to create in Outline.
   - `syncLinksToCloud`: Set to `true` (default) to convert local relative `.md` links back into Outline URLs before updating the cloud.
4. **Verify**: The tool will automatically update existing documents (using the `id` from their frontmatter) and create missing ones, preserving the folder-based hierarchy.
