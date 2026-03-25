# animation-duration-reasonable

Disallow animations and transitions with duration greater than 5 seconds.

## Options

### true

The following patterns are considered violations:

```css
.foo {
  animation-duration: 10s;
}
```

```css
.foo {
  transition: opacity 6s linear;
}
```

The following patterns are _not_ considered violations:

```css
.foo {
  animation-duration: 2s;
}
```

```css
.foo {
  transition: all 0.3s ease;
}
```

### `maxDuration` (default: `"5s"`)

Set a custom maximum animation/transition duration. Values greater than this are reported. Supports `s` and `ms` units.

```json
{ "a11y/animation-duration-reasonable": [true, { "maxDuration": "3s" }] }
```

## WCAG Reference

[2.2.2 Pause, Stop, Hide (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)

---

See all rules in the [main README](../../../README.md#rules).
