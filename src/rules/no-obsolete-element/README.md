# no-obsolete-element

Disallow obsolete selectors using.

**Sources:**

- [W3G Obsolete features](https://www.w3.org/TR/html5/obsolete.html#obsolete)
- [W3G Features removed](https://www.w3.org/TR/html52/changes.html#features-removed)

## Options

### true

The following pattern are considered violations:

```css
blink {
  color: pink;
}
```

```css
.wrapper font {
  color: pink;
}
```

```css
nav > marquee:hover {
  color: pink;
}
```

The following patterns are _not_ considered violations:

```css
menu {
  color: pink;
}
```

```css
.blink {
  color: pink;
}
```

## Matching

Selectors are parsed, not string-matched, so an obsolete element is detected
wherever it appears — as a descendant, qualified by a class or id, or behind a
combinator. Class, id and attribute values that merely share a name with an
obsolete element are not matched.

`menu` and `hgroup` are **not** treated as obsolete: both are conforming
elements in the current HTML Living Standard.

`image` is not treated as obsolete either. It is a conforming element in SVG,
and an HTML `<image>` start tag is rewritten to `img` by the parser — so the
tag can only legitimately appear as SVG, and a selector-based rule could never
catch the HTML mistake.

## Not automatically fixable

Replacing an obsolete element means changing the markup, not the stylesheet.
The rule can see that a selector targets `font` or `marquee`, but it cannot
know which element the author should have used instead, and rewriting the
selector alone would leave it matching nothing.

## WCAG Reference

Best practice: avoid obsolete HTML elements in selectors.

---

See all rules in the [main README](../../../README.md#rules).
