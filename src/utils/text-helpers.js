export const textStyles = [
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
];

export const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));
