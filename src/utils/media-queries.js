/**
 * At-rules that group without changing the cascade origin, layer or proximity,
 * so a counterpart inside one still overrides a rule outside it.
 *
 * `@layer` and `@scope` are deliberately absent. Unlayered styles beat every
 * layer, and `@scope` changes proximity, so an override inside either does not
 * necessarily win over a rule outside it — descending into them would turn a
 * correct report into a false negative.
 */
const TRANSPARENT_AT_RULES = new Set(['media', 'supports', 'container']);

/** True if an at-rule is a media query mentioning `feature`. */
export const isFeatureQuery = (node, feature) =>
  !!node && node.type === 'atrule' && !!node.params && node.params.toLowerCase().includes(feature);

/**
 * Every `@media (<feature>)` block reachable from `nodes`, descending through
 * transparent grouping at-rules so a counterpart wrapped in `@supports` or a
 * nested `@media` is still found.
 *
 * The single implementation shared by both counterpart searches — the two have
 * drifted apart before, and this is the part that kept drifting.
 */
export function* featureQueryBlocks(nodes, feature) {
  for (const node of nodes) {
    if (!node || node.type !== 'atrule' || !node.nodes) continue;

    if (isFeatureQuery(node, feature)) {
      yield node;
      continue;
    }

    if (TRANSPARENT_AT_RULES.has(node.name.toLowerCase())) {
      yield* featureQueryBlocks(node.nodes, feature);
    }
  }
}
