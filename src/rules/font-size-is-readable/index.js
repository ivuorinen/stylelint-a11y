import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/font-size-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a larger font-size in ${selector}`,
});

const DEFAULT_THRESHOLD_PX = 15;

const pxToPt = (v) => 0.75 * v;

function parseThresholdPx(minSize) {
  if (!minSize) return DEFAULT_THRESHOLD_PX;
  if (minSize.toLowerCase().endsWith('pt')) {
    return parseFloat(minSize) / 0.75;
  }
  return parseFloat(minSize);
}

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: { minSize: [(v) => typeof v === 'string'] },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const thresholdPx = parseThresholdPx(options?.minSize);

    const checkInPx = (value) =>
      value.toLowerCase().endsWith('px') && parseFloat(value) < thresholdPx;
    const checkInPt = (value) =>
      value.toLowerCase().endsWith('pt') && parseFloat(value) < pxToPt(thresholdPx);

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      const isRejected = rule.nodes.some((o) => {
        return (
          o.type === 'decl' &&
          o.prop.toLowerCase() === 'font-size' &&
          (checkInPx(o.value) || checkInPt(o.value))
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
