import stylelint from 'stylelint';
const { utils } = stylelint;
import { parse } from 'postcss';
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';
import { coversSelectors } from '../../utils/selectors.js';
import { featureQueryBlocks, isFeatureQuery } from '../../utils/media-queries.js';

export const ruleName = 'a11y/media-prefers-reduced-motion';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-reduced-motion)`,
});

const targetProperties = ['transition', 'animation', 'animation-name'];

const MEDIA_FEATURE = 'prefers-reduced-motion';

/** The property an override must use to neutralise `prop`. */
const overrideProperty = (prop) => (prop === 'animation-name' ? 'animation' : prop);

/** Returns true if an at-rule is a prefers-reduced-motion media query. */
const isReducedMotion = (node) => isFeatureQuery(node, MEDIA_FEATURE);

/** Collects `<prop>: none` declarations into `overridden`. */
function collectOverrides(declarations, overridden) {
  for (const declaration of declarations || []) {
    if (declaration.type !== 'decl') continue;
    if (declaration.value.trim().toLowerCase() !== 'none') continue;

    overridden.add(declaration.prop.toLowerCase());
  }
}

/**
 * Every property neutralised for `selector` by a reduced-motion block among
 * `siblings`. Handles both the flat form
 * (`@media (prefers-reduced-motion) { .a { animation: none } }`) and the
 * nested form (`.a { animation: 1s x; @media (prefers-reduced-motion) { animation: none } }`).
 *
 * Only blocks at or after `node` count. An override has the same specificity
 * as the rule it overrides, so one placed earlier in the source loses the
 * cascade and reduces no motion at all.
 */
function overriddenProperties(node, selector) {
  const overridden = new Set();
  const siblings = node.parent.nodes;
  const following = siblings.slice(siblings.indexOf(node));

  // The nested form only overrides the rule it is nested in — a nested block
  // belonging to some other sibling neutralises nothing here.
  for (const child of node.nodes) {
    if (isReducedMotion(child)) collectOverrides(child.nodes, overridden);
  }

  // The flat form, reached through transparent grouping at-rules so an override
  // wrapped in `@supports` or a nested `@media` still counts.
  for (const block of featureQueryBlocks(following, MEDIA_FEATURE)) {
    for (const child of block.nodes) {
      if (child.type === 'rule' && coversSelectors(child.selector, selector)) {
        collectOverrides(child.nodes, overridden);
      }
    }
  }

  return overridden;
}

/**
 * Animation-related properties declared on `node` that have no
 * prefers-reduced-motion counterpart. Empty means the rule is satisfied.
 */
function uncoveredProperties(selector, node) {
  const declarations = node.nodes;

  if (isCustomSelector(selector)) return [];

  // A rule already inside a reduced-motion block is the override itself.
  const params = node.parent.params;

  if (params && params.toLowerCase().includes(MEDIA_FEATURE)) return [];

  const animated = new Set(
    declarations
      .filter(
        (declaration) =>
          declaration.type === 'decl' &&
          targetProperties.includes(declaration.prop.toLowerCase()) &&
          declaration.value.trim().toLowerCase() !== 'none'
      )
      .map((declaration) => declaration.prop.toLowerCase())
  );

  if (animated.size === 0) return [];

  const overridden = overriddenProperties(node, selector);

  return [...animated].filter((prop) => !overridden.has(overrideProperty(prop)));
}

/** Sets `<prop>: none` on `rule`, reusing an existing declaration when present. */
function applyOverrides(rule, props, source) {
  for (const prop of props) {
    const target = overrideProperty(prop);
    const existing = rule.nodes.find((o) => o.type === 'decl' && o.prop.toLowerCase() === target);

    if (existing) {
      existing.value = 'none';
      continue;
    }

    const declaration = source.nodes
      .find((o) => o.type === 'decl' && o.prop.toLowerCase() === prop)
      .clone();

    declaration.prop = target;
    declaration.value = 'none';
    rule.append(declaration);
  }
}

/**
 * Adds the missing overrides. The block is placed *after* the offending rule:
 * both have the same specificity, so an override placed before it would lose
 * the cascade and the fix would not reduce any motion.
 */
function addOverrides(node, uncovered) {
  const siblings = node.parent.nodes;
  const index = siblings.indexOf(node);
  const target = siblings.slice(index + 1).find(isReducedMotion);

  if (!target) {
    const media = parse(`@media screen and (${MEDIA_FEATURE}: reduce) {}`).first;
    const override = node.clone();

    override.raws = { ...override.raws, before: '\n', after: '\n', semicolon: true };
    override.removeAll();
    applyOverrides(override, uncovered, node);

    media.append(override);
    node.after(media);

    // Set after insertion: `Root.normalize` copies `raws.before` from the node
    // being inserted after, which would otherwise discard these.
    media.raws.before = '\n';
    media.raws.after = '\n';

    return;
  }

  const existing = target.nodes.find(
    (child) => child.type === 'rule' && coversSelectors(child.selector, node.selector)
  );

  if (existing) {
    applyOverrides(existing, uncovered, node);

    return;
  }

  const override = node.clone();

  override.raws = { ...override.raws, before: '\n', after: '\n', semicolon: true };
  override.removeAll();
  applyOverrides(override, uncovered, node);

  target.append(override);
}

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    // `@page` is deliberately not walked. Its params are a page selector, not
    // an element selector, and the override search only matches `rule`
    // children — so an `@page` report could never be satisfied by any
    // stylesheet. prefers-reduced-motion does not apply to printed pages.
    root.walkRules((node) => {
      if (!isStandardSyntaxRule(node)) {
        return;
      }

      const selector = node.selector;
      const uncovered = uncoveredProperties(selector, node);

      if (uncovered.length === 0) {
        return;
      }

      utils.report({
        message: messages.expected(selector),
        node,
        ruleName,
        result,
        fix: () => addOverrides(node, uncovered),
      });
    });
  };
}
