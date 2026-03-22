# selector-pseudo-class-focus

Checks the presence of a pseudo-class for selectors with `:hover`.

```css
a:hover,
a:focus {
}
```

This rule considers :focus pseudo-class selector defined in the CSS Specifications.
The `--fix` option on the command line can automatically fix all of the problems reported by this rule.

## Options

### true

The following pattern are considered violations:

```css
a:hover {
}
```

The following patterns are _not_ considered violations:

```css
a:hover,
a:focus {
}
```

```css
a:focus {
}
```

```css
a:hover {
}
a:focus {
}
```

## WCAG Reference

[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html) and [2.1.1 Keyboard (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html)

---

See all rules in the [main README](../../../README.md#rules).
