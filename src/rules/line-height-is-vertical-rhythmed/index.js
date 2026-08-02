import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';
import { formatNumber } from '../../utils/lengths.js';

export const ruleName = 'a11y/line-height-is-vertical-rhythmed';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a vertical rhythmed line-height in ${selector}`,
});

const DEFAULT_MIN_UNITLESS = 1.5;
const DEFAULT_GRID_PX = 24;

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minUnitless: [(v) => Number.isFinite(v) && v > 0],
          gridPx: [(v) => Number.isFinite(v) && v > 0],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minUnitless = options?.minUnitless ?? DEFAULT_MIN_UNITLESS;
    const gridPx = options?.gridPx ?? DEFAULT_GRID_PX;

    /** Every line-height declaration that breaks the vertical rhythm. */
    function check(node) {
      const checkInPx = (o) => {
        if (!o.value.toLowerCase().endsWith('px')) return false;
        const px = parseFloat(o.value);
        // A length this rule cannot read statically (an SCSS variable, an
        // interpolation) is skipped rather than guessed at — the same choice
        // `no-spread-text` makes for `%`, `calc()` and custom properties.
        if (!Number.isFinite(px)) return false;
        // Zero divides evenly into every grid, so the rhythm test alone
        // accepts `line-height: 0px` — which collapses every line onto one
        // baseline. The unitless path already rejects `line-height: 0`.
        return px <= 0 || px % gridPx !== 0;
      };
      // `150%` and `1.5em` are both relative to the element's own font size,
      // exactly like a unitless value, so they are compared the same way.
      const checkInRel = (o) => {
        const value = o.value.toLowerCase().trim();

        // `rem` resolves against the root font size, not this element's, so it
        // is not a ratio and cannot be compared to `minUnitless`.
        if (value.endsWith('rem')) return false;

        if (value.endsWith('%')) return parseFloat(value) / 100 < minUnitless;
        if (value.endsWith('em')) return parseFloat(value) < minUnitless;

        return !isNaN(value) && parseFloat(value) < minUnitless;
      };

      return [...declarationContexts(node)]
        .map((context) => effectiveDeclaration(context, (prop) => prop === 'line-height'))
        .filter(
          (declaration) => declaration && (checkInPx(declaration) || checkInRel(declaration))
        );
    }

    /**
     * The nearest value at or above the declared one that satisfies the rule,
     * in the unit it was written in.
     *
     * A px line-height snaps *up* to the next grid multiple rather than down,
     * so the fix never makes lines tighter than the author asked for.
     */
    function rhythmed(declaration) {
      const value = declaration.value.toLowerCase().trim();

      if (value.endsWith('px')) {
        const px = parseFloat(value);
        const snapped = px <= 0 ? gridPx : Math.ceil(px / gridPx) * gridPx;

        return `${formatNumber(snapped)}px`;
      }

      if (value.endsWith('%')) return `${formatNumber(minUnitless * 100)}%`;
      if (value.endsWith('em')) return `${formatNumber(minUnitless)}em`;

      return formatNumber(minUnitless);
    }

    root.walkRules((node) => {
      if (!isStandardSyntaxRule(node)) {
        return;
      }
      const selector = node.selector;

      if (!selector) {
        return;
      }

      const offending = check(node);

      if (offending.length > 0) {
        utils.report({
          message: messages.expected(selector),
          node,
          ruleName,
          result,
          fix: () => {
            for (const declaration of offending) declaration.value = rhythmed(declaration);
          },
        });
      }
    });
  };
}
