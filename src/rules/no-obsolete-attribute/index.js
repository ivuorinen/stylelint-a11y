import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { hasObsoleteSelector } from '../../utils/obsolete-selectors.js';
import { obsoleteAttributes } from './obsoleteAttributes.js';

export const ruleName = 'a11y/no-obsolete-attribute';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected using obsolete attribute "${selector}"`,
});

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule) || !rule.selector) {
        return;
      }

      const isRejected = rule.selectors.some((selector) =>
        hasObsoleteSelector(selector, obsoleteAttributes)
      );

      if (isRejected) {
        utils.report({
          message: messages.expected(rule.selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
