/**
 * CSS properties that indicate text-related styling.
 *
 * The font properties matter as much as the `text-*` ones: `max-width` beside
 * `font-size` is the most idiomatic way to write a text block, and omitting
 * them hid that shape from `no-spread-text` entirely.
 */
const textStyles = [
  'text-decoration',
  'text-align',
  'text-transform',
  'text-indent',
  'letter-spacing',
  'line-height',
  'direction',
  'word-spacing',
  'text-shadow',
  'text-overflow',
  'color',
  'font',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'white-space',
  'word-break',
  'hyphens',
];

/** Returns true if any node has a text-related CSS property. */
export const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));
