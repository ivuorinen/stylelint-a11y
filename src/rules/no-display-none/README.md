# no-display-none

Sources that will help you do without `{ display: none; }` and hide the content:

- [CSS Tricks](https://css-tricks.com/places-its-tempting-to-use-display-none-but-dont/)
- [A11Y Project](https://a11yproject.com/posts/how-to-hide-content/)
- [WebAIM](https://webaim.org/techniques/css/invisiblecontent/)

## Options

### true

The following pattern are considered violations:

```css
.foo {
  display: none;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  display: flex;
}
```

## WCAG Reference

[1.3.2 Meaningful Sequence (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence.html)

---

See all rules in the [main README](../../../README.md#rules).
