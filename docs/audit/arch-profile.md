# Architecture Profile

Detected during `/nitpicker audit`. Describes the pattern the codebase actually
follows, so later `arch` runs can check violations against it rather than
re-deriving it.

## Pattern

**Plugin-with-rule-registry.** A flat, single-layer library. No services, no
persistence, no I/O, no runtime process — the only entry point is a stylelint
plugin array consumed by the stylelint host.

## Layers

| Layer | Files | Responsibility |
| --- | --- | --- |
| Plugin wrapper | `src/index.js` | Maps the registry through `stylelint.createPlugin('a11y/<name>', fn)` and exports the array. Ten lines; holds no logic. |
| Registry | `src/rules/index.js` | Static import of every rule module into one keyed object. The single place a rule is wired in. |
| Rules | `src/rules/<rule-name>/index.js` | One rule per directory. Exports `ruleName`, `messages`, and a default `(primary, secondary, context) => (root, result) => void`. |
| Rule data | `src/rules/<rule>/obsoleteAttributes.js`, `obsoleteElements.js` | Static `Set` lookup tables, colocated with their consumer. |
| Shared utilities | `src/utils/*.js` | Cross-rule helpers: `text-helpers.js` (property classification), `declarations.js` (effective declaration, vendor prefixes), `selectors.js` (guarded selector parse, list normalization), `obsolete-selectors.js` (obsolete tag/attribute matching), `media-queries.js` (feature-query traversal), `create-media-query-rule.js` (rule factory). |
| Shareable config | `recommended.js` | Root-level, published directly (not built). Names three rules. |

## Boundary rules

- **Rules never import other rules.** Sharing goes through `src/utils/`. Held
  today: `media-prefers-color-scheme` and `media-prefers-contrast` are both
  thin wrappers over `utils/create-media-query-rule.js`; `no-spread-text` and
  `text-spacing-is-readable` both use `utils/text-helpers.js`.
- **`src/index.js` and `src/rules/index.js` contain no rule logic.** Held.
- **External surface is stylelint only.** Rules import `stylelint` (default
  export, destructured) and `stylelint/lib/utils/*.mjs`. The deep util path is
  legal — stylelint's `exports` map publishes `"./lib/utils/*"`.
- **`postcss` is imported directly by exactly one rule**
  (`media-prefers-reduced-motion`, for `parse()` in the fix path). It is a
  devDependency, and reaches consumers only as stylelint's own dependency.
- **Every rule is registered.** `src/rules/index.test.js` asserts the registry
  key set, so a rule directory added without a registry entry fails the suite.

## Execution model

Synchronous, single-pass. Each rule returns a function over a PostCSS `Root`
and walks it with `root.walk`/`root.walkRules`. No `async`, `await`, timers,
listeners, or shared mutable state exists anywhere in `src/`. The one
`try`/`catch` is the selector-parser guard in `utils/selectors.js`, which is
the single place this plugin parses a selector — `someSelectorNode` is the
entry point for both `utils/obsolete-selectors.js` and
`selector-pseudo-class-focus`. Concurrency and resource-leak lenses are
therefore structurally N/A for this codebase, not merely unexamined.

Per-run caches (e.g. the `WeakMap` in `selector-pseudo-class-focus`) are
constructed **inside** the returned `(root, result)` function, never at module
scope, so nothing carries between lint invocations.

## Rule metadata

`src/index.js` assigns `meta.url` and `meta.fixable` centrally while mapping
the registry, driven by the `FIXABLE` set declared there. That set is the
single source of truth for both stylelint's metadata surface and the `-`
column in the README; `src/index.test.js` asserts the two agree. A new
fixable rule is wired by adding its name to `FIXABLE`, not by declaring `meta`
in the rule module.

## Secondary options

Option predicates must reject values that are not usable thresholds, not merely
values of the wrong type. `NaN` passes `typeof v === 'number'` and then makes
every comparison against it false, silently disabling the bound it configures;
a negative threshold inverts the rule. The convention is finite-and-positive
(`Number.isFinite(v) && v > 0`, or the parsed length `> 0` for string options).
`src/rules/option-validation.test.js` asserts this across every rule that takes
a numeric or length option.

## Declaration semantics

A property declared twice in one rule resolves to its last declaration, and
`!important` beats a later plain declaration. Rules must judge the winner, not
every declaration: scanning with `.some()` reports fallback pairs
(`font-size: 10px; font-size: 20px`) that never render. `utils/declarations.js`
`effectiveDeclaration` is the single implementation; every value rule goes
through it. Shorthand-and-longhand families
(`outline`/`outline-style`/`outline-width`, `font`/`font-size`,
`animation`/`animation-duration`) are passed as one predicate so the last
declaration across the family wins. Full shorthand-versus-longhand resolution
is out of scope by decision, documented on the helper.

An at-rule nested inside a rule is a *separate* declaration context, not part
of the rule's own list: `.a { display: none; @media print { display: block } }`
is unconditionally `display: none` outside print, so flattening the two lists
would read it as `block`. `declarationContexts` yields the rule and each nested
at-rule; `someContext` runs a per-rule check over all of them. A rule that
inspects declarations must go through one of the two, or it will silently skip
the nested spelling of every violation it exists to catch.

Where a rule searches *other* rules rather than declarations, the same cascade
question applies to source order and to at-rule context — see the counterpart
searches, which skip `@layer` for exactly this reason.

## Walk shape

Every rule walks with `root.walkRules`. The `root.walk` + `@page` variant that
`create-media-query-rule.js` and `media-prefers-reduced-motion` used was
removed: `@page` params are a page selector, the counterpart searches only
match `rule` children, and so an `@page` report could never be satisfied by
any stylesheet. A new rule has no reason to reintroduce it.

## Autofix

Ten of the sixteen rules are fixable. A fix is added only where the corrected
value is *derivable*, never where it is a design or authoring decision — the
six that stay unfixable each say why in their README
(`content-property-no-static-value`, `media-prefers-color-scheme`,
`media-prefers-contrast`, `no-display-none`, `no-obsolete-attribute`,
`no-obsolete-element`).

`FIXABLE` in `src/index.js` is the single source of truth: it drives
`meta.fixable`, `src/index.test.js` asserts the `-` column in the README agrees
with it, and `src/rules/autofix-safety.test.js` asserts every fixable rule has
a fixture set.
Adding a `fix` callback without adding the rule to `FIXABLE` makes stylelint
throw, so the two cannot drift apart silently.

Every fix must be **convergent** (its own output no longer reports),
**idempotent**, **unit-preserving** where the author chose a unit, and
**non-destructive** to declarations the rule does not own — including
`!important` on unrelated properties.
`src/rules/autofix-safety.test.js` asserts all of these for every fixable rule
from one place, plus the cross-rule case: a selector-widening fix
(`selector-pseudo-class-focus`) running alongside a block-inserting fix
(`media-prefers-reduced-motion`). That combination is where non-convergence
actually appeared — each rule was idempotent alone.

Counterpart matching therefore uses `coversSelectors`, not equality: an
override for `.a:hover, .a:focus` covers a rule for `.a:hover`. Requiring
identical lists made `--fix` append a fresh override on every pass
(`audit-36601dd2`).

## Known divergences

`media-prefers-reduced-motion/index.js` still reimplements the "needs a
media-query counterpart" search that `utils/create-media-query-rule.js`
performs for `media-prefers-color-scheme` and `media-prefers-contrast`,
because it also needs a fix path.

The two have drifted five times: `audit-81697e2a` (cascade ordering),
`audit-f3de4e79` (native nesting), `audit-8c8dc39d` (selector normalization),
`audit-746b62e8` (case-insensitive media params) and `audit-6c68c9b2`
(grouping at-rules) — the last of which was *introduced* by fixing the
grouping-at-rule finding in the factory alone. Every shared decision has since
been extracted: `utils/selectors.js` normalizes selectors,
`utils/media-queries.js` owns feature-query traversal and the
transparent-versus-opaque at-rule policy. What remains duplicated is the
assembly around those pieces.

**A change to either counterpart search must be applied to both, or extracted
into `utils/`.** That is the rule this profile exists to enforce; the history
above is what happens when it is not followed.
