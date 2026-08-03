# font-size-is-readable

Disallow font sizes less than 15px (or 11.25pt).

**Sources:**

- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-size)
- [Marvel](https://blog.marvelapp.com/body-text-small/)

## Options

### true

The following pattern are considered violations:

```css
.foo {
  font-size: 10px;
}
```

```css
.foo {
  font: 10px/1.5 Arial, sans-serif;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  font-size: 15px;
}
```

```css
.foo {
  font-size: 1em;
}
```

```css
.foo {
  font: 1.5em/1.5 Arial;
}
```

## Properties and units checked

Both `font-size` and the size component of the `font`
shorthand are checked, in `px`, `pt` and `rem`.

`em` and `%` are **not** checked: they resolve against
an inherited font size this rule cannot know, so no
threshold can be applied to them in isolation.

### `minSize` (default: `"15px"`)

Set a custom minimum font size. Values strictly less
than this are rejected. Supports `px`, `pt` and `rem`.

```json
{ "a11y/font-size-is-readable": [true, { "minSize": "16px" }] }
```

## Fixing

The `--fix` option raises the size to the threshold, written in the unit the
author used: `10px` becomes `15px`, `8pt` becomes `11.25pt`, `0.5rem` becomes
`0.9375rem`. In the `font` shorthand only the size component changes; family,
weight, style and line-height are preserved.

## WCAG Reference

[1.4.4 Resize Text (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)

---

See all rules in the [main README](../../../README.md#rules).
