import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { nodesProbablyForText } from '../../utils/text-helpers.js';
import { declarationContexts, effectiveDeclaration } from '../../utils/declarations.js';
import { ROOT_FONT_SIZE_PX, formatNumber } from '../../utils/lengths.js';

export const ruleName = 'a11y/no-spread-text';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Unexpected max-width in ${selector}`,
});

const DEFAULT_MIN_WIDTH = 45;
const DEFAULT_MAX_WIDTH = 80;

/**
 * Average glyph width as a fraction of the font size, used to turn absolute and
 * font-relative lengths into an approximate character count. 0.5em per
 * character is the usual heuristic for proportional Latin text — close enough
 * for a lint threshold, and the only way to judge a `max-width` that is not
 * already expressed in `ch`.
 */
const EM_PER_CH = 0.5;

/**
 * Approximate character count for a `max-width` value, or `null` when the value
 * cannot be resolved statically (`%`, `vw`, `calc()`, custom properties).
 */
function toCharacters(value) {
  const normalized = value.toLowerCase().trim();
  const number = parseFloat(normalized);

  if (!Number.isFinite(number)) return null;

  if (normalized.endsWith('ch')) return number;
  if (normalized.endsWith('rem') || normalized.endsWith('em')) return number / EM_PER_CH;
  if (normalized.endsWith('px')) return number / ROOT_FONT_SIZE_PX / EM_PER_CH;

  return null;
}

/** `toCharacters` inverted: a character count written back in `sample`'s unit. */
function fromCharacters(characters, sample) {
  const normalized = sample.toLowerCase().trim();

  if (normalized.endsWith('ch')) return `${formatNumber(characters)}ch`;
  if (normalized.endsWith('rem')) return `${formatNumber(characters * EM_PER_CH)}rem`;
  if (normalized.endsWith('em')) return `${formatNumber(characters * EM_PER_CH)}em`;

  return `${formatNumber(characters * EM_PER_CH * ROOT_FONT_SIZE_PX)}px`;
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
          // Finite and positive, not merely `typeof number`: `NaN` passed the
          // old predicate and then silently disabled the bound it configured,
          // because every comparison against `NaN` is false.
          minWidth: [(v) => Number.isFinite(v) && v > 0],
          maxWidth: [(v) => Number.isFinite(v) && v > 0],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minWidth = options?.minWidth ?? DEFAULT_MIN_WIDTH;
    const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;

    if (minWidth > maxWidth) {
      // A configuration error, not a defect in the stylesheet: reported as an
      // invalid option so it cannot be silenced by a stylelint-disable comment.
      result.warn(
        `Invalid option: minWidth (${minWidth}) must not be greater than maxWidth (${maxWidth}) for rule "${ruleName}"`,
        { stylelintType: 'invalidOption' }
      );
      result.stylelint.stylelintError = true;

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

      const offending = [...declarationContexts(rule)]
        .filter(
          (context) => nodesProbablyForText(rule.nodes) || nodesProbablyForText(context.nodes)
        )
        .map((context) => effectiveDeclaration(context, (prop) => prop === 'max-width'))
        .map((declaration) => ({
          declaration,
          characters: declaration ? toCharacters(declaration.value) : null,
        }))
        .filter(
          ({ characters }) =>
            characters !== null && (characters < minWidth || characters > maxWidth)
        );

      if (offending.length > 0) {
        utils.report({
          message: messages.expected(selector),
          node: rule,
          ruleName,
          result,
          // Clamped to the nearest end of the comfortable range and written
          // back in the author's unit, so a `ch` measure stays in `ch`.
          fix: () => {
            for (const { declaration, characters } of offending) {
              const clamped = Math.min(Math.max(characters, minWidth), maxWidth);

              declaration.value = fromCharacters(clamped, declaration.value);
            }
          },
        });
      }
    });
  };
}
