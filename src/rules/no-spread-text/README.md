# no-spread-text

Require width of text greater than 45 characters and less than 80 characters.

**Sources:**

- [Ryan Mack](https://ryanmack.me/quick-measure)
- [Manuel Matuzovic](https://medium.com/@matuzo/writing-css-with-accessibility-in-mind-8514a0007939)

> Warning! This rule use some heuristics for define css node with styles for text. It may be unstable.

## Options

### true

The following pattern are considered violations:

```css
.foo {
  text-transform: lowercase;
  max-width: 40ch;
}
```

```css
.foo {
  line-height: 1.8;
  max-width: 82ch;
}
```

```css
.foo {
  color: red;
  max-width: 1200px;
}
```

```css
.foo {
  color: red;
  max-width: 100px;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  max-width: 65ch;
}
```

```css
.foo {
  color: red;
  max-width: 640px;
}
```

```css
.foo {
  color: red;
  max-width: 100%;
}
```

## Units

`max-width` is compared as a character count. `ch` is used directly. `px`, `em`
and `rem` are converted using an average glyph width of `0.5em` per character
(and a `16px` root font size for `px`), which is the usual heuristic for
proportional Latin text.

Values that cannot be resolved statically — `%`, viewport units, `calc()` and
custom properties — are skipped rather than guessed at.

### `minWidth` (default: `45`)

Set a custom minimum text width in characters.

### `maxWidth` (default: `80`)

Set a custom maximum text width in characters.

```json
{ "a11y/no-spread-text": [true, { "minWidth": 50, "maxWidth": 70 }] }
```

## When a rule counts as text

The measure is only checked on rules that also carry a text-styling property —
any `text-*`, `font-*`, `letter-spacing`, `line-height`, `word-spacing`,
`white-space`, `word-break`, `hyphens`, `direction` or `color` declaration.
A rule setting `max-width` alone is layout, not text, and is skipped.

## Fixing

The `--fix` option clamps the measure to the nearest end of the comfortable
range, converted back to the unit the author used: `20ch` becomes `45ch`,
`120ch` becomes `80ch`, `100px` becomes `360px`. Values that cannot be resolved
statically are neither reported nor fixed.

## WCAG Reference

[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)

---

See all rules in the [main README](../../../README.md#rules).
