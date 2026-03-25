import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';

export const ruleName = 'a11y/text-spacing-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expectedLetterSpacing: (selector, threshold) =>
    `Expected letter-spacing to be at least ${threshold} in ${selector}`,
  expectedWordSpacing: (selector, threshold) =>
    `Expected word-spacing to be at least ${threshold} in ${selector}`,
});

const DEFAULT_MIN_LETTER_SPACING = 0.12;
const DEFAULT_MIN_WORD_SPACING = 0.16;

const ignoredValues = ['normal', 'inherit', 'initial', 'unset'];

export default function (actual, options, context) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minLetterSpacing: [(v) => typeof v === 'string'],
          minWordSpacing: [(v) => typeof v === 'string'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minLetterSpacing = options?.minLetterSpacing
      ? parseFloat(options.minLetterSpacing)
      : DEFAULT_MIN_LETTER_SPACING;
    const minLetterSpacingStr = options?.minLetterSpacing || '0.12em';

    const minWordSpacing = options?.minWordSpacing
      ? parseFloat(options.minWordSpacing)
      : DEFAULT_MIN_WORD_SPACING;
    const minWordSpacingStr = options?.minWordSpacing || '0.16em';

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

        if (prop === 'letter-spacing' && parseFloat(value) < minLetterSpacing) {
          if (context.fix) {
            decl.value = minLetterSpacingStr;
            return;
          }
          utils.report({
            message: messages.expectedLetterSpacing(selector, minLetterSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }

        if (prop === 'word-spacing' && parseFloat(value) < minWordSpacing) {
          if (context.fix) {
            decl.value = minWordSpacingStr;
            return;
          }
          utils.report({
            message: messages.expectedWordSpacing(selector, minWordSpacingStr),
            node: rule,
            ruleName,
            result,
          });
        }
      });
    });
  };
}
