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

### `minSize` (default: `"15px"`)

Set a custom minimum font size. Values strictly less than this are rejected. Supports `px` and `pt` units.

```json
{ "a11y/font-size-is-readable": [true, { "minSize": "16px" }] }
```

## WCAG Reference

[1.4.4 Resize Text (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html)

---

See all rules in the [main README](../../../README.md#rules).
