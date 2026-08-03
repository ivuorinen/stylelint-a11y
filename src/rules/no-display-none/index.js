import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { effectiveValue, someContext } from '../../utils/declarations.js';

export const ruleName = 'a11y/no-display-none';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected using "{ display: none; }" in ${selector}`,
});

/**
 * True if the rule only ever applies to print output.
 *
 * Hiding navigation and controls in a print stylesheet is recommended
 * practice and carries none of the cost this rule exists to prevent: print
 * output has no assistive-technology interaction model in which the hidden
 * node could have been announced.
 *
 * Only a query that targets print and nothing else is exempt.
 * `@media screen, print` also affects screen output, and `@media not print`
 * means *everything except* print — matching the bare word `print` treated
 * that as print-only and let a real violation through.
 */
function isPrintOnly(node) {
  // Starts at `node`, not its parent: a declaration context can itself be the
  // nested `@media print` block, as in `.a { @media print { display: none } }`.
  for (let parent = node; parent; parent = parent.parent) {
    if (parent.type !== 'atrule' || parent.name.toLowerCase() !== 'media') continue;

    // Every comma-separated query must be print, and none may be negated.
    const queries = parent.params.toLowerCase().split(',');

    if (queries.every((query) => /^\s*(?:only\s+)?print\b/.test(query))) return true;
  }

  return false;
}

function hidesContent(context) {
  const value = effectiveValue(context, 'display');

  return value !== null && value.toLowerCase() === 'none' && !isPrintOnly(context);
}

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

      if (someContext(rule, hidesContent)) {
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
