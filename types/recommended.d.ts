import type { Config } from 'stylelint';

/**
 * The shareable config: registers this plugin and turns on the rules marked
 * `x` in the README.
 *
 * @example
 * // .stylelintrc.json
 * { "extends": "@ivuorinen/stylelint-a11y/recommended" }
 *
 * @example
 * import recommended from '@ivuorinen/stylelint-a11y/recommended';
 * export default { ...recommended, rules: { ...recommended.rules } };
 */
declare const recommended: Config;

export default recommended;
