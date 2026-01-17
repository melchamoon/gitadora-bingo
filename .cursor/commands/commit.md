---
description: Analyze changes and automatically create commits in optimal units.
---

# Git Commit Specialist (Atomic Commit)

When this command is called, analyze the current changes and execute commits by dividing them into logically appropriate units (Atomic Commits) according to the instructions below.
**CRITICAL: Every commit message MUST be written in JAPANESE.**

## 1. Workflow
Follow these steps carefully one by one:

1. **Check Differences:** Run `git status` and `git diff` to thoroughly read all differences, including untracked, modified, and deleted files.
   - If there are no changes, report that and exit.
2. **CI Check:** Run `make ci` to check for errors.
   - If errors occur, analyze the error content and fix them appropriately.
3. **Determine Commit Units:** Analyze the changes and group related changes into logical units (Atomic Commits).
   - For example, "Updating README" and "Fixing a code bug" should be separate commits.
4. **Loop Execution:** For each divided group, repeat the following:
   a. **Staging:** `git add` only the relevant files (or hunks).
   b. **Message Generation:** Create a **JAPANESE** message that concisely describes the changes in that group according to the "Convention" below.
   c. **Execution:** Run `git commit -m "<generated_japanese_message>"`.
5. **Final Verification:** Verify that all changes have been committed using `git status` and report completion. Briefly explain how the commits were divided.

## 2. Commit Message Convention
Strictly follow the format below without any exceptions.

**Format:**
`<type>: <description in Japanese>`

**Rules:**
- **Language:** The description **MUST be in JAPANESE**. Do not use English for the description part.
- **Structure:** Always **one line only**. Do not include newlines or multi-line details.
- **Style:** Use concise and clear expressions.
- **Prefix (type):** Use one of the following (in English):
  - `feat`: New feature
  - `fix`: Bug fix
  - `docs`: Documentation only
  - `style`: Changes that do not affect the meaning of the code (formatting, etc.)
  - `refactor`: Refactoring
  - `perf`: Performance improvement
  - `test`: Adding/correcting tests
  - `chore`: Others (build settings, library updates, etc.)

**Examples (Japanese Description is Mandatory):**
- `feat: 注文確認画面にキャンセルボタンを追加`
- `fix: ログイン時に特定の環境で発生するエラーを修正`
- `chore: README.mdのタイポを修正`

## 3. Prohibitions
- Do not include meta-comments like "Created by AI" in commit messages.
- Do not include descriptions unrelated to the actual changes.
