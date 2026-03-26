# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A stylelint plugin (`@ivuorinen/stylelint-a11y`) that enforces CSS accessibility rules. Each rule is namespaced as `a11y/<rule-name>` in stylelint configs.

## Commands

- `npm test` — run all tests (uses Jest with `--experimental-vm-modules`)
- `npm test -- src/rules/no-outline-none/__tests__/index.js` — run a single rule's tests
- `npm run build` — transpile src/ to dist/ via Babel (ESM preserved)
- `npm run lint` — ESLint with flat config (eslint.config.mjs)
- `npm run prettify` — Prettier formatting
- `npm run coverage` — Jest with coverage report (75% threshold)

## Architecture

**Entry point:** `src/index.js` — wraps each rule with `stylelint.createPlugin('a11y/<name>', rule)` and exports the array.

**Rule registry:** `src/rules/index.js` — imports all rules and exports them as a keyed object.

**Rule structure:** Each rule lives in `src/rules/<rule-name>/` with:
- `index.js` — exports `ruleName`, `messages`, and a default function `(actual, _, context) => (root, result) => { ... }`
- `__tests__/index.js` — uses the global `testRule` helper from `jest-preset-stylelint`
- `README.md` — docs with examples and WCAG references
- Some rules have supporting data files (e.g., `obsoleteAttributes.js`)

**Utilities:** Imported directly from `stylelint/lib/utils/*.mjs` (e.g., `isStandardSyntaxRule`, `isStandardSyntaxSelector`).

## Code Conventions

- Project is ESM (`"type": "module"` in package.json)
- Stylelint 17 exports are on the default export: `import stylelint from 'stylelint'; const { utils, createPlugin } = stylelint;`
- Rules validate options with `utils.validateOptions()` and report with `utils.report()` (do NOT pass `index` without `endIndex`)
- Rules check `isStandardSyntaxRule(node)` to skip non-standard syntax (SCSS, Less)
- Auto-fixable rules accept `context` as third param and check `context.fix`; tests use `fix: true` and `fixed:` fields
- Tests use `testRule({ ruleName, config: [true], accept: [...], reject: [...] })` pattern
- Prettier: single quotes, trailing commas (es5), 100 char width
- Node >= 20.19.0 required (stylelint 17 requirement)

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
