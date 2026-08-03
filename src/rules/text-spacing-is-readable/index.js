import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';
import { ROOT_FONT_SIZE_PX } from '../../utils/lengths.js';

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

/**
 * A valid `em` threshold option: a non-negative length in `em`.
 *
 * Matched with an anchored pattern rather than `endsWith('em')`, which also
 * accepted `rem` — a `1rem` threshold was then compared as if it were `1em`
 * and echoed verbatim in the message.
 */
const isEmThreshold = (v) => typeof v === 'string' && /^\d*\.?\d+em$/i.test(v.trim());

/**
 * A spacing value expressed in `em`, or `null` when it cannot be resolved
 * statically (`%`, `calc()`, viewport units, custom properties).
 *
 * `em` and `rem` are taken at face value; `px` and `pt` are converted against
 * the 16px root assumption, the same heuristic `no-spread-text` uses. Without
 * this, spacing authored in `px` was skipped entirely and the rule reported
 * nothing on px-based stylesheets.
 */
function toEm(value) {
  const number = parseFloat(value);

  if (!Number.isFinite(number)) return null;
  if (value.endsWith('em')) return number;
  if (value.endsWith('px')) return number / ROOT_FONT_SIZE_PX;
  if (value.endsWith('pt')) return number / 0.75 / ROOT_FONT_SIZE_PX;
  if (number === 0) return 0;

  return null;
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
          minLetterSpacing: [isEmThreshold],
          minWordSpacing: [isEmThreshold],
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

      // One declaration per property per context: a later `letter-spacing`
      // overrides an earlier one, and a nested at-rule is its own context.
      const spacing = [...declarationContexts(rule)]
        .filter(
          (context) => nodesProbablyForText(rule.nodes) || nodesProbablyForText(context.nodes)
        )
        .flatMap((context) =>
          ['letter-spacing', 'word-spacing'].map((name) =>
            effectiveDeclaration(context, (prop) => prop === name)
          )
        )
        .filter(Boolean);

      spacing.forEach((decl) => {
        const prop = decl.prop.toLowerCase();
        const value = decl.value.toLowerCase();

        if (ignoredValues.includes(value)) return;

        const em = toEm(value);

        if (em === null) return;

        const isZero = em === 0;

        // An explicit zero is reported but never auto-fixed: rewriting it would
        // silently restyle text that the author deliberately set to no extra
        // spacing. Widening it is a typographic decision, not a lint fix.
        const fixable = !isZero;

        if (prop === 'letter-spacing' && em < minLetterSpacing) {
          utils.report({
            message: messages.expectedLetterSpacing(selector, minLetterSpacingStr),
            node: rule,
            ruleName,
            result,
            ...(fixable && {
              fix: () => {
                decl.value = minLetterSpacingStr;
              },
            }),
          });
        }

        if (prop === 'word-spacing' && em < minWordSpacing) {
          utils.report({
            message: messages.expectedWordSpacing(selector, minWordSpacingStr),
            node: rule,
            ruleName,
            result,
            ...(fixable && {
              fix: () => {
                decl.value = minWordSpacingStr;
              },
            }),
          });
        }
      });
    });
  };
}
