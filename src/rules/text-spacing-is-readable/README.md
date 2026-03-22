# text-spacing-is-readable

Require readable text spacing (letter-spacing >= 0.12em, word-spacing >= 0.16em).

The `--fix` option on the command line can automatically fix all of the problems reported by this rule.

## Options

### true

The following patterns are considered violations:

```css
.foo {
  color: red;
  letter-spacing: 0.05em;
}
```

```css
.foo {
  color: red;
  word-spacing: 0.1em;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  color: red;
  letter-spacing: 0.15em;
  word-spacing: 0.2em;
}
```

```css
.bar {
  display: flex;
}
```

## WCAG Reference

[1.4.12 Text Spacing (Level AA)](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)

---

See all rules in the [main README](../../../README.md#rules).
