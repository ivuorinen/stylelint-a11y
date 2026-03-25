# Rule Audit & New WCAG Rules Design

## Context

Audit all 12 existing stylelint-a11y rules against their README claims, fix discrepancies, add WCAG criterion references, and add 4 new rules to improve WCAG coverage.

## Part 1: Existing Rule Fixes

### README documentation updates

Update each rule's README.md to add explicit WCAG criterion references:

| Rule | WCAG Criterion | Level |
|------|---------------|-------|
| content-property-no-static-value | 1.1.1 Non-text Content | A |
| font-size-is-readable | 1.4.4 Resize Text | AA |
| line-height-is-vertical-rhythmed | 1.4.8 Visual Presentation | AAA |
| media-prefers-color-scheme | Best practice (user preference respect) | — |
| media-prefers-reduced-motion | 2.3.3 Animation from Interactions | AAA |
| no-display-none | 1.3.2 Meaningful Sequence | A |
| no-obsolete-attribute | Best practice (HTML validity) | — |
| no-obsolete-element | Best practice (HTML validity) | — |
| no-outline-none | 2.4.7 Focus Visible | AA |
| no-spread-text | 1.4.8 Visual Presentation | AAA |
| no-text-align-justify | 1.4.8 Visual Presentation | AAA |
| selector-pseudo-class-focus | 2.4.7 Focus Visible, 2.1.1 Keyboard | AA |

Notes:
- `media-prefers-color-scheme`: Does not map cleanly to a single WCAG criterion. It enforces respect for user dark/light mode preference, which is a best practice.
- `no-obsolete-attribute`/`no-obsolete-element`: WCAG 4.1.1 Parsing was removed in WCAG 2.2. These are now general HTML best practices.

### Clarifications needed

1. **line-height-is-vertical-rhythmed README**: Document the two thresholds clearly:
   - Pixel values: must be divisible by 24 (vertical rhythm grid)
   - Unitless/relative values: must be >= 1.5

2. **media-prefers-color-scheme README**: Clarify the multi-selector violation example to show which selector triggers the error.

3. **All rule READMEs**: Add a link back to the main README.md rule listing at the bottom of each rule's README (e.g., "See all rules in the [main README](../../README.md#rules).").

### Root README.md update

Update the main rules table to include the 4 new rules and add WCAG level references.

## Part 2: New Rules

### Rule 1: `text-spacing-is-readable`

**WCAG**: 1.4.12 Text Spacing (Level AA)

**Purpose**: Best-practice rule that flags text with tight letter-spacing or word-spacing. While WCAG 1.4.12 technically requires that content not break when users override spacing (rather than mandating minimum values), enforcing minimum spacing in author stylesheets is the most reliable way to ensure compliance.

**Detection logic**:
- Only fires on rules containing text-related properties (same list as `no-spread-text`: text-decoration, text-align, text-transform, text-indent, letter-spacing, line-height, direction, word-spacing, text-shadow, text-overflow, color)
- Checks `letter-spacing`: reject if value < 0.12em
- Checks `word-spacing`: reject if value < 0.16em
- Values of `normal`, `inherit`, `initial`, `unset` are ignored (not flagged)
- Only checks `em` values (other units cannot be compared to em threshold without font-size context)

**Auto-fix**: Yes. Uses `context` parameter (third argument to rule function), checks `context.fix`.
- If `letter-spacing` < 0.12em: replace value with `0.12em`
- If `word-spacing` < 0.16em: replace value with `0.16em`

**Message template**: `'Expected ${prop} to be at least ${threshold} in ${selector} (a11y/text-spacing-is-readable)'`

**Test cases**:
- Accept: `.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }`
- Accept: `.bar { display: flex; }` (no text props, rule doesn't fire)
- Accept: `.foo { color: red; letter-spacing: normal; }` (normal is not flagged)
- Accept: `.foo { color: red; letter-spacing: 0.12em; }` (exactly at threshold)
- Reject: `.foo { color: red; letter-spacing: 0.05em; }` (too tight)
- Reject: `.foo { color: red; word-spacing: 0.1em; }` (too tight)
- Reject + fix: `.foo { color: red; letter-spacing: 0.05em; }` → `.foo { color: red; letter-spacing: 0.12em; }`

Test config for auto-fix cases: `{ ruleName, config: [true], fix: true, reject: [{ code: '...', fixed: '...' }] }`

**Files**:
- `src/rules/text-spacing-is-readable/index.js`
- `src/rules/text-spacing-is-readable/__tests__/index.js`
- `src/rules/text-spacing-is-readable/README.md`

### Rule 2: `animation-duration-reasonable`

**WCAG**: 2.2.2 Pause, Stop, Hide (Level A) — content that auto-plays for more than 5 seconds must provide a mechanism to pause/stop/hide.

**Purpose**: Warn about animations/transitions with excessive duration (> 5 seconds).

**Detection logic**:
- Checks `animation-duration` property: reject if > 5s
- Checks `transition-duration` property: reject if > 5s
- Checks `animation` shorthand: the first time value in the shorthand is the duration (second is delay). Reject if duration > 5s
- Checks `transition` shorthand: may contain comma-separated transitions. Check each transition independently; reject if any has duration > 5s
- Duration parsing: supports `s` and `ms` units (e.g., `6s` = 6 seconds, `6000ms` = 6 seconds)
- Values of `0s`, `none`, `inherit`, `initial`, `unset` are ignored

**Auto-fix**: No. Duration depends on intent.

**Message template**: `'Unexpected animation duration greater than 5s in ${selector} (a11y/animation-duration-reasonable)'`

**Test cases**:
- Accept: `.foo { transition: all 0.3s ease; }`, `.foo { animation-duration: 2s; }`, `.foo { transition-duration: 500ms; }`
- Accept: `.foo { animation-duration: 5s; }` (exactly at threshold)
- Reject: `.foo { animation-duration: 10s; }`, `.foo { transition: opacity 6s linear; }`, `.foo { transition-duration: 6000ms; }`

**Files**:
- `src/rules/animation-duration-reasonable/index.js`
- `src/rules/animation-duration-reasonable/__tests__/index.js`
- `src/rules/animation-duration-reasonable/README.md`

### Rule 3: `media-prefers-contrast`

**WCAG**: Related to 1.4.3 Contrast (Minimum, Level AA) / 1.4.6 Contrast (Enhanced, Level AAA)

**Purpose**: If a selector sets `color` or `background-color`, it should have a corresponding rule inside `@media (prefers-contrast: more)` that adjusts the same property.

**Detection logic**:
- Same architecture as `media-prefers-color-scheme` rule (reuse the pattern from `src/rules/media-prefers-color-scheme/index.js`)
- Target properties: `color`, `background-color`
- Collects all selectors using target properties outside media queries
- Collects all selectors inside `@media (prefers-contrast)` blocks
- Reports error if a selector with color/background-color has no counterpart in prefers-contrast media query adjusting the same property
- Checks for `prefers-contrast` substring in atrule params (matches `prefers-contrast: more`, `prefers-contrast: less`, etc.)

**Auto-fix**: No. Can't determine appropriate high-contrast colors.

**Message template**: `'Expected ${selector} is used with @media (prefers-contrast) (a11y/media-prefers-contrast)'`

**Test cases**:
- Accept: `.foo { color: #666; } @media (prefers-contrast: more) { .foo { color: #000; } }`
- Accept: `.foo { display: flex; }` (no color properties)
- Reject: `.foo { color: #666; }` (no prefers-contrast counterpart)
- Reject: `.foo { color: #666; } @media (prefers-contrast: more) { .foo { background-color: #fff; } }` (wrong property)

**Files**:
- `src/rules/media-prefers-contrast/index.js`
- `src/rules/media-prefers-contrast/__tests__/index.js`
- `src/rules/media-prefers-contrast/README.md`

### Rule 4: `no-important-on-focus`

**WCAG**: 2.4.7 Focus Visible (Level AA)

**Purpose**: Warn when `!important` is used on focus-indicator properties within `:focus` or `:focus-visible` rules. This can override user-agent or user stylesheets providing custom focus indicators for assistive technology.

**Detection logic**:
- Only fires on rules with `:focus` or `:focus-visible` in selector
- Checks declarations for `outline`, `outline-width`, `outline-color`, `outline-style`, `outline-offset`, `border`, `border-color`, `box-shadow`
- Reports error if any of these declarations use `!important` (check `decl.important === true`)

**Auto-fix**: No. Just warns.

**Message template**: `'Unexpected !important on ${prop} in ${selector} (a11y/no-important-on-focus)'`

**Test cases**:
- Accept: `a:focus { outline: 3px solid blue; }` (no !important)
- Accept: `a:focus { color: red !important; }` (color is not a focus-indicator property)
- Accept: `.foo { outline: none !important; }` (no :focus in selector)
- Reject: `a:focus { outline: 3px solid blue !important; }`
- Reject: `a:focus-visible { box-shadow: 0 0 3px blue !important; }`

**Files**:
- `src/rules/no-important-on-focus/index.js`
- `src/rules/no-important-on-focus/__tests__/index.js`
- `src/rules/no-important-on-focus/README.md`

## Part 3: Registration & Documentation

### Rule registry update

Add all 4 new rules to `src/rules/index.js` with explicit `.js` extensions on imports.

### Root README.md update

Update the rules table to include all 4 new rules with descriptions, recommended/fixable markers, and WCAG references.

### Recommended config update

Do NOT add the new rules to `recommended.js`. Keep the recommended config conservative (the current 3 rules). Users can opt in to new rules individually.

## Verification

1. `npm test` — all existing + new tests pass
2. `npm run lint` — ESLint clean
3. `npm run build` — Babel build succeeds
4. Each new rule tested with accept and reject cases
5. Each new rule has a README.md with examples and WCAG references
