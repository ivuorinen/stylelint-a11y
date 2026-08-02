import stylelint from 'stylelint';
const { createPlugin } = stylelint;
import rules from './rules/index.js';

const DOCS_BASE = 'https://github.com/ivuorinen/stylelint-a11y/blob/master/src/rules';

/**
 * Rules that pass a `fix` callback to `utils.report()`. stylelint throws if a
 * rule passes `fix` without `meta.fixable`, so this set is the single source of
 * truth for both the metadata and the `-` column in the README.
 */
const FIXABLE = new Set([
  'animation-duration-reasonable',
  'font-size-is-readable',
  'line-height-is-vertical-rhythmed',
  'media-prefers-reduced-motion',
  'no-important-on-focus',
  'no-outline-none',
  'no-spread-text',
  'no-text-align-justify',
  'selector-pseudo-class-focus',
  'text-spacing-is-readable',
]);

/** Registers all a11y rules as stylelint plugins. */
const rulesPlugins = Object.keys(rules).map((ruleName) => {
  const rule = rules[ruleName];

  rule.meta = {
    url: `${DOCS_BASE}/${ruleName}/README.md`,
    fixable: FIXABLE.has(ruleName),
  };

  return createPlugin(`a11y/${ruleName}`, rule);
});

export default rulesPlugins;
