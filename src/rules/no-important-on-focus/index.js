import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/no-important-on-focus';

export const messages = utils.ruleMessages(ruleName, {
  expected: (prop, selector) => `Unexpected !important on "${prop}" in ${selector}`,
});

const focusIndicatorProperties = [
  'outline',
  'outline-width',
  'outline-color',
  'outline-style',
  'outline-offset',
  'border',
  'border-color',
  'box-shadow',
];

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      if (!selector.match(/:focus/gi)) {
        return;
      }

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl') return;
        if (!decl.important) return;

        const prop = decl.prop.toLowerCase();

        if (focusIndicatorProperties.includes(prop)) {
          utils.report({
            message: messages.expected(prop, selector),
            node: decl,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
