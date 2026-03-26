import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isStandardSyntaxSelector from 'stylelint/lib/utils/isStandardSyntaxSelector.mjs';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';

export default function createMediaQueryRule({
  mediaFeature,
  targetProperties,
  ruleName,
  messages,
}) {
  function check(selector, node) {
    const declarations = node.nodes;
    const params = node.parent.params;
    const parentNodes = node.parent.nodes;

    if (!declarations) return true;

    if (!isStandardSyntaxSelector(selector)) {
      return true;
    }

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

    // Check that every matched property has a counterpart inside the media query
    const allCovered = matchedProperties.every((prop) => {
      return parentNodes.some((parentNode) => {
        if (!parentNode || !parentNode.nodes || !parentNode.params) return false;
        if (parentNode.params.toLowerCase().indexOf(mediaFeature) === -1) return false;

        return parentNode.nodes.some((childrenNode) => {
          const childrenNodes = childrenNode.nodes;

          if (!Array.isArray(childrenNodes) || selector !== childrenNode.selector) return false;

          return childrenNodes.some(
            (declaration) => declaration.type === 'decl' && declaration.prop.toLowerCase() === prop
          );
        });
      });
    });

    return allCovered;
  }

  return function (actual) {
    return (root, result) => {
      const validOptions = utils.validateOptions(result, ruleName, { actual });

      if (!validOptions || !actual) {
        return;
      }

      root.walk((node) => {
        let selector = null;

        if (node.type === 'rule') {
          if (!isStandardSyntaxRule(node)) {
            return;
          }

          selector = node.selector;
        } else if (node.type === 'atrule' && node.name === 'page' && node.params) {
          if (!isStandardSyntaxAtRule(node)) {
            return;
          }

          selector = node.params;
        }

        if (!selector) {
          return;
        }

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
