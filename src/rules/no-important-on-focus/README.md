# no-important-on-focus

Disallow `!important` on focus indicator properties
in `:focus` or `:focus-visible` rules.

Using `!important` on outline, border, or box-shadow
in focus rules can override user-agent or user
stylesheets that provide custom focus indicators
for assistive technology.

## Options

### true

The following patterns are considered violations:

```css
a:focus {
  outline: 3px solid blue !important;
}
```

```css
a:focus-visible {
  box-shadow: 0 0 3px blue !important;
}
```

The following patterns are _not_ considered violations:

```css
a:focus {
  outline: 3px solid blue;
}
```

```css
a:focus {
  color: red !important;
}
```

## WCAG Reference

[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

---

See all rules in the [main README](../../../README.md#rules).
