import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';
import { coversSelectors } from './selectors.js';
import { featureQueryBlocks, isFeatureQuery } from './media-queries.js';

/** Creates a stylelint rule that checks for media query counterparts. */
export default function createMediaQueryRule({
  mediaFeature,
  targetProperties,
  ruleName,
  messages,
}) {
  const isTargetMedia = (node) => isFeatureQuery(node, mediaFeature);

  /**
   * Properties overridden by a media query nested inside the rule itself, as in
   * `a { color: black; @media (prefers-color-scheme: dark) { color: white } }`.
   */
  function nestedOverrides(declarations) {
    const overridden = new Set();

    for (const child of declarations) {
      if (!isTargetMedia(child)) continue;

      for (const declaration of child.nodes || []) {
        if (declaration.type === 'decl') overridden.add(declaration.prop.toLowerCase());
      }
    }

    return overridden;
  }

  function check(selector, node) {
    const declarations = node.nodes;
    const params = node.parent.params;

    if (isCustomSelector(selector)) {
      return true;
    }

    const isOutsideMediaFeature = !params || params.toLowerCase().indexOf(mediaFeature) === -1;

    // Collect all target properties used outside the relevant media query
    const matchedProperties = declarations
      .filter(
        (declaration) =>
          declaration.type === 'decl' &&
          targetProperties.includes(declaration.prop.toLowerCase()) &&
          isOutsideMediaFeature
      )
      .map((declaration) => declaration.prop.toLowerCase());

    if (matchedProperties.length === 0) return true;

    const nested = nestedOverrides(declarations);

    // Only media queries *after* this rule count. The override carries the same
    // specificity as the rule it overrides, so one placed earlier loses the
    // cascade and restyles nothing.
    const siblings = node.parent.nodes;
    const following = siblings.slice(siblings.indexOf(node) + 1);
    const blocks = [...featureQueryBlocks(following, mediaFeature)];

    // Check that every matched property has a counterpart inside the media query
    const allCovered = matchedProperties.every((prop) => {
      if (nested.has(prop)) return true;

      return blocks.some((parentNode) =>
        parentNode.nodes.some((childrenNode) => {
          if (childrenNode.type !== 'rule') return false;
          if (!coversSelectors(childrenNode.selector, selector)) return false;

          return childrenNode.nodes.some(
            (declaration) => declaration.type === 'decl' && declaration.prop.toLowerCase() === prop
          );
        })
      );
    });

    return allCovered;
  }

  return function (actual) {
    return (root, result) => {
      const validOptions = utils.validateOptions(result, ruleName, { actual });

      if (!validOptions || !actual) {
        return;
      }

      // `@page` is deliberately not walked. Its params are a page selector, not
      // an element selector, and the counterpart search only matches `rule`
      // children — so an `@page` report could never be satisfied by any
      // stylesheet. The user-preference features these rules check do not apply
      // to the printed-page context either.
      root.walkRules((node) => {
        if (!isStandardSyntaxRule(node)) {
          return;
        }

        const selector = node.selector;
        const isAccepted = check(selector, node);

        if (!isAccepted) {
          utils.report({
            message: messages.expected(selector),
            node,
            ruleName,
            result,
          });
        }
      });
    };
  };
}
