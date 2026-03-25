# Rule Audit & New WCAG Rules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix existing rule READMEs (add WCAG refs, back-links), update root README, and add 4 new accessibility rules.

**Architecture:** Each new rule follows the established pattern: `index.js` (rule logic) + `__tests__/index.js` (testRule tests) + `README.md` (docs). Rules import `stylelint` default export and destructure `utils`. Rules are registered in `src/rules/index.js`.

**Tech Stack:** stylelint 17, Jest 30 (jest-preset-stylelint), PostCSS, Babel

**Spec:** `docs/superpowers/specs/2026-03-23-rule-audit-and-new-rules-design.md`

---

### Task 1: Update existing rule READMEs with WCAG references and back-links

**Files:**
- Modify: `src/rules/content-property-no-static-value/README.md`
- Modify: `src/rules/font-size-is-readable/README.md`
- Modify: `src/rules/line-height-is-vertical-rhythmed/README.md`
- Modify: `src/rules/media-prefers-color-scheme/README.md`
- Modify: `src/rules/media-prefers-reduced-motion/README.md`
- Modify: `src/rules/no-display-none/README.md`
- Modify: `src/rules/no-obsolete-attribute/README.md`
- Modify: `src/rules/no-obsolete-element/README.md`
- Modify: `src/rules/no-outline-none/README.md`
- Modify: `src/rules/no-spread-text/README.md`
- Modify: `src/rules/no-text-align-justify/README.md`
- Modify: `src/rules/selector-pseudo-class-focus/README.md`

- [ ] **Step 1: Add WCAG section and back-link to each rule README**

For each of the 12 rule READMEs, append this at the bottom (adjusting the WCAG reference per rule):

```markdown

## WCAG Reference

[criterion name and link]

---

See all rules in the [main README](../../../README.md#rules).
```

WCAG mappings:
| Rule | Append |
|------|--------|
| content-property-no-static-value | `[1.1.1 Non-text Content (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)` |
| font-size-is-readable | `[1.4.4 Resize Text (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)` |
| line-height-is-vertical-rhythmed | `[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)` |
| media-prefers-color-scheme | `Best practice: respects user preference for light/dark color scheme.` |
| media-prefers-reduced-motion | `[2.3.3 Animation from Interactions (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)` |
| no-display-none | `[1.3.2 Meaningful Sequence (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence.html)` |
| no-obsolete-attribute | `Best practice: avoids obsolete HTML attributes in selectors.` |
| no-obsolete-element | `Best practice: avoids obsolete HTML elements in selectors.` |
| no-outline-none | `[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)` |
| no-spread-text | `[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)` |
| no-text-align-justify | `[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)` |
| selector-pseudo-class-focus | `[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)` and `[2.1.1 Keyboard (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)` |

Also for `line-height-is-vertical-rhythmed`, add a clarification note to the Options section explaining the two thresholds:
- Pixel values: must be divisible by 24 (vertical rhythm grid)
- Unitless values: must be >= 1.5

Also for `media-prefers-color-scheme`, clarify the multi-selector violation example. The second violation example shows `.bar` and `.baz` — add a note explaining that `.bar` errors because it has `color` with no dark-mode counterpart, and `.baz` errors because its dark-mode block changes `background-color` (not `color`, the wrong property).

- [ ] **Step 2: Run lint to verify no formatting issues**

Run: `npx eslint && echo "LINT OK"`
Expected: LINT OK

- [ ] **Step 3: Commit**

```bash
git add src/rules/*/README.md
git commit -m "docs: add WCAG references and back-links to all rule READMEs"
```

---

### Task 2: Add `text-spacing-is-readable` rule

**Files:**
- Create: `src/rules/text-spacing-is-readable/index.js`
- Create: `src/rules/text-spacing-is-readable/__tests__/index.js`
- Create: `src/rules/text-spacing-is-readable/README.md`

- [ ] **Step 1: Write the test file**

Create `src/rules/text-spacing-is-readable/__tests__/index.js`:

```javascript
import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
    {
      code: '.bar { display: flex; }',
    },
    {
      code: '.foo { color: red; letter-spacing: normal; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 2px; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.05em; }',
      fixed: '.foo { color: red; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.foo'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.1em; }',
      fixed: '.foo { color: red; word-spacing: 0.16em; }',
      message: messages.expectedWordSpacing('.foo'),
      line: 1,
    },
    {
      code: '.bar { line-height: 1.5; letter-spacing: 0em; }',
      fixed: '.bar { line-height: 1.5; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.bar'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Write the rule implementation**

Create `src/rules/text-spacing-is-readable/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/text-spacing-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expectedLetterSpacing: (selector) =>
    `Expected letter-spacing to be at least 0.12em in ${selector}`,
  expectedWordSpacing: (selector) =>
    `Expected word-spacing to be at least 0.16em in ${selector}`,
});

const textStyles = [
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

const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));

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
            message: messages.expectedLetterSpacing(selector),
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
            message: messages.expectedWordSpacing(selector),
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

- [ ] **Step 3: Run test to verify it passes**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/text-spacing-is-readable`
Expected: PASS

- [ ] **Step 4: Write the README**

Create `src/rules/text-spacing-is-readable/README.md`:

```markdown
# text-spacing-is-readable

Require readable text spacing (letter-spacing >= 0.12em, word-spacing >= 0.16em).

The `--fix` option on the command line can automatically fix all of the problems reported by this rule.

## Options

### true

The following patterns are considered violations:

` `` `css
.foo {
  color: red;
  letter-spacing: 0.05em;
}
` `` `

` `` `css
.foo {
  color: red;
  word-spacing: 0.1em;
}
` `` `

The following patterns are _not_ considered violations:

` `` `css
.foo {
  color: red;
  letter-spacing: 0.15em;
  word-spacing: 0.2em;
}
` `` `

` `` `css
.bar {
  display: flex;
}
` `` `

## WCAG Reference

[1.4.12 Text Spacing (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)

---

See all rules in the [main README](../../../README.md#rules).
```

(Note: remove the space in the triple backticks above — they are escaped here to avoid breaking this plan's markdown.)

- [ ] **Step 5: Commit**

```bash
git add src/rules/text-spacing-is-readable/
git commit -m "feat: add text-spacing-is-readable rule (WCAG 1.4.12)"
```

---

### Task 3: Add `animation-duration-reasonable` rule

**Files:**
- Create: `src/rules/animation-duration-reasonable/index.js`
- Create: `src/rules/animation-duration-reasonable/__tests__/index.js`
- Create: `src/rules/animation-duration-reasonable/README.md`

- [ ] **Step 1: Write the test file**

Create `src/rules/animation-duration-reasonable/__tests__/index.js`:

```javascript
import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { transition: all 0.3s ease; }',
    },
    {
      code: '.foo { animation-duration: 2s; }',
    },
    {
      code: '.foo { transition-duration: 500ms; }',
    },
    {
      code: '.foo { animation-duration: 5s; }',
    },
    {
      code: '.foo { animation: spin 3s linear infinite; }',
    },
    {
      code: '.foo { transition: none; }',
    },
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 10s; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 6000ms; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition: opacity 6s linear; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { animation: spin 10s linear infinite; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Write the rule implementation**

Create `src/rules/animation-duration-reasonable/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/animation-duration-reasonable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) =>
    `Unexpected animation duration greater than 5s in ${selector}`,
});

const MAX_DURATION_S = 5;

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
          // For comma-separated transitions, check each independently
          const segments = value.split(',');
          for (const segment of segments) {
            const d = extractDurationFromShorthand(segment.trim());
            if (!isNaN(d) && d > MAX_DURATION_S) {
              duration = d;
              break;
            }
          }
        }

        if (!isNaN(duration) && duration > MAX_DURATION_S) {
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

- [ ] **Step 3: Run test to verify it passes**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/animation-duration-reasonable`
Expected: PASS

- [ ] **Step 4: Write the README**

Create `src/rules/animation-duration-reasonable/README.md`:

```markdown
# animation-duration-reasonable

Disallow animations and transitions with duration greater than 5 seconds.

## Options

### true

The following patterns are considered violations:

` `` `css
.foo {
  animation-duration: 10s;
}
` `` `

` `` `css
.foo {
  transition: opacity 6s linear;
}
` `` `

The following patterns are _not_ considered violations:

` `` `css
.foo {
  animation-duration: 2s;
}
` `` `

` `` `css
.foo {
  transition: all 0.3s ease;
}
` `` `

## WCAG Reference

[2.2.2 Pause, Stop, Hide (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)

---

See all rules in the [main README](../../../README.md#rules).
```

(Note: remove the space in the triple backticks above.)

- [ ] **Step 5: Commit**

```bash
git add src/rules/animation-duration-reasonable/
git commit -m "feat: add animation-duration-reasonable rule (WCAG 2.2.2)"
```

---

### Task 4: Add `media-prefers-contrast` rule

**Files:**
- Create: `src/rules/media-prefers-contrast/index.js`
- Create: `src/rules/media-prefers-contrast/__tests__/index.js`
- Create: `src/rules/media-prefers-contrast/README.md`

- [ ] **Step 1: Write the test file**

Create `src/rules/media-prefers-contrast/__tests__/index.js`:

```javascript
import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
    },
    {
      code: '.foo { color: #666; } @media (prefers-contrast: more) { .foo { color: #000; } }',
    },
    {
      code: '.bar { background-color: red } @media screen and (prefers-contrast: more) { .bar { background-color: blue } }',
    },
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: 'a { color: red; }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { background-color: red;}',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { color: #666; } @media (prefers-contrast: more) { .foo { background-color: #fff; } }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Write the rule implementation**

Create `src/rules/media-prefers-contrast/index.js` — clone the pattern from `src/rules/media-prefers-color-scheme/index.js` but replace `'prefers-color-scheme'` with `'prefers-contrast'` in all string checks:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isStandardSyntaxSelector from 'stylelint/lib/utils/isStandardSyntaxSelector.mjs';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';

export const ruleName = 'a11y/media-prefers-contrast';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-contrast)`,
});
const targetProperties = ['background-color', 'color'];

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
    const noMatchedParams = !params || params.indexOf('prefers-contrast') === -1;
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

          return index >= 0 && parentNode.params.indexOf('prefers-contrast') >= 0;
        });

        return matchedChildrenNodes;
      });
    });

    return parentMatchedNode;
  }

  return true;
}

export default function (actual) {
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
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/media-prefers-contrast`
Expected: PASS

- [ ] **Step 4: Write the README**

Create `src/rules/media-prefers-contrast/README.md`:

```markdown
# media-prefers-contrast

Require implementation of certain styles for selectors with colors in a `@media (prefers-contrast)` block.

**Sources:**

- [Docs](https://drafts4.csswg.org/mediaqueries-5/#prefers-contrast)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)

## Options

### true

The following patterns are considered violations:

` `` `css
.foo {
  color: red;
}
` `` `

` `` `css
.foo {
  color: red;
}
@media (prefers-contrast: more) {
  .foo {
    background-color: white;
  }
}
` `` `

The following patterns are _not_ considered violations:

` `` `css
.foo {
  color: red;
}
@media (prefers-contrast: more) {
  .foo {
    color: black;
  }
}
` `` `

## WCAG Reference

[1.4.3 Contrast (Minimum) (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) and [1.4.6 Contrast (Enhanced) (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)

---

See all rules in the [main README](../../../README.md#rules).
```

(Note: remove the space in the triple backticks above.)

- [ ] **Step 5: Commit**

```bash
git add src/rules/media-prefers-contrast/
git commit -m "feat: add media-prefers-contrast rule (WCAG 1.4.3/1.4.6)"
```

---

### Task 5: Add `no-important-on-focus` rule

**Files:**
- Create: `src/rules/no-important-on-focus/index.js`
- Create: `src/rules/no-important-on-focus/__tests__/index.js`
- Create: `src/rules/no-important-on-focus/README.md`

- [ ] **Step 1: Write the test file**

Create `src/rules/no-important-on-focus/__tests__/index.js`:

```javascript
import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a:focus { outline: 3px solid blue; }',
    },
    {
      code: 'a:focus { color: red !important; }',
    },
    {
      code: '.foo { outline: none !important; }',
    },
    {
      code: 'a:focus-visible { outline: 3px solid blue; }',
    },
    {
      code: 'a:focus { border: 1px solid red; box-shadow: 0 0 3px blue; }',
    },
  ],

  reject: [
    {
      code: 'a:focus { outline: 3px solid blue !important; }',
      message: messages.expected('outline', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus-visible { box-shadow: 0 0 3px blue !important; }',
      message: messages.expected('box-shadow', 'a:focus-visible'),
      line: 1,
    },
    {
      code: 'a:focus { border: 1px solid red !important; }',
      message: messages.expected('border', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus { outline-color: blue !important; }',
      message: messages.expected('outline-color', 'a:focus'),
      line: 1,
    },
  ],
});
```

- [ ] **Step 2: Write the rule implementation**

Create `src/rules/no-important-on-focus/index.js`:

```javascript
import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/no-important-on-focus';

export const messages = utils.ruleMessages(ruleName, {
  expected: (prop, selector) =>
    `Unexpected !important on "${prop}" in ${selector}`,
});

const focusIndicatorProperties = [
  'outline',
  'outline-width',
  'outline-color',
  'outline-style',
  'outline-offset',
  'border',
  'border-color',
  'box-shadow',
];

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

      if (!selector.match(/:focus/gi)) {
        return;
      }

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl') return;
        if (!decl.important) return;

        const prop = decl.prop.toLowerCase();

        if (focusIndicatorProperties.includes(prop)) {
          utils.report({
            message: messages.expected(prop, selector),
            node: decl,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
```

- [ ] **Step 3: Run test to verify it passes**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand src/rules/no-important-on-focus`
Expected: PASS

- [ ] **Step 4: Write the README**

Create `src/rules/no-important-on-focus/README.md`:

```markdown
# no-important-on-focus

Disallow `!important` on focus indicator properties in `:focus` or `:focus-visible` rules.

Using `!important` on outline, border, or box-shadow in focus rules can override user-agent or user stylesheets that provide custom focus indicators for assistive technology.

## Options

### true

The following patterns are considered violations:

` `` `css
a:focus {
  outline: 3px solid blue !important;
}
` `` `

` `` `css
a:focus-visible {
  box-shadow: 0 0 3px blue !important;
}
` `` `

The following patterns are _not_ considered violations:

` `` `css
a:focus {
  outline: 3px solid blue;
}
` `` `

` `` `css
a:focus {
  color: red !important;
}
` `` `

## WCAG Reference

[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

---

See all rules in the [main README](../../../README.md#rules).
```

(Note: remove the space in the triple backticks above.)

- [ ] **Step 5: Commit**

```bash
git add src/rules/no-important-on-focus/
git commit -m "feat: add no-important-on-focus rule (WCAG 2.4.7)"
```

---

### Task 6: Register new rules and update documentation

**Files:**
- Modify: `src/rules/index.js`
- Modify: `README.md`

- [ ] **Step 1: Add imports and exports to rule registry**

Add to `src/rules/index.js`.

Note: existing imports use mixed extension styles (some have `/index.js`, most don't). Also normalize all existing imports to use explicit `/index.js` extensions for ESM consistency while you're editing this file.

Imports (add after existing imports):
```javascript
import textSpacingIsReadable from './text-spacing-is-readable/index.js';
import animationDurationReasonable from './animation-duration-reasonable/index.js';
import mediaPrefersContrast from './media-prefers-contrast/index.js';
import noImportantOnFocus from './no-important-on-focus/index.js';
```

Export entries (add to the default export object):
```javascript
  'text-spacing-is-readable': textSpacingIsReadable,
  'animation-duration-reasonable': animationDurationReasonable,
  'media-prefers-contrast': mediaPrefersContrast,
  'no-important-on-focus': noImportantOnFocus,
```

- [ ] **Step 2: Update root README.md rules table**

Add 4 new rows to the rules table after the existing rows:

```markdown
|   |   | [animation-duration-reasonable][rule-animation-duration-reasonable]     | Disallow animations with duration greater than 5 seconds                |
|   |   | [media-prefers-contrast][rule-media-prefers-contrast]                   | Require styles for selectors with colors in `@media (prefers-contrast)` |
|   |   | [no-important-on-focus][rule-no-important-on-focus]                     | Disallow `!important` on focus indicator properties                     |
|   | x | [text-spacing-is-readable][rule-text-spacing-is-readable]               | Require readable letter-spacing and word-spacing                        |
```

Add link references at the bottom of README.md:
```markdown
[rule-animation-duration-reasonable]: ./src/rules/animation-duration-reasonable/README.md
[rule-media-prefers-contrast]: ./src/rules/media-prefers-contrast/README.md
[rule-no-important-on-focus]: ./src/rules/no-important-on-focus/README.md
[rule-text-spacing-is-readable]: ./src/rules/text-spacing-is-readable/README.md
```

- [ ] **Step 3: Run full test suite**

Run: `NODE_OPTIONS="--experimental-vm-modules --no-warnings" npx jest --runInBand`
Expected: All tests pass (92 existing + new tests)

- [ ] **Step 4: Run lint and build**

Run: `npx eslint && npx babel src --out-dir dist && echo "ALL OK"`
Expected: ALL OK

- [ ] **Step 5: Commit**

```bash
git add src/rules/index.js README.md
git commit -m "feat: register 4 new a11y rules and update documentation"
```
