import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { unprefixed } from '../../utils/declarations.js';

export const ruleName = 'a11y/no-important-on-focus';

export const messages = utils.ruleMessages(ruleName, {
  expected: (prop, selector) => `Unexpected !important on "${prop}" in ${selector}`,
});

/** Returns true if the property is a focus indicator (outline, border, box-shadow). */
const isFocusIndicatorProperty = (prop) =>
  prop === 'box-shadow' ||
  /^outline(?:-|$)/.test(prop) ||
  /^border(?:-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?(?:-(?:color|style|width))?$/.test(
    prop
  );

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

        // Matched unprefixed, but reported as written so the author can find
        // the declaration.
        const prop = decl.prop.toLowerCase();

        if (isFocusIndicatorProperty(unprefixed(prop))) {
          utils.report({
            message: messages.expected(prop, selector),
            node: decl,
            ruleName,
            result,
            // Dropping the flag is exactly what the rule asks for: the
            // declaration stays, it just stops out-ranking a user stylesheet.
            // `raws.important` holds the original ` !important` text and would
            // otherwise be printed back out.
            fix: () => {
              decl.important = false;
              delete decl.raws.important;
            },
          });
        }
      });
    });
  };
}
