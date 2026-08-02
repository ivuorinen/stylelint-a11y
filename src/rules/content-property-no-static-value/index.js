import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { effectiveDeclaration, someContext } from '../../utils/declarations.js';

export const ruleName = 'a11y/content-property-no-static-value';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected using "content" property in ${selector}`,
});

/**
 * Both anchored on the colon, so an `after` or `marker` appearing inside a
 * class name or attribute value is not mistaken for the pseudo-element.
 */
const BEFORE_OR_AFTER = /::?(?:before|after)\b/i;
const MARKER = /::?marker\b/i;

/**
 * Content values that add nothing to the accessibility tree. The empty strings
 * are decorative-only content; `none` and `normal` are the standard ways to
 * cancel a pseudo-element, so neither injects text a screen reader would read.
 */
const acceptedValues = new Set(["''", '""', 'attr(aria-label)', 'none', 'normal']);

function declaresStaticContent(context, selectors) {
  // Only the last `content` declaration applies. Judging every one let a
  // decorative `content: ''` mask the `content: "Price: $50"` that overrode it.
  const declaration = effectiveDeclaration(context, (prop) => prop === 'content');

  if (!declaration) {
    return false;
  }

  // `::marker` content is the list bullet whatever its value: presentational,
  // and the list semantics a screen reader announces come from the list
  // element itself, not from the marker.
  if (selectors.every((selector) => MARKER.test(selector))) {
    return false;
  }

  return !(
    selectors.every((selector) => BEFORE_OR_AFTER.test(selector)) &&
    acceptedValues.has(declaration.value.toLowerCase().trim())
  );
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

      if (someContext(rule, (context) => declaresStaticContent(context, rule.selectors))) {
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
