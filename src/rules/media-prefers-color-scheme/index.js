import stylelint from 'stylelint';
const { utils } = stylelint;
import createMediaQueryRule from '../../utils/create-media-query-rule.js';

export const ruleName = 'a11y/media-prefers-color-scheme';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-color-scheme)`,
});

export default createMediaQueryRule({
  mediaFeature: 'prefers-color-scheme',
  targetProperties: ['background-color', 'color'],
  ruleName,
  messages,
});
