import stylelint from 'stylelint';
const { createPlugin } = stylelint;
import rules from './rules/index.js';

/** Registers all a11y rules as stylelint plugins. */
const rulesPlugins = Object.keys(rules).map((ruleName) => {
  return createPlugin(`a11y/${ruleName}`, rules[ruleName]);
});

export default rulesPlugins;
