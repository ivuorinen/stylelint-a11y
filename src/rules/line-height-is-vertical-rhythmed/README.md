# line-height-is-vertical-rhythmed

Disallow not vertical rhythmed line-height.

**Sources:**

- [Zell Liew](https://zellwk.com/blog/why-vertical-rhythms/)

## Options

### true

**Thresholds:** Pixel values must be divisible by 24
(vertical rhythm grid). Unitless and relative values
must be >= 1.5.

**Units:** `px` is checked against the grid. Unitless
values, percentages (`150%` reads as `1.5`) and `em`
are all ratios of the element's own font size, so all
three are checked against `minUnitless`.

`rem` resolves against the root font size rather than
the element's, so it is not a ratio and is skipped —
as are `calc()` and custom properties, which cannot be
resolved statically.

The following pattern are considered violations:

```css
.foo {
  line-height: 12px;
}
```

```css
.foo {
  line-height: 1.3;
}
```

```css
.foo {
  line-height: 50px;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  line-height: 24px;
}
```

```css
.foo {
  line-height: 1.6;
}
```

```css
.foo {
  line-height: 48px;
}
```

### `minUnitless` (default: `1.5`)

Set a custom minimum for unitless, percentage and `em`
line-height values.

### `gridPx` (default: `24`)

Set a custom pixel grid for vertical rhythm. Pixel
line-height values must be divisible by this number.

```json
{
  "a11y/line-height-is-vertical-rhythmed": [
    true, { "minUnitless": 1.8, "gridPx": 12 }
  ]
}
```

## Values checked

A `px` line-height must be a positive multiple of the grid; zero is rejected
even though it divides evenly, because it collapses every line onto one
baseline. Lengths the rule cannot read statically (SCSS variables,
interpolations, `calc()`) are skipped rather than guessed at.

## Fixing

The `--fix` option snaps a `px` line-height _up_ to the next grid multiple, so
lines never become tighter than the author asked for: `23px` becomes `24px`.
Unitless, percentage and `em` values are raised to `minUnitless` in their own
notation (`1.1em` becomes `1.5em`, `110%` becomes `150%`). A collapsed
`line-height: 0px` becomes one grid step.

## WCAG Reference

[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)

---

See all rules in the [main README](../../../README.md#rules).
