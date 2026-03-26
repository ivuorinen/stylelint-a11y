import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/no-spread-text';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected max-width in ${selector}`,
});

const DEFAULT_MIN_WIDTH = 45;
const DEFAULT_MAX_WIDTH = 80;

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minWidth: [(v) => typeof v === 'number'],
          maxWidth: [(v) => typeof v === 'number'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minWidth = options?.minWidth ?? DEFAULT_MIN_WIDTH;
    const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;

    if (minWidth > maxWidth) {
      utils.report({
        message: `Invalid options: minWidth (${minWidth}) must not be greater than maxWidth (${maxWidth})`,
        node: root,
        ruleName,
        result,
      });
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

      const isRejected =
        nodesProbablyForText(rule.nodes) &&
        rule.nodes.some((o) => {
          return (
            o.type === 'decl' &&
            o.prop.toLowerCase() === 'max-width' &&
            o.value.toLowerCase().endsWith('ch') &&
            (parseFloat(o.value) < minWidth || parseFloat(o.value) > maxWidth)
          );
        });

      if (isRejected) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
        });
      }
    });
  };
}
