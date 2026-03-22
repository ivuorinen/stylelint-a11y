import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/animation-duration-reasonable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected animation duration greater than 5s in ${selector}`,
});

const MAX_DURATION_S = 5;

const ignoredValues = ['none', 'inherit', 'initial', 'unset'];

function parseDurationToSeconds(value) {
  if (value.endsWith('ms')) {
    return parseFloat(value) / 1000;
  }
  if (value.endsWith('s')) {
    return parseFloat(value);
  }
  return NaN;
}

function extractDurationFromShorthand(value) {
  const parts = value.split(/\s+/);
  for (const part of parts) {
    if (/^[\d.]+m?s$/.test(part)) {
      return parseDurationToSeconds(part);
    }
  }
  return NaN;
}

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

      let hasViolation = false;

      rule.nodes.forEach((decl) => {
        if (decl.type !== 'decl' || hasViolation) return;

        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;

        let duration = NaN;

        if (prop === 'animation-duration' || prop === 'transition-duration') {
          duration = parseDurationToSeconds(value);
        } else if (prop === 'animation' || prop === 'transition') {
          const segments = value.split(',');
          for (const segment of segments) {
            const d = extractDurationFromShorthand(segment.trim());
            if (!isNaN(d) && d > MAX_DURATION_S) {
              duration = d;
              break;
            }
          }
        }

        if (!isNaN(duration) && duration > MAX_DURATION_S) {
          hasViolation = true;
        }
      });

      if (hasViolation) {
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
