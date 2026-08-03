# no-outline-none

Disallow outline clearing.

Why? [Because](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#navigation-mechanisms-focus-visible)

**Sources:**

- [DON'T DO IT!](http://www.outlinenone.com/)
- [a11yproject](https://a11yproject.com/posts/never-remove-css-outlines/)
- [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/outline)

## Options

### true

The following pattern are considered violations:

```css
.foo:focus {
  outline: 0;
}
```

```css
.bar:focus {
  outline: none;
}
```

```css
.baz:focus {
  outline: none;
  border: transparent;
}
```

```scss
.quux {
  .quuux:focus {
    outline: 0;
  }
}
```

```css
.qux:focus {
  outline: 0px;
}
```

```css
.corge:focus {
  outline-style: none;
}
```

```css
.grault:focus {
  outline-width: 0;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  outline: 0;
}
```

```scss
$primary-color: #333;
.bar:focus {
  outline: 1px solid $primary-color;
}
```

```css
.baz:focus {
  outline: 1px solid #333;
}
```

```css
.quux:focus {
  outline: 0;
  border: 1px solid #000;
}
```

```css
.qux:focus {
  outline: 0px;
  box-shadow: 0 0 0 2px blue;
}
```

## Properties checked

The rule fires when a `:focus` selector removes the focus ring through any of:

| Property        | Removing values                                 |
| --------------- | ----------------------------------------------- |
| `outline`       | `none`, or any zero-length part (`0`, `0px`, …) |
| `outline-style` | `none`                                          |
| `outline-width` | any zero length                                 |

A removed outline is accepted only when the same rule provides a visible
replacement via `border`, `border-color` or `box-shadow` — a `transparent`
replacement does not count.

Function notation is stripped before the value is inspected, so the bare
numbers in modern colour syntax are not mistaken for a zero outline width:
`outline: 2px solid rgb(0 0 0)` and `outline: 2px solid hsl(0 0% 0%)` are
visible focus rings and are accepted.

## Note

[Similar rule](https://github.com/stylelint/stylelint/blob/master/lib/rules/declaration-property-value-blacklist/README.md) is in [Stylelint](https://github.com/stylelint/stylelint), but it triggers another error message and does not check for `:focus` selector and `border` property.

```json
{
  "declaration-property-value-blacklist": {
    "outline": ["none", "0"]
  }
}
```

## Nesting

An at-rule nested inside a rule is its own declaration context and is checked
separately, so `.a:focus { @media screen { outline: none } }` is reported just
like the flat spelling.

## Fixing

The `--fix` option sets the suppressing declaration to `revert`, restoring the
user-agent focus ring for exactly the property that hid it — `outline: none`
becomes `outline: revert`, `outline-color: transparent` becomes
`outline-color: revert`.

Reverting rather than deleting keeps the intent visible in the source, and the
rule has no basis to invent a replacement ring of its own design.

## WCAG Reference

[2.4.7 Focus Visible (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)

---

See all rules in the [main README](../../../README.md#rules).
