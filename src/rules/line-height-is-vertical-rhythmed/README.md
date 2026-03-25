# line-height-is-vertical-rhythmed

Disallow not vertical rhythmed line-height.

**Sources:**

- [Zell Liew](https://zellwk.com/blog/why-vertical-rhythms/)

## Options

### true

**Thresholds:** Pixel values must be divisible by 24 (vertical rhythm grid). Unitless/relative values must be >= 1.5.

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

Set a custom minimum for unitless/relative line-height values.

### `gridPx` (default: `24`)

Set a custom pixel grid for vertical rhythm. Pixel line-height values must be divisible by this number.

```json
{ "a11y/line-height-is-vertical-rhythmed": [true, { "minUnitless": 1.8, "gridPx": 12 }] }
```

## WCAG Reference

[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)

---

See all rules in the [main README](../../../README.md#rules).
