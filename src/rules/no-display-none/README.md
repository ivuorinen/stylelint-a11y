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

## Print stylesheets

`display: none` inside a print-only media query is not reported. Hiding
navigation and controls for print is recommended practice and carries none of
the cost this rule prevents — print output has no assistive-technology
interaction model in which the hidden node could have been announced.

```css
/* not a violation */
@media print {
  .nav {
    display: none;
  }
}
```

A query that also affects screen output is still reported:

```css
/* violation */
@media screen, print {
  .nav {
    display: none;
  }
}
```

## Nesting

An at-rule nested inside a rule is its own declaration context, and the
print exemption applies per context: `.a { @media print { display: none } }`
is accepted, `.a { @media screen { display: none } }` is reported.

## Not automatically fixable

Which technique should replace `display: none` depends on the intent: content
meant for assistive technology only needs a visually-hidden pattern, content
meant for nobody should be removed from the document, and content hidden
temporarily may want `hidden` or `inert`. The rule cannot tell these apart, and
each is a different multi-declaration change.

## WCAG Reference

[1.3.2 Meaningful Sequence (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/meaningful-sequence.html)

---

See all rules in the [main README](../../../README.md#rules).
