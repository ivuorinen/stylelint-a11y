# no-spread-text

Require width of text greater than 45 characters and less than 80 characters.

**Sources:**

- [Ryan Mack](https://ryanmack.me/quick-measure)
- [Manuel Matuzovic](https://medium.com/@matuzo/writing-css-with-accessibility-in-mind-8514a0007939)

> Warning! This rule use some heuristics for define css node with styles for text. It may be unstable.

## Options

### true

The following pattern are considered violations:

```css
.foo {
  text-transform: lowercase;
  max-width: 40ch;
}
```

```css
.foo {
  line-height: 1.8;
  max-width: 82ch;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  max-width: 65ch;
}
```

```css
.foo {
  max-width: 82ch;
}
```

```css
.foo {
  max-width: 100px;
}
```

### `minWidth` (default: `45`)

Set a custom minimum text width in `ch` units.

### `maxWidth` (default: `80`)

Set a custom maximum text width in `ch` units.

```json
{ "a11y/no-spread-text": [true, { "minWidth": 50, "maxWidth": 70 }] }
```

## WCAG Reference

[1.4.8 Visual Presentation (Level AAA)](https://www.w3.org/WAI/WCAG21/Understanding/visual-presentation.html)

---

See all rules in the [main README](../../../README.md#rules).
