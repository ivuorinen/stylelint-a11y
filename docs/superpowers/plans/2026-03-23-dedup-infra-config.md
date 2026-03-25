# Deduplication, Infrastructure & Configurable Thresholds Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix npm publish config, extract shared utilities to reduce duplication, and add configurable thresholds to 5 rules.

**Architecture:** Phase 1 fixes infrastructure (package.json, .gitignore). Phase 2 extracts `src/utils/text-helpers.js` and `src/utils/create-media-query-rule.js`. Phase 3 adds optional secondary options to rules with hardcoded thresholds.

**Tech Stack:** stylelint 17, Jest 30, ESM (`"type": "module"`)

**Spec:** `docs/superpowers/specs/2026-03-23-dedup-infra-config-design.md`

---

### Task 1: Infrastructure fixes

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Fix the `files` field in package.json**

In `package.json`, replace lines 87-92:

```json
    "files": [
        "README.md",
        "recommended.js",
        "dist/index.js",
        "dist/rules/*/index.js"
    ]
```

With:

```json
    "files": [
        "README.md",
        "recommended.js",
        "dist/**/*.js"
    ]
```

- [ ] **Step 2: Update .gitignore**

Replace the contents of `.gitignore` with:

```
node_modules
dist
.coverage
.idea/
.vscode/
*.log
.DS_Store
```

- [ ] **Step 3: Verify the fix**

Run: `npm run build && npm pack --dry-run 2>&1 | grep obsolete`

Expected output should include:
```
dist/rules/no-obsolete-attribute/obsoleteAttributes.js
dist/rules/no-obsolete-element/obsoleteElements.js
```

- [ ] **Step 4: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore
git commit -m "fix: include data files in npm package, update .gitignore"
```

---

### Task 2: Extract text-helpers utility

**Files:**
- Create: `src/utils/text-helpers.js`
- Modify: `src/rules/no-spread-text/index.js`
- Modify: `src/rules/text-spacing-is-readable/index.js`

- [ ] **Step 1: Create `src/utils/text-helpers.js`**

```javascript
export const textStyles = [
  'text-decoration',
  'text-align',
  'text-transform',
  'text-indent',
  'letter-spacing',
  'line-height',
  'direction',
  'word-spacing',
  'text-shadow',
  'text-overflow',
  'color',
];

export const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));
```

- [ ] **Step 2: Update `src/rules/no-spread-text/index.js`**

Replace lines 11-30 (the `textStyles` array and `nodesProbablyForText` function) with an import:

```javascript
import { nodesProbablyForText } from '../../utils/text-helpers.js';
```

The full file becomes:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/no-spread-text';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected max-width in ${selector}`,
});

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      const isRejected =
        nodesProbablyForText(rule.nodes) &&
        rule.nodes.some((o) => {
          return (
            o.type === 'decl' &&
            o.prop.toLowerCase() === 'max-width' &&
            o.value.toLowerCase().endsWith('ch') &&
            (parseFloat(o.value) < 45 || parseFloat(o.value) > 80)
          );
        });

      if (isRejected) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
```

- [ ] **Step 3: Update `src/rules/text-spacing-is-readable/index.js`**

Replace lines 13-32 (the `textStyles` array and `nodesProbablyForText` function) with an import:

```javascript
import { nodesProbablyForText } from '../../utils/text-helpers.js';
```

The full file becomes:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/text-spacing-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expectedLetterSpacing: (selector) =>
    `Expected letter-spacing to be at least 0.12em in ${selector}`,
  expectedWordSpacing: (selector) => `Expected word-spacing to be at least 0.16em in ${selector}`,
});

const ignoredValues = ['normal', 'inherit', 'initial', 'unset'];

export default function (actual, _, context) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      if (!nodesProbablyForText(rule.nodes)) {
        return;
      }

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl') return;

        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;
        if (!value.endsWith('em')) return;

        if (prop === 'letter-spacing' && parseFloat(value) < 0.12) {
          if (context.fix) {
            decl.value = '0.12em';
            return;
          }
          utils.report({
            message: messages.expectedLetterSpacing(selector, minLetterSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }

        if (prop === 'word-spacing' && parseFloat(value) < 0.16) {
          if (context.fix) {
            decl.value = '0.16em';
            return;
          }
          utils.report({
            message: messages.expectedWordSpacing(selector, minWordSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
```

- [ ] **Step 4: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/no-spread-text src/rules/text-spacing-is-readable`
Expected: Both suites pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/text-helpers.js src/rules/no-spread-text/index.js src/rules/text-spacing-is-readable/index.js
git commit -m "refactor: extract text-helpers utility to deduplicate text style detection"
```

---

### Task 3: Extract media-query-rule factory

**Files:**
- Create: `src/utils/create-media-query-rule.js`
- Modify: `src/rules/media-prefers-color-scheme/index.js`
- Modify: `src/rules/media-prefers-contrast/index.js`

- [ ] **Step 1: Create `src/utils/create-media-query-rule.js`**

This is the `check()` function and walk logic extracted from `media-prefers-color-scheme/index.js`, parameterized by `mediaFeature`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isStandardSyntaxSelector from 'stylelint/lib/utils/isStandardSyntaxSelector.mjs';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';

export default function createMediaQueryRule({ mediaFeature, targetProperties, ruleName, messages }) {
  function check(selector, node) {
    const declarations = node.nodes;
    const params = node.parent.params;
    const parentNodes = node.parent.nodes;

    if (!declarations) return true;

    if (!isStandardSyntaxSelector(selector)) {
      return true;
    }

    if (isCustomSelector(selector)) {
      return true;
    }

    let currentSelector = null;

    const declarationsIsMatched = declarations.some((declaration) => {
      const noMatchedParams = !params || params.indexOf(mediaFeature) === -1;
      const index = targetProperties.indexOf(declaration.prop);
      currentSelector = targetProperties[index];

      return index >= 0 && noMatchedParams;
    });

    if (!declarationsIsMatched) return true;

    if (declarationsIsMatched) {
      const parentMatchedNode = parentNodes.some((parentNode) => {
        if (!parentNode || !parentNode.nodes) return;
        return parentNode.nodes.some((childrenNode) => {
          const childrenNodes = childrenNode.nodes;

          if (
            !parentNode.params ||
            !Array.isArray(childrenNodes) ||
            selector !== childrenNode.selector
          )
            return false;

          const matchedChildrenNodes = childrenNodes.some((declaration) => {
            const index = targetProperties.indexOf(declaration.prop);
            if (currentSelector !== targetProperties[index]) return false;

            return index >= 0 && parentNode.params.indexOf(mediaFeature) >= 0;
          });

          return matchedChildrenNodes;
        });
      });

      return parentMatchedNode;
    }

    return true;
  }

  return function (actual) {
    return (root, result) => {
      const validOptions = utils.validateOptions(result, ruleName, { actual });

      if (!validOptions || !actual) {
        return;
      }

      root.walk((node) => {
        let selector = null;

        if (node.type === 'rule') {
          if (!isStandardSyntaxRule(node)) {
            return;
          }

          selector = node.selector;
        } else if (node.type === 'atrule' && node.name === 'page' && node.params) {
          if (!isStandardSyntaxAtRule(node)) {
            return;
          }

          selector = node.params;
        }

        if (!selector) {
          return;
        }

        const isAccepted = check(selector, node);

        if (!isAccepted) {
          utils.report({
            message: messages.expected(selector),
            node,
            ruleName,
            result,
          });
        }
      });
    };
  };
}
```

- [ ] **Step 2: Rewrite `src/rules/media-prefers-color-scheme/index.js`**

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import createMediaQueryRule from '../../utils/create-media-query-rule.js';

export const ruleName = 'a11y/media-prefers-color-scheme';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-color-scheme)`,
});

export default createMediaQueryRule({
  mediaFeature: 'prefers-color-scheme',
  targetProperties: ['background-color', 'color'],
  ruleName,
  messages,
});
```

- [ ] **Step 3: Rewrite `src/rules/media-prefers-contrast/index.js`**

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import createMediaQueryRule from '../../utils/create-media-query-rule.js';

export const ruleName = 'a11y/media-prefers-contrast';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-contrast)`,
});

export default createMediaQueryRule({
  mediaFeature: 'prefers-contrast',
  targetProperties: ['background-color', 'color'],
  ruleName,
  messages,
});
```

- [ ] **Step 4: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/media-prefers-color-scheme src/rules/media-prefers-contrast`
Expected: Both suites pass

- [ ] **Step 5: Run full suite to verify no regressions**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add src/utils/create-media-query-rule.js src/rules/media-prefers-color-scheme/index.js src/rules/media-prefers-contrast/index.js
git commit -m "refactor: extract media query rule factory to deduplicate color-scheme and contrast rules"
```

---

### Task 4: Add configurable options to `font-size-is-readable`

**Files:**
- Modify: `src/rules/font-size-is-readable/index.js`
- Modify: `src/rules/font-size-is-readable/__tests__/index.js`

- [ ] **Step 1: Add custom-options test block to the test file**

Append to `src/rules/font-size-is-readable/__tests__/index.js`:

```javascript

testRule({
  ruleName,
  config: [true, { minSize: '16px' }],

  accept: [
    {
      code: '.foo { font-size: 16px; }',
    },
    {
      code: '.foo { font-size: 20px; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 15px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Update the rule to accept options**

Rewrite `src/rules/font-size-is-readable/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/font-size-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a larger font-size in ${selector}`,
});

const DEFAULT_THRESHOLD_PX = 15;

const pxToPt = (v) => 0.75 * v;

function parseThresholdPx(minSize) {
  if (!minSize) return DEFAULT_THRESHOLD_PX;
  if (minSize.toLowerCase().endsWith('pt')) {
    return parseFloat(minSize) / 0.75;
  }
  return parseFloat(minSize);
}

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: { minSize: [(v) => typeof v === 'string'] },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const thresholdPx = parseThresholdPx(options?.minSize);

    const checkInPx = (value) =>
      value.toLowerCase().endsWith('px') && parseFloat(value) < thresholdPx;
    const checkInPt = (value) =>
      value.toLowerCase().endsWith('pt') && parseFloat(value) < pxToPt(thresholdPx);

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      const isRejected = rule.nodes.some((o) => {
        return (
          o.type === 'decl' &&
          o.prop.toLowerCase() === 'font-size' &&
          (checkInPx(o.value) || checkInPt(o.value))
        );
      });

      if (isRejected) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
```

- [ ] **Step 3: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/font-size-is-readable`
Expected: PASS (existing tests use default, new tests use custom)

- [ ] **Step 4: Commit**

```bash
git add src/rules/font-size-is-readable/
git commit -m "feat: add configurable minSize option to font-size-is-readable"
```

---

### Task 5: Add configurable options to `animation-duration-reasonable`

**Files:**
- Modify: `src/rules/animation-duration-reasonable/index.js`
- Modify: `src/rules/animation-duration-reasonable/__tests__/index.js`

- [ ] **Step 1: Add custom-options test block**

Append to `src/rules/animation-duration-reasonable/__tests__/index.js`:

```javascript

testRule({
  ruleName,
  config: [true, { maxDuration: '3s' }],

  accept: [
    {
      code: '.foo { animation-duration: 3s; }',
    },
    {
      code: '.foo { transition-duration: 2s; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 4s; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 3500ms; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Update the rule to accept options**

Rewrite `src/rules/animation-duration-reasonable/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/animation-duration-reasonable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected animation duration greater than 5s in ${selector}`,
});

const DEFAULT_MAX_DURATION_S = 5;

const ignoredValues = ['none', 'inherit', 'initial', 'unset'];

function parseDurationToSeconds(value) {
  if (value.endsWith('ms')) {
    return parseFloat(value) / 1000;
  }
  if (value.endsWith('s')) {
    return parseFloat(value);
  }
  return NaN;
}

function extractDurationFromShorthand(value) {
  const parts = value.split(/\s+/);
  for (const part of parts) {
    if (/^[\d.]+m?s$/.test(part)) {
      return parseDurationToSeconds(part);
    }
  }
  return NaN;
}

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: { maxDuration: [(v) => typeof v === 'string'] },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const maxDurationS = options?.maxDuration
      ? parseDurationToSeconds(options.maxDuration)
      : DEFAULT_MAX_DURATION_S;

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      let hasViolation = false;

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl' || hasViolation) return;

        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;

        let duration = NaN;

        if (prop === 'animation-duration' || prop === 'transition-duration') {
          duration = parseDurationToSeconds(value);
        } else if (prop === 'animation' || prop === 'transition') {
          const segments = value.split(',');
          for (const segment of segments) {
            const d = extractDurationFromShorthand(segment.trim());
            if (!isNaN(d) && d > maxDurationS) {
              duration = d;
              break;
            }
          }
        }

        if (!isNaN(duration) && duration > maxDurationS) {
          hasViolation = true;
        }
      });

      if (hasViolation) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
```

- [ ] **Step 3: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/animation-duration-reasonable`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/rules/animation-duration-reasonable/
git commit -m "feat: add configurable maxDuration option to animation-duration-reasonable"
```

---

### Task 6: Add configurable options to `text-spacing-is-readable`

**Files:**
- Modify: `src/rules/text-spacing-is-readable/index.js`
- Modify: `src/rules/text-spacing-is-readable/__tests__/index.js`

- [ ] **Step 1: Add custom-options test block**

Append to `src/rules/text-spacing-is-readable/__tests__/index.js`:

```javascript

testRule({
  ruleName,
  config: [true, { minLetterSpacing: '0.15em', minWordSpacing: '0.2em' }],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
      fixed: '.foo { color: red; letter-spacing: 0.15em; }',
      message: messages.expectedLetterSpacing('.foo'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
      fixed: '.foo { color: red; word-spacing: 0.2em; }',
      message: messages.expectedWordSpacing('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Update the rule to accept options**

Rewrite `src/rules/text-spacing-is-readable/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/text-spacing-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expectedLetterSpacing: (selector, threshold) =>
    `Expected letter-spacing to be at least ${threshold} in ${selector}`,
  expectedWordSpacing: (selector, threshold) =>
    `Expected word-spacing to be at least ${threshold} in ${selector}`,
});

const DEFAULT_MIN_LETTER_SPACING = 0.12;
const DEFAULT_MIN_WORD_SPACING = 0.16;

const ignoredValues = ['normal', 'inherit', 'initial', 'unset'];

export default function (actual, options, context) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minLetterSpacing: [(v) => typeof v === 'string'],
          minWordSpacing: [(v) => typeof v === 'string'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minLetterSpacing = options?.minLetterSpacing
      ? parseFloat(options.minLetterSpacing)
      : DEFAULT_MIN_LETTER_SPACING;
    const minLetterSpacingStr = options?.minLetterSpacing || '0.12em';

    const minWordSpacing = options?.minWordSpacing
      ? parseFloat(options.minWordSpacing)
      : DEFAULT_MIN_WORD_SPACING;
    const minWordSpacingStr = options?.minWordSpacing || '0.16em';

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      if (!nodesProbablyForText(rule.nodes)) {
        return;
      }

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl') return;

        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;
        if (!value.endsWith('em')) return;

        if (prop === 'letter-spacing' && parseFloat(value) < minLetterSpacing) {
          if (context.fix) {
            decl.value = minLetterSpacingStr;
            return;
          }
          utils.report({
            message: messages.expectedLetterSpacing(selector, minLetterSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }

        if (prop === 'word-spacing' && parseFloat(value) < minWordSpacing) {
          if (context.fix) {
            decl.value = minWordSpacingStr;
            return;
          }
          utils.report({
            message: messages.expectedWordSpacing(selector, minWordSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
```

- [ ] **Step 3: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/text-spacing-is-readable`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/rules/text-spacing-is-readable/
git commit -m "feat: add configurable minLetterSpacing/minWordSpacing to text-spacing-is-readable"
```

---

### Task 7: Add configurable options to `no-spread-text` and `line-height-is-vertical-rhythmed`

**Files:**
- Modify: `src/rules/no-spread-text/index.js`
- Modify: `src/rules/no-spread-text/__tests__/index.js`
- Modify: `src/rules/line-height-is-vertical-rhythmed/index.js`
- Modify: `src/rules/line-height-is-vertical-rhythmed/__tests__/index.js`

- [ ] **Step 1: Add custom-options test block to no-spread-text tests**

Append to `src/rules/no-spread-text/__tests__/index.js`:

```javascript

testRule({
  ruleName,
  config: [true, { minWidth: 50, maxWidth: 70 }],

  accept: [
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 45ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { text-transform: lowercase; max-width: 75ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Update `src/rules/no-spread-text/index.js` to accept options**

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/no-spread-text';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected max-width in ${selector}`,
});

const DEFAULT_MIN_WIDTH = 45;
const DEFAULT_MAX_WIDTH = 80;

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minWidth: [(v) => typeof v === 'number'],
          maxWidth: [(v) => typeof v === 'number'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minWidth = options?.minWidth ?? DEFAULT_MIN_WIDTH;
    const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      const isRejected =
        nodesProbablyForText(rule.nodes) &&
        rule.nodes.some((o) => {
          return (
            o.type === 'decl' &&
            o.prop.toLowerCase() === 'max-width' &&
            o.value.toLowerCase().endsWith('ch') &&
            (parseFloat(o.value) < minWidth || parseFloat(o.value) > maxWidth)
          );
        });

      if (isRejected) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
```

- [ ] **Step 3: Add custom-options test block to line-height tests**

Append to `src/rules/line-height-is-vertical-rhythmed/__tests__/index.js`:

```javascript

testRule({
  ruleName,
  config: [true, { minUnitless: 1.8, gridPx: 12 }],

  accept: [
    {
      code: '.foo { line-height: 1.8; }',
    },
    {
      code: '.foo { line-height: 24px; }',
    },
    {
      code: '.foo { line-height: 12px; }',
    },
  ],

  reject: [
    {
      code: '.foo { line-height: 1.5; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { line-height: 7px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 4: Update `src/rules/line-height-is-vertical-rhythmed/index.js` to accept options**

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/line-height-is-vertical-rhythmed';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a vertical rhythmed line-height in ${selector}`,
});

const DEFAULT_MIN_UNITLESS = 1.5;
const DEFAULT_GRID_PX = 24;

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minUnitless: [(v) => typeof v === 'number'],
          gridPx: [(v) => typeof v === 'number'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minUnitless = options?.minUnitless ?? DEFAULT_MIN_UNITLESS;
    const gridPx = options?.gridPx ?? DEFAULT_GRID_PX;

    function check(node) {
      if (node.type !== 'rule') {
        return true;
      }

      const checkInPx = (o) =>
        o.value.toLowerCase().endsWith('px') && parseInt(o.value) % gridPx !== 0;
      const checkInRel = (o) => !isNaN(o.value) && parseFloat(o.value) < minUnitless;

      return !node.nodes.some(
        (o) =>
          o.type === 'decl' &&
          o.prop.toLowerCase() === 'line-height' &&
          (checkInPx(o) || checkInRel(o))
      );
    }

    root.walk((node) => {
      let selector = null;

      if (node.type === 'rule') {
        if (!isStandardSyntaxRule(node)) {
          return;
        }
        selector = node.selector;
      } else if (node.type === 'atrule' && node.name.toLowerCase() === 'page' && node.params) {
        selector = node.params;
      }

      if (!selector) {
        return;
      }

      const isAccepted = check(node);

      if (!isAccepted) {
        utils.report({
          message: messages.expected(selector),
          node,
          ruleName,
          result,
        });
      }
    });
  };
}
```

- [ ] **Step 5: Run tests**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/no-spread-text src/rules/line-height-is-vertical-rhythmed`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/rules/no-spread-text/ src/rules/line-height-is-vertical-rhythmed/
git commit -m "feat: add configurable options to no-spread-text and line-height-is-vertical-rhythmed"
```

---

### Task 8: Update READMEs for configurable rules

**Files:**
- Modify: `src/rules/font-size-is-readable/README.md`
- Modify: `src/rules/animation-duration-reasonable/README.md`
- Modify: `src/rules/text-spacing-is-readable/README.md`
- Modify: `src/rules/no-spread-text/README.md`
- Modify: `src/rules/line-height-is-vertical-rhythmed/README.md`

- [ ] **Step 1: Add options documentation to each configurable rule's README**

For each of the 5 rule READMEs, add an "### Options" subsection after `### true` documenting the available options, their defaults, and examples. For example in `font-size-is-readable/README.md`:

```markdown
### `minSize` (default: `"15px"`)

Set a custom minimum font size. Values strictly less than this are rejected.

```json
{ "a11y/font-size-is-readable": [true, { "minSize": "16px" }] }
```
```

Apply the same pattern for each rule:
- `animation-duration-reasonable`: document `maxDuration` (default: `"5s"`)
- `text-spacing-is-readable`: document `minLetterSpacing` (default: `"0.12em"`) and `minWordSpacing` (default: `"0.16em"`)
- `no-spread-text`: document `minWidth` (default: `45`) and `maxWidth` (default: `80`)
- `line-height-is-vertical-rhythmed`: document `minUnitless` (default: `1.5`) and `gridPx` (default: `24`)

- [ ] **Step 2: Commit**

```bash
git add src/rules/*/README.md
git commit -m "docs: document configurable options in rule READMEs"
```

---

### Task 9: Final verification

- [ ] **Step 1: Run full test suite**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand`
Expected: All tests pass

- [ ] **Step 2: Run lint and build**

Run: `npm run lint && npx babel src --out-dir dist && echo "ALL OK"`
Expected: ALL OK

- [ ] **Step 3: Verify npm pack includes data files**

Run: `npm run build && npm pack --dry-run 2>&1 | grep -E "(obsolete|utils)"`
Expected: data files and utils are included in the package
