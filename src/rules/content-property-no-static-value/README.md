# content-property-no-static-value

Disallow CSS generated content except aria-label attribute content and empty strings.

**Sources:**

- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/content)
- [tink](https://tink.uk/accessibility-support-for-css-generated-content//)

## Options

### true

The following pattern are considered violations:

```css
.foo::before {
  content: 'Price: $50';
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  content: '';
}
```

```css
.foo {
  content: attr(aria-label);
}
```

```css
.foo::before {
  content: none;
}
```

## Accepted values

`content` is accepted when it puts no text into the accessibility tree:
`''` and `""` (decorative only), `attr(aria-label)`, and `none` or `normal`,
which cancel the pseudo-element rather than generating anything.

## Which declaration is judged

Only the last `content` declaration in a rule, since that is the one that
applies. A decorative `content: ''` does not excuse a static value that
overrides it.

`::marker` is exempt whatever its value: the marker is the list bullet, and
the list semantics a screen reader announces come from the list element
itself.

## Not automatically fixable

There is no correct replacement for generated text. Deleting the declaration
would remove content the author deliberately added, and rewriting it to `''`
would silently drop it from the rendered page. Moving the text into the
document, or into an `aria-label` the rule can then accept, is an authoring
decision.

## WCAG Reference

[1.1.1 Non-text Content (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html)

---

See all rules in the [main README](../../../README.md#rules).
