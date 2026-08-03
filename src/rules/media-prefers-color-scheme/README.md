# media-prefers-color-scheme

Require implementation of certain styles for selectors with colors.

**Sources:**

- [Docs](https://drafts4.csswg.org/mediaqueries-5/#prefers-color-scheme)
- [less mixin](https://brehaut.net/blog/2018/a_dark_mode_less_mixin)
- [Webkit](https://trac.webkit.org/changeset/237156/webkit)
- [Safari TP](https://webkit.org/blog/8475/release-notes-for-safari-technology-preview-68)
- [Mojave](https://www.apple.com/lae/macos/mojave)

## Options

### true

The following pattern are considered violations:

```css
.foo {
  color: red;
}
```

```css
.bar {
  color: red;
}
.baz {
  background-color: red;
}
@media screen and (prefers-color-scheme: dark) {
  .baz {
    background-color: white;
  }
}
```

In this example, `.bar` is a violation because it has
`color` with no `prefers-color-scheme` counterpart.
`.baz` is also a violation because its dark-mode block
changes `background-color`, not `color`
(the property must match).

```css
.foo {
  color: red;
}
@media screen and (prefers-color-scheme: dark) {
  .foo {
    background-color: red;
  }
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  color: red;
}
@media screen and (prefers-color-scheme: dark) {
  .foo {
    color: white;
  }
}
```

```css
.bar {
  background-color: white;
}
@media screen and (prefers-color-scheme: dark) {
  .bar {
    background-color: gray;
  }
}
```

## Matching the counterpart

The counterpart may be written either as a sibling media query or nested
inside the rule itself; both forms satisfy the rule.

```css
.foo {
  color: red;
  @media (prefers-color-scheme: dark) {
    color: white;
  }
}
```

Selector lists are compared normalized, so `.a,.b` and `.b, .a` are treated as
the same rule regardless of spacing or order.

A sibling media query only counts when it comes **after** the rule it
overrides. Both carry the same specificity, so an override placed earlier
loses the cascade and restyles nothing:

```css
/* violation: the override cannot win */
@media (prefers-color-scheme: dark) {
  .foo {
    color: white;
  }
}
.foo {
  color: red;
}
```

## Grouping at-rules

The counterpart is found through `@media`, `@supports` and `@container`, so
wrapping it in a feature query or a nested media query still satisfies the
rule.

`@layer` is deliberately not searched. Unlayered styles beat every layer, so
an override inside `@layer` does not win over a rule outside it and the
violation stands:

```css
/* still a violation: the unlayered rule wins */
a {
  color: black;
}
@layer theme {
  @media (prefers-color-scheme: dark) {
    a {
      color: white;
    }
  }
}
```

## Not automatically fixable

The rule can tell that a dark-mode counterpart is missing, but not what colour
belongs in it. Inserting a placeholder would either be wrong or silently
restyle the page, so choosing the colour stays a design decision.

Contrast this with `media-prefers-reduced-motion`, which _is_ fixable: the
value an override needs there is always `none`.

## WCAG Reference

Best practice: respects user preference for light/dark color scheme.

---

See all rules in the [main README](../../../README.md#rules).
