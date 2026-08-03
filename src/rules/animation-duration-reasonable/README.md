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

Set a custom maximum animation/transition duration.
Values greater than this are reported.
Supports `s` and `ms` units.

```json
{ "a11y/animation-duration-reasonable": [true, { "maxDuration": "3s" }] }
```

## Fixing

The `--fix` option clamps an over-budget duration to the threshold in its own
unit — `10s` becomes `5s`, `8000ms` becomes `5000ms`. Nothing else in the value
changes: the name, timing function, delay, iteration count and direction all
survive, and in a comma-separated list only the entries over budget are
touched.

## WCAG Reference

[2.2.2 Pause, Stop, Hide (Level A)](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)

---

See all rules in the [main README](../../../README.md#rules).
