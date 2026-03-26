import stylelint from 'stylelint';
const { utils } = stylelint;
import { parse } from 'postcss';
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import isStandardSyntaxSelector from 'stylelint/lib/utils/isStandardSyntaxSelector.mjs';
import isStandardSyntaxAtRule from 'stylelint/lib/utils/isStandardSyntaxAtRule.mjs';
import isCustomSelector from 'stylelint/lib/utils/isCustomSelector.mjs';

export const ruleName = 'a11y/media-prefers-reduced-motion';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-reduced-motion)`,
});
const targetProperties = ['transition', 'animation', 'animation-name'];

/** Checks if children contain a matching reduced-motion override. */
function checkChildrenNodes(childrenNodes, currentSelector, parentNode) {
  return childrenNodes.some((declaration) => {
    const index = targetProperties.indexOf(declaration.prop);
    if (index < 0) return false;
    const matchedProp = targetProperties[index];
    if (parentNode.params.indexOf('prefers-reduced-motion') === -1) return false;
    if (declaration.value !== 'none') return false;

    if (currentSelector === 'animation-name' && matchedProp === 'animation') return true;

    return currentSelector === matchedProp;
  });
}

/** Checks if animation/transition properties have prefers-reduced-motion counterparts. */
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

  let currentSelector = null;

  const declarationsIsMatched = declarations.some((declaration) => {
    const noMatchedParams = !params || params.indexOf('prefers-reduced-motion') === -1;
    const index = targetProperties.indexOf(declaration.prop);
    if (index < 0) return false;
    const matchedProp = targetProperties[index];
    currentSelector = matchedProp;
    if (declaration.value === 'none') {
      return false;
    }

    return noMatchedParams;
  });

  if (!declarationsIsMatched) return true;

  const parentMatchedNode = parentNodes.some((parentNode) => {
    if (!parentNode || !parentNode.nodes) return false;
    return parentNode.nodes.some((childrenNode) => {
      const childrenNodes = childrenNode.nodes;

      if (
        childrenNode.type === 'atrule' &&
        childrenNode.params.indexOf('prefers-reduced-motion') >= 0
      ) {
        if (!Array.isArray(childrenNodes) || childrenNodes.length === 0) return false;
        return childrenNodes.some((declaration) => {
          const index = targetProperties.indexOf(declaration.prop);
          if (index < 0) return false;
          const matchedProp = targetProperties[index];
          if (declaration.value !== 'none') return false;

          if (currentSelector === 'animation-name' && matchedProp === 'animation') return true;

          return currentSelector === matchedProp;
        });
      }

      if (!parentNode.params || !Array.isArray(childrenNodes) || selector !== childrenNode.selector)
        return false;

      return checkChildrenNodes(childrenNodes, currentSelector, parentNode);
    });
  });

  return parentMatchedNode;
}

export default function (actual, _, context) {
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

      if (context.fix && !isAccepted) {
        const cloneRule = node.clone();
        cloneRule.raws = {
          ...cloneRule.raws,
          before: '\n',
          after: '\n',
          semicolon: true,
        };
        cloneRule.nodes.forEach((o) => {
          if (o.prop === 'animation-name') {
            o.prop = 'animation';
          }
          if (targetProperties.indexOf(o.prop) >= 0) {
            o.value = 'none';
          }
        });

        // Look for an existing @media (prefers-reduced-motion) block
        let existingMedia = null;
        node.root().walkAtRules('media', (atRule) => {
          if (atRule.params.indexOf('prefers-reduced-motion') >= 0) {
            existingMedia = atRule;
          }
        });

        if (existingMedia) {
          // Check if selector already exists in the media block
          let found = false;
          existingMedia.walkRules((rule) => {
            if (rule.selector === node.selector) {
              rule.replaceWith(cloneRule);
              found = true;
            }
          });
          if (!found) {
            existingMedia.append(cloneRule);
          }
        } else {
          const media = parse('@media screen and (prefers-reduced-motion: reduce) {}');
          media.nodes.forEach((o) => {
            o.raws.after = '\n';
          });
          media.first.append(cloneRule);
          node.before(media);
        }
        return;
      }

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
}
