import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/text-spacing-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expectedLetterSpacing: (selector) =>
    `Expected letter-spacing to be at least 0.12em in ${selector}`,
  expectedWordSpacing: (selector) => `Expected word-spacing to be at least 0.16em in ${selector}`,
});

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
];

const nodesProbablyForText = (nodes) =>
  nodes
    .map((node) => node.prop)
    .filter(Boolean)
    .map((prop) => prop.toLowerCase())
    .some((prop) => textStyles.includes(prop));

const ignoredValues = ['normal', 'inherit', 'initial', 'unset'];

export default function (actual, _, context) {
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

      if (!nodesProbablyForText(rule.nodes)) {
        return;
      }

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl') return;

        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;
        if (!value.endsWith('em')) return;

        if (prop === 'letter-spacing' && parseFloat(value) < 0.12) {
          if (context.fix) {
            decl.value = '0.12em';
            return;
          }
          utils.report({
            message: messages.expectedLetterSpacing(selector),
            node: rule,
            ruleName,
            result,
          });
        }

        if (prop === 'word-spacing' && parseFloat(value) < 0.16) {
          if (context.fix) {
            decl.value = '0.16em';
            return;
          }
          utils.report({
            message: messages.expectedWordSpacing(selector),
            node: rule,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
