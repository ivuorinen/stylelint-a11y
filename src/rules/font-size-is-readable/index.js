import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';
import { ROOT_FONT_SIZE_PX, formatNumber } from '../../utils/lengths.js';

export const ruleName = 'a11y/font-size-is-readable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a larger font-size in ${selector}`,
});

const DEFAULT_THRESHOLD_PX = 15;

/** Converts pixels to points. */
const pxToPt = (v) => 0.75 * v;

/** Converts pixels to rem (assuming a 16px base). */
const pxToRem = (v) => v / ROOT_FONT_SIZE_PX;

/** The unit a size was written in; `px` unless it says otherwise. */
const unitOf = (size) => {
  const lower = size.toLowerCase();

  if (lower.endsWith('rem')) return 'rem';
  if (lower.endsWith('pt')) return 'pt';

  return 'px';
};

/**
 * Matches the font-size component of the `font` shorthand — the length that
 * precedes the optional `/line-height` and the mandatory font family.
 *
 * The number is spelled `\d+\.?\d*|\.\d+` rather than `(?:\d*\.)?\d+` so no
 * quantifier nests inside another. The nested form made the pattern ambiguous
 * — the engine can split a digit run between `\d*` and `\d+` many ways — which
 * is the shape ReDoS detectors flag. Both accept the same values.
 */
const FONT_SHORTHAND_SIZE = /(?:^|\s)((?:\d+\.?\d*|\.\d+)(?:px|pt|rem))(?=[\s/]|$)/i;

/**
 * The font size a declaration sets, or `null` when it sets none. The caller
 * passes only `font-size` or the `font` shorthand, so anything that is not
 * `font-size` is the shorthand. `em` and `%` are deliberately excluded: they
 * resolve against an inherited size this rule cannot know.
 */
function declaredFontSize(decl) {
  if (decl.prop.toLowerCase() === 'font-size') return decl.value;

  const match = decl.value.match(FONT_SHORTHAND_SIZE);

  return match ? match[1] : null;
}

/** Parses a minSize option string (px, pt, or rem) to pixels. */
function parseThresholdPx(minSize) {
  if (!minSize) return DEFAULT_THRESHOLD_PX;
  const lower = minSize.toLowerCase();
  if (lower.endsWith('pt')) {
    return parseFloat(minSize) / 0.75;
  }
  if (lower.endsWith('rem')) {
    return parseFloat(minSize) * ROOT_FONT_SIZE_PX;
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
              // Positive, not merely finite: a negative threshold is below
              // every declared size and silently disables the rule.
              return (
                (lower.endsWith('px') || lower.endsWith('pt') || lower.endsWith('rem')) &&
                parseFloat(v) > 0
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

    /** The threshold rendered in `unit`, ready to substitute into a value. */
    const thresholdIn = (unit) => {
      if (unit === 'pt') return `${formatNumber(pxToPt(thresholdPx))}pt`;
      if (unit === 'rem') return `${formatNumber(pxToRem(thresholdPx))}rem`;

      return `${formatNumber(thresholdPx)}px`;
    };

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      // The last declaration across `font` and `font-size` is the one that
      // applies, so an earlier fallback size is not judged.
      const tooSmall = [...declarationContexts(rule)]
        .map((context) =>
          effectiveDeclaration(context, (prop) => prop === 'font' || prop === 'font-size')
        )
        .map((declaration) => ({ declaration, size: declaration && declaredFontSize(declaration) }))
        .filter(
          ({ size }) => size != null && (checkInPx(size) || checkInPt(size) || checkInRem(size))
        );

      if (tooSmall.length > 0) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
          // Raised to the threshold in the unit the author wrote, so the fix
          // reads as a corrected version of their declaration rather than a
          // unit change. Only the size component of the `font` shorthand is
          // touched; family, weight and line-height are left alone.
          fix: () => {
            for (const { declaration, size } of tooSmall) {
              const replacement = thresholdIn(unitOf(size));

              declaration.value =
                declaration.prop.toLowerCase() === 'font-size'
                  ? replacement
                  : declaration.value.replace(size, replacement);
            }
          },
        });
      }
    });
  };
}
