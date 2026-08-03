# text-spacing-is-readable

Require readable text spacing
(letter-spacing >= 0.12em, word-spacing >= 0.16em).

The `--fix` option on the command line raises
spacing below the threshold to the threshold.

An explicit zero (`letter-spacing: 0`,
`word-spacing: 0px`) is reported but never
rewritten: widening spacing the author
deliberately set to zero is a typographic
decision, not a lint fix.

## Options

### true

The following patterns are considered violations:

```css
.foo {
  color: red;
  letter-spacing: 0.05em;
}
```

```css
.foo {
  color: red;
  word-spacing: 0.1em;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  color: red;
  letter-spacing: 0.15em;
  word-spacing: 0.2em;
}
```

```css
.bar {
  display: flex;
  padding: 1em;
}
```

**Note:** Rule only fires on selectors with
text-related properties.

### `minLetterSpacing` (default: `"0.12em"`)

Set a custom minimum letter-spacing threshold.

### `minWordSpacing` (default: `"0.16em"`)

Set a custom minimum word-spacing threshold.

```json
{
  "a11y/text-spacing-is-readable": [
    true,
    {
      "minLetterSpacing": "0.15em",
      "minWordSpacing": "0.2em"
    }
  ]
}
```

## Units

Thresholds are expressed in `em`. `px` and `pt` values are converted against a
16px root font size — the same heuristic `no-spread-text` uses — so spacing
authored in absolute units is checked rather than skipped.

Values that cannot be resolved statically (`%`, `calc()`, viewport units,
custom properties) are skipped rather than guessed at.

The `--fix` option writes the threshold in `em` whatever unit the declaration
used, because `0.12em` has no fixed `px` equivalent — it depends on the element's
font size, which the rule cannot know.

## WCAG Reference

Best practice inspired by
[1.4.12 Text Spacing (Level AA)][text-spacing].

[text-spacing]: https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html

> **Note:** WCAG 1.4.12 requires that content not
> break when users override spacing to at least
> 0.12em letter-spacing and 0.16em word-spacing.
> This rule enforces author-side minimums as a
> best-practice heuristic, not a strict
> compliance check.

---

See all rules in the [main README](../../../README.md#rules).
