# media-prefers-contrast

Require implementation of certain styles for selectors
with colors in a `@media (prefers-contrast)` block.

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

## Matching the counterpart

The counterpart may be a sibling media query or one nested inside the rule
itself; both satisfy the rule. Selector lists are compared normalized, so
spacing and order do not matter.

A sibling media query only counts when it comes **after** the rule it
overrides — both carry the same specificity, so an override placed earlier
loses the cascade and restyles nothing.

## Not automatically fixable

The rule can tell that a high-contrast counterpart is missing, but not what
colour belongs in it. Choosing it stays a design decision.

## WCAG Reference

[1.4.3 Contrast (Minimum) (Level AA)][contrast-min]
and
[1.4.6 Contrast (Enhanced) (Level AAA)][contrast-enh]

[contrast-min]: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
[contrast-enh]: https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html

---

See all rules in the [main README](../../../README.md#rules).
