import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';

export const ruleName = 'a11y/no-outline-none';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected using "outline" property in ${selector}`,
});

/** Properties that can remove the focus ring. */
const outlineProperties = new Set(['outline', 'outline-style', 'outline-width', 'outline-color']);

/** Properties that can stand in for the removed outline. */
const replacementProperties = ['border', 'border-color', 'box-shadow'];

/**
 * Returns true if the declaration removes the focus outline. Covers the
 * shorthand (`outline: none`, `outline: 0`, `outline: 0px`, `outline: 0 none`)
 * as well as the `outline-style` and `outline-width` longhands. Function
 * notation is ignored — a zero colour channel is not a zero outline width.
 */
function removesOutline(prop, value) {
  // Strip function notation before splitting. CSS Color 4 puts bare numbers in
  // the value — `rgb(0 0 0)` would otherwise contribute a `0` part that reads
  // as a zero outline width. Repeated until stable so nested calls
  // (`rgb(0 0 0 / calc(1 * 50%))`) are removed from the inside out.
  let stripped = value.toLowerCase().trim();
  let previous;

  do {
    previous = stripped;
    stripped = stripped.replace(/[\w-]+\([^()]*\)/g, ' ');
  } while (stripped !== previous);

  const parts = stripped.split(/\s+/).filter(Boolean);

  if (prop === 'outline-style') return parts[0] === 'none';
  if (prop === 'outline-width') return parseFloat(parts[0]) === 0;
  // A transparent ring is as invisible as a zero-width one. Function notation
  // was stripped above, so a `transparent` keyword is all that can remain.
  if (prop === 'outline-color') return parts[0] === 'transparent';

  return parts.some((part) => part === 'none' || parseFloat(part) === 0);
}

/**
 * The declaration that removes the focus ring in this context, or `null` when
 * the ring survives — either because nothing removes it, or because the same
 * context supplies a visible replacement.
 */
function ringRemovedBy(context) {
  // Only the last declaration across the outline family applies, so an earlier
  // `outline: 0` fallback followed by a real ring is not a removed outline.
  const outline = effectiveDeclaration(context, (prop) => outlineProperties.has(prop));

  if (outline === null || !removesOutline(outline.prop.toLowerCase(), outline.value)) {
    return null;
  }

  const hasReplacement = context.nodes.some(
    (o) =>
      o.type === 'decl' &&
      replacementProperties.indexOf(o.prop.toLowerCase()) >= 0 &&
      !o.value.toLowerCase().match(/transparent/gi)
  );

  return hasReplacement ? null : outline;
}

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule) || !rule.selector || !rule.selector.match(/:focus/gi)) {
        return;
      }

      const removed = [...declarationContexts(rule)].map(ringRemovedBy).filter(Boolean);

      if (removed.length > 0) {
        utils.report({
          message: messages.expected(rule.selector),
          node: rule,
          ruleName,
          result,
          // `revert` restores the user-agent focus ring for exactly the
          // property that suppressed it. Deleting the declaration would do the
          // same but silently, and inventing a replacement ring would be a
          // design decision this rule has no basis to make.
          fix: () => {
            for (const declaration of removed) declaration.value = 'revert';
          },
        });
      }
    });
  };
}
