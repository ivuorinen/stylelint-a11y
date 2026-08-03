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

## Which `:hover` counts

Only a `:hover` that applies to the element the selector matches. A `:hover`
inside a functional pseudo-class argument is not reported and never rewritten:
`:not(:hover)` selects the absence of hover and `:has(:hover)` selects an
ancestor, so neither has a `:focus` counterpart to require.

```css
/* not violations */
.a:not(:hover) {
  color: red;
}
.a:has(:hover) {
  color: red;
}
```

## WCAG Reference

[2.4.7 Focus Visible (Level AA)][focus-visible] and
[2.1.1 Keyboard (Level A)][keyboard]

[focus-visible]: https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html
[keyboard]: https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html

---

See all rules in the [main README](../../../README.md#rules).
