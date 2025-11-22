# Repository Guidelines

## Project Structure & Module Organization
- Original chapters are in `old-switch-manual/` and now fully copied into `mcp-switch-manual/` (same filenames). Treat these as the canonical source.
- Condensed MCP-ready notes live alongside the full copies in `mcp-switch-manual/` (e.g., `overview.md`, `script-folders.md`). Expand or replace with finer-grained files as you refactor for LLM retrieval.
- `TODO.md` defines scope (LLM-friendly Switch scripting manual + future MCP server) and tracks status; update it when you progress tasks.
- Keep new or refactored files small and focused; maintain stable headings for MCP resource keys.
- If you add assets later (images, snippets), place them in a new `assets/` folder and reference them with relative paths.
- Curated examples live in `mcp-switch-manual/examples/`. Each file should note scenario, tested Switch/Node versions, prerequisites, code, and caveats. Add tags in the filename/heading for MCP retrieval.

## Build, Test, and Development Commands
- There is no build pipeline; edit Markdown directly and preview locally (Markdown preview in your editor is sufficient).
- Optional style check (requires local install): `npx markdownlint-cli2 "**/*.md"` to catch heading, spacing, and link issues.
- Link check suggestion (optional): `npx markdown-link-check "**/*.md"` to validate external references when adding many URLs.
 - When MCP work starts, add a minimal README in `mcp-switch-manual/` describing how to consume docs via MCP; keep commands documented there too.

## Coding Style & Naming Conventions
- Write in concise, instructional prose aimed at Switch Node.js scripting users; prefer active voice and short paragraphs.
- Headings: start with `#` for document titles and progress with `##`, `###` without skipping levels; avoid trailing punctuation.
- Code examples: use fenced code blocks with a language tag (e.g., ```js``` for Node.js snippets); keep line length reasonable (<100 chars).
- Filenames: keep the established `Switch Scripting Node-js - Chapter X - Title.md` pattern; avoid spaces in any new folder names (use `-`).
- Lists: favor bullet points for steps and reference lists; keep them parallel and concise.

## Testing Guidelines
- Proofread for accuracy against Switch scripting behavior; verify any code examples run on a current Node.js version used by Switch.
- Run optional linting (`npx markdownlint-cli2`) before submitting to catch format drift.
- For new sections that describe commands or APIs, manually exercise at least one end-to-end example to ensure outputs match what is documented.

## Commit & Pull Request Guidelines
- No commit history exists yet; follow Conventional Commits (e.g., `docs: add chapter 6 examples`) to keep history readable.
- Keep PRs focused: one topic per PR (e.g., new chapter, major revision, link refresh). Include a short summary of changes and scope in the description.
- Reference any related TODO items you addressed; remove or update the corresponding entries in `TODO.md`.
- If screenshots or asset additions become necessary, list their purpose and confirm licensing/attribution in the PR description.

## Security & Configuration Tips
- Do not embed credentials, hostnames, or internal URLs; use placeholders like `<host>` or `<api-key>`.
- When describing automation against Switch or external services, note any permissions required and avoid encouraging unsafe defaults.
