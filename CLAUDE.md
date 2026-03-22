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
