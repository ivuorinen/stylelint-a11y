import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';

export const ruleName = 'a11y/no-text-align-justify';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected using "{ text-align: justify; }" in ${selector}`,
});

/**
 * `start` rather than `left`: it follows the writing direction, so the fix does
 * not silently left-align right-to-left text.
 */
const REPLACEMENT = 'start';

/** Every declaration that leaves a context justified, across all its contexts. */
const justifiedDeclarations = (rule) =>
  [...declarationContexts(rule)]
    .map((context) => effectiveDeclaration(context, (prop) => prop === 'text-align'))
    .filter((declaration) => declaration && declaration.value.toLowerCase().trim() === 'justify');

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

      const justified = justifiedDeclarations(rule);

      if (justified.length > 0) {
        utils.report({
          message: messages.expected(rule.selector),
          node: rule,
          ruleName,
          result,
          fix: () => {
            for (const declaration of justified) declaration.value = REPLACEMENT;
          },
        });
      }
    });
  };
}
