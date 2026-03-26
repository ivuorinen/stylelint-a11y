import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/font-size-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a larger font-size in ${selector}`,
});

const DEFAULT_THRESHOLD_PX = 15;
const DEFAULT_REM_PX = 16;

/** Converts pixels to points. */
const pxToPt = (v) => 0.75 * v;

/** Converts pixels to rem (assuming 16px base). */
const pxToRem = (v) => v / DEFAULT_REM_PX;

/** Parses a minSize option string (px, pt, or rem) to pixels. */
function parseThresholdPx(minSize) {
  if (!minSize) return DEFAULT_THRESHOLD_PX;
  const lower = minSize.toLowerCase();
  if (lower.endsWith('pt')) {
    return parseFloat(minSize) / 0.75;
  }
  if (lower.endsWith('rem')) {
    return parseFloat(minSize) * DEFAULT_REM_PX;
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
        possible: {
          minSize: [
            (v) => {
              if (typeof v !== 'string') return false;
              const lower = v.toLowerCase();
              return (
                (lower.endsWith('px') || lower.endsWith('pt') || lower.endsWith('rem')) &&
                Number.isFinite(parseFloat(v))
              );
            },
          ],
        },
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
    const checkInRem = (value) =>
      value.toLowerCase().endsWith('rem') && parseFloat(value) < pxToRem(thresholdPx);

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
          (checkInPx(o.value) || checkInPt(o.value) || checkInRem(o.value))
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
