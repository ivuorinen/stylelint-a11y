/**
 * True if an at-rule is a *media query* mentioning `feature`.
 *
 * The `name` check matters: without it an `@supports (prefers-reduced-motion:
 * reduce)` block counted as a feature query, and its contents were read as an
 * override that the browser would never apply as one.
 */
export const isFeatureQuery = (node, feature) =>
  !!node &&
  node.type === 'atrule' &&
  node.name.toLowerCase() === 'media' &&
  !!node.params &&
  node.params.toLowerCase().includes(feature);

/**
 * The `@media (<feature>)` blocks among `nodes` that can override a rule those
 * nodes are siblings of.
 *
 * Deliberately does **not** descend into `@media`, `@supports`, `@container`,
 * `@layer` or `@scope`. Every one of them narrows when its contents apply, so
 * a counterpart inside one does not cover a rule outside it:
 *
 * - `@supports`, `@container` and a nested `@media` each add a condition. An
 *   override gated on `@supports (color: red)` reduces no motion on a browser
 *   where that condition is false, while the animated rule outside the group
 *   still applies — so accepting it reports clean on a stylesheet that fails
 *   exactly the users this rule protects.
 * - `@layer` changes the cascade layer and `@scope` changes proximity, so an
 *   override inside either does not necessarily win over a rule outside it:
 *   unlayered styles beat every layer.
 *
 * A counterpart written in the same group as the rule it overrides is a
 * *sibling* of that rule, so it is found without any descent.
 */
export const featureQueryBlocks = (nodes, feature) =>
  nodes.filter((node) => isFeatureQuery(node, feature) && node.nodes);
