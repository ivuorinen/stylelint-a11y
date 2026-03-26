import stylelint from 'stylelint';
const { utils } = stylelint;
import createMediaQueryRule from '../../utils/create-media-query-rule.js';

export const ruleName = 'a11y/media-prefers-contrast';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected ${selector} is used with @media (prefers-contrast)`,
});

export default createMediaQueryRule({
  mediaFeature: 'prefers-contrast',
  targetProperties: ['background-color', 'color'],
  ruleName,
  messages,
});
