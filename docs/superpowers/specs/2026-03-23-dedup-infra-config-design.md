# Deduplication, Infrastructure & Configurable Thresholds Design

## Context

After adding 4 new rules, the codebase has significant code duplication, a broken npm publish config, and hardcoded thresholds users can't customize. This spec covers 3 phases of cleanup.

## Phase 1: Infrastructure Fixes

### Fix `package.json` `files` field

Current:
```json
"files": [
  "README.md",
  "recommended.js",
  "dist/index.js",
  "dist/rules/*/index.js"
]
```

Problem: `obsoleteAttributes.js` and `obsoleteElements.js` are not published. The glob `dist/rules/*/index.js` only matches `index.js`, not supporting data files.

Fix:
```json
"files": [
  "README.md",
  "recommended.js",
  "dist/**/*.js"
]
```

### Update `.gitignore`

Add: `.idea/`, `.vscode/`, `*.log`, `.DS_Store`

### Remove stale files

- Delete `jest.config.js` (replaced by `jest.config.mjs`)
- Delete `.travis.yml` (replaced by `.github/workflows/tests.yml`)
- Remove `eslint-plugin-import` from `package.json` devDependencies if present (old ESLint config dependency)
- Remove `coveralls`, `extend`, `lodash` from devDependencies if present (unused)

### Verification

- `npm pack --dry-run` to verify published files include `dist/rules/no-obsolete-attribute/obsoleteAttributes.js`
- `npm test` still passes
- `npm run build` still works

## Phase 2: Deduplication

### Shared utility: `src/utils/text-helpers.js`

Extract the `textStyles` array and `nodesProbablyForText()` function that are duplicated between `no-spread-text/index.js` and `text-spacing-is-readable/index.js`.

```javascript
export const textStyles = [
  'text-decoration', 'text-align', 'text-transform', 'text-indent',
  'letter-spacing', 'line-height', 'direction', 'word-spacing',
  'text-shadow', 'text-overflow', 'color',
];

export const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));
```

Update `no-spread-text/index.js` and `text-spacing-is-readable/index.js` to import from `../../utils/text-helpers.js`.

### Shared utility: `src/utils/create-media-query-rule.js`

Factory function that generates a complete media-query-checking rule. Used by `media-prefers-color-scheme` and `media-prefers-contrast`, which are nearly identical (differ only in the media feature string).

```javascript
export default function createMediaQueryRule({ mediaFeature, targetProperties, ruleName, messages }) {
  // Returns the rule function: (actual) => (root, result) => { ... }
  // Contains the check() function, walk logic, and report logic
  // mediaFeature is 'prefers-color-scheme' or 'prefers-contrast'
}
```

After extraction, each rule's `index.js` becomes ~10 lines:

```javascript
import createMediaQueryRule from '../../utils/create-media-query-rule.js';
// ... ruleName, messages exports ...
export default createMediaQueryRule({
  mediaFeature: 'prefers-color-scheme',
  targetProperties: ['background-color', 'color'],
  ruleName,
  messages,
});
```

`media-prefers-reduced-motion` stays as-is because it has unique fix logic and different target properties.

### Dropped: `walk-and-report` utility

Originally considered extracting the walk → selector extraction → check → report pattern into a shared utility. **Dropped** because:
- Rules have incompatible `check()` signatures: some use `check(selector, node)`, others use `check(node)`
- Rules split between `root.walk()` and `root.walkRules()` traversal
- The abstraction would need so many options (walk method, check signature, message key) that it wouldn't simplify much

The remaining rules keep their own walk/report logic. The boilerplate is ~10 lines per rule — not worth a leaky abstraction.

### Verification

- All existing tests still pass
- No behavioral changes
- `npm run build` succeeds

## Phase 3: Configurable Thresholds

### Design

Rules accept an optional secondary options object. All thresholds default to current values for backward compatibility.

The stylelint convention is: `config: [true]` for default, `config: [true, { option: value }]` for custom.

### Rules and their options

| Rule | Option | Default | Type |
|------|--------|---------|------|
| `font-size-is-readable` | `minSize` | `"15px"` | string (px or pt). Note: values strictly less than this threshold are rejected (current behavior uses `<`, not `<=`). |
| `line-height-is-vertical-rhythmed` | `minUnitless` | `1.5` | number |
| `line-height-is-vertical-rhythmed` | `gridPx` | `24` | number |
| `no-spread-text` | `minWidth` | `45` | number (ch) |
| `no-spread-text` | `maxWidth` | `80` | number (ch) |
| `animation-duration-reasonable` | `maxDuration` | `"5s"` | string (s or ms) |
| `text-spacing-is-readable` | `minLetterSpacing` | `"0.12em"` | string (em) |
| `text-spacing-is-readable` | `minWordSpacing` | `"0.16em"` | string (em) |

### Implementation pattern

Stylelint rule function signature is `(primary, secondary, context)`. The secondary options object is always the second argument, context is always the third. For rules that already use `context` (like `text-spacing-is-readable`), the signature becomes `(actual, options, context)`.

Use `utils.validateOptions()` with `optional: true` for the secondary argument:

```javascript
export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result, ruleName,
      { actual },
      {
        actual: options,
        possible: { minSize: [(v) => typeof v === 'string'] },
        optional: true,
      }
    );
    if (!validOptions || !actual) return;

    const minSize = options?.minSize || '15px';
    // ... use minSize instead of hardcoded THRESHOLD_IN_PX
  };
}
```

### Test additions

Each configurable rule gets additional test cases with custom options:

```javascript
testRule({
  ruleName,
  config: [true, { minSize: '16px' }],
  accept: [{ code: '.foo { font-size: 16px; }' }],
  reject: [{ code: '.foo { font-size: 15px; }', message: messages.expected('.foo'), line: 1 }],
});
```

### Documentation

Update each rule's README to document the available options under a new "### Options" subsection.

### Verification

- All existing tests pass (defaults are unchanged)
- New tests with custom options pass
- `npm run build` succeeds

## File inventory

### New files
- `src/utils/text-helpers.js`
- `src/utils/create-media-query-rule.js`

### Modified files
- `package.json` (files field, remove unused deps)
- `.gitignore`
- `src/rules/no-spread-text/index.js` (import text-helpers)
- `src/rules/text-spacing-is-readable/index.js` (import text-helpers)
- `src/rules/media-prefers-color-scheme/index.js` (use factory)
- `src/rules/media-prefers-contrast/index.js` (use factory)
- `src/rules/font-size-is-readable/index.js` (add options)
- `src/rules/line-height-is-vertical-rhythmed/index.js` (add options)
- `src/rules/no-spread-text/index.js` (add options)
- `src/rules/animation-duration-reasonable/index.js` (add options)
- `src/rules/text-spacing-is-readable/index.js` (add options)
- Rule READMEs for configurable rules (document options)
- Test files for configurable rules (add option tests)

### Deleted files
- `jest.config.js`
- `.travis.yml`
