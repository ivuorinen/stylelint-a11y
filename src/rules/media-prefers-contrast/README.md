# media-prefers-contrast

Require implementation of certain styles for selectors with colors in a `@media (prefers-contrast)` block.

**Sources:**

- [Docs](https://drafts4.csswg.org/mediaqueries-5/#prefers-contrast)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)

## Options

### true

The following patterns are considered violations:

```css
.foo {
  color: red;
}
```

```css
.foo {
  color: red;
}
@media (prefers-contrast: more) {
  .foo {
    background-color: white;
  }
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  color: red;
}
@media (prefers-contrast: more) {
  .foo {
    color: black;
  }
}
```

## WCAG Reference

[1.4.3 Contrast (Minimum) (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) and [1.4.6 Contrast (Enhanced) (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)

---

See all rules in the [main README](../../../README.md#rules).
