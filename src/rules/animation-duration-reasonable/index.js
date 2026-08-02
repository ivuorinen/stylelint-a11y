import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { declarationContexts, effectiveDeclaration, unprefixed } from '../../utils/declarations.js';
import { formatNumber } from '../../utils/lengths.js';

export const ruleName = 'a11y/animation-duration-reasonable';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector, threshold) => `Unexpected duration greater than ${threshold} in ${selector}`,
});

const DEFAULT_MAX_DURATION_S = 5;
const DEFAULT_MAX_DURATION = `${DEFAULT_MAX_DURATION_S}s`;

const ignoredValues = ['none', 'inherit', 'initial', 'unset'];

/** Parses a CSS duration string (e.g. '500ms', '2s') to seconds. */
function parseDurationToSeconds(value) {
  if (value.endsWith('ms')) {
    return parseFloat(value) / 1000;
  }
  if (value.endsWith('s')) {
    return parseFloat(value);
  }
  return NaN;
}

/** Matches a bare time token: the duration inside a shorthand. */
const TIME_TOKEN = /^[\d.]+m?s$/;

/** Extracts the first time value from a shorthand animation/transition value. */
function extractDurationFromShorthand(value) {
  const parts = value.split(/\s+/);
  for (const part of parts) {
    if (TIME_TOKEN.test(part)) {
      return parseDurationToSeconds(part);
    }
  }
  return NaN;
}

/** A duration in seconds written in `sample`'s unit, so `500ms` stays in `ms`. */
const durationLike = (seconds, sample) =>
  sample.trim().toLowerCase().endsWith('ms')
    ? `${formatNumber(seconds * 1000)}ms`
    : `${formatNumber(seconds)}s`;

/**
 * `segment` with its duration clamped to `maxSeconds`, or unchanged when it is
 * already within budget.
 *
 * Only the duration token is rewritten: timing function, delay, iteration
 * count and name are left exactly as written. In a shorthand the *first* time
 * token is the duration and any second one is the delay, so only the first is
 * touched.
 *
 * Rewriting token-wise rather than rebuilding the segment keeps the author's
 * whitespace, so `1s, 10s` stays `1s, 5s` rather than collapsing to `1s,5s`.
 */
function clampSegment(segment, isShorthand, maxSeconds) {
  let done = false;

  return segment.replace(/\S+/g, (token) => {
    if (done || (isShorthand && !TIME_TOKEN.test(token))) return token;

    done = true;

    return parseDurationToSeconds(token) > maxSeconds ? durationLike(maxSeconds, token) : token;
  });
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
          // Positive, not merely parseable: a negative threshold makes every
          // duration exceed it and reports every animated rule.
          maxDuration: [(v) => typeof v === 'string' && parseDurationToSeconds(v) > 0],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const maxDurationS = options?.maxDuration
      ? parseDurationToSeconds(options.maxDuration)
      : DEFAULT_MAX_DURATION_S;

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule)) {
        return;
      }
      const selector = rule.selector;

      if (!selector) {
        return;
      }

      // One declaration per family: `animation` and `animation-duration` set
      // the same thing, so only the last of them applies. Transitions are
      // tracked separately because they are an independent property family.
      const inFamily = (family) => (prop) => {
        const name = unprefixed(prop);

        return name === family || name === `${family}-duration`;
      };

      const tooSlow = [...declarationContexts(rule)]
        .flatMap((context) => [
          effectiveDeclaration(context, inFamily('animation')),
          effectiveDeclaration(context, inFamily('transition')),
        ])
        .filter(Boolean)
        .filter((decl) => {
          const prop = unprefixed(decl.prop.toLowerCase());
          const value = decl.value.toLowerCase();

          if (ignoredValues.includes(value)) return false;

          // Only a shorthand or its `-duration` longhand reaches here, so the
          // property alone says which parser to use.
          const readDuration =
            prop === 'animation' || prop === 'transition'
              ? extractDurationFromShorthand
              : parseDurationToSeconds;

          // A comma-separated list declares one duration per animation; any one
          // of them over the threshold is a violation.
          return value
            .split(',')
            .map((segment) => readDuration(segment.trim()))
            .some((duration) => !isNaN(duration) && duration > maxDurationS);
        });

      if (tooSlow.length > 0) {
        utils.report({
          message: messages.expected(selector, options?.maxDuration || DEFAULT_MAX_DURATION),
          node: rule,
          ruleName,
          result,
          // Each over-budget duration is clamped to the threshold in its own
          // unit; every other part of the value survives untouched.
          fix: () => {
            for (const decl of tooSlow) {
              const prop = unprefixed(decl.prop.toLowerCase());
              const isShorthand = prop === 'animation' || prop === 'transition';

              decl.value = decl.value
                .split(',')
                .map((segment) => clampSegment(segment, isShorthand, maxDurationS))
                .join(',');
            }
          },
        });
      }
    });
  };
}
