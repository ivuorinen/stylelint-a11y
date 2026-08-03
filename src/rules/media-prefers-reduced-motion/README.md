# media-prefers-reduced-motion

Require certain styles if the animation or transition in media features.

Safari 10.1 [introduced](https://webkit.org/blog/7551/responsive-design-for-motion/) the Reduced Motion Media Query. It is a non-vendor-prefixed declaration that allows developers to "create styles that avoid large areas of motion for users that specify a preference for reduced motion in System Preferences."

The `--fix` option on the command line can automatically fix all of the problems reported by this rule.

The generated `@media (prefers-reduced-motion: reduce)` block is placed **after** the rule it overrides. Both have the same specificity, so an override placed before the rule would lose the cascade and reduce no motion at all. For the same reason, an existing reduced-motion block that appears _before_ the rule does not satisfy it.

Every animated property needs its own counterpart: a rule declaring both `transition` and `animation` is not satisfied by an override for only one of them.

## Options

### true

The following pattern are considered violations:

```css
.foo {
  animation: 1s ease-in;
}
```

```css
.bar {
  animation-name: skew;
}
@media screen and (prefers-reduced-motion) {
  .bar {
    transition: none;
  }
}
```

The following patterns are _not_ considered violations:

```css
div {
  transition: none;
}
```

```css
.foo {
  transition: none;
}
@media screen and (prefers-reduced-motion: reduce) {
  .foo {
    transition: none;
  }
}
```

```css
.bar {
  animation: none;
}
@media screen and (prefers-reduced-motion) {
  .bar {
    animation: none;
  }
}
```

## Matching the override

The override may be a sibling `@media (prefers-reduced-motion)` block or one
nested inside the rule itself. A nested block only covers the rule it is
nested in — a nested block belonging to some other rule neutralises nothing
here.

Selector lists are compared normalized, so spacing and order do not matter.
Sibling blocks only count when they come **after** the rule they override:
both carry the same specificity, so an earlier override loses the cascade and
reduces no motion.

## Grouping at-rules

The override is found through `@media`, `@supports` and `@container`, so
grouping it in a feature query or a nested media query still satisfies the
rule. `@layer` is not searched: unlayered styles beat every layer, so an
override inside one does not win over a rule outside it and the violation
stands.

## WCAG Reference

[2.3.3 Animation from Interactions (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

See all rules in the [main README](../../../README.md#rules).
