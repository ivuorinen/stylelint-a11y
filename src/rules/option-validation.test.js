import { readFile } from 'node:fs/promises';
import stylelint from 'stylelint';
import plugins from '../index.js';

/**
 * Secondary options are thresholds. A value that is not a usable threshold —
 * `NaN`, a negative length — must fail `validateOptions` rather than be
 * accepted and then silently degrade the rule: every comparison against `NaN`
 * is false, so a `NaN` bound stops firing while the other bound keeps working.
 */
const invalid = [
  ['a11y/no-spread-text', { maxWidth: NaN }, 'maxWidth'],
  ['a11y/no-spread-text', { minWidth: -1 }, 'minWidth'],
  ['a11y/no-spread-text', { maxWidth: Infinity }, 'maxWidth'],
  ['a11y/animation-duration-reasonable', { maxDuration: '-5s' }, 'maxDuration'],
  ['a11y/animation-duration-reasonable', { maxDuration: '0s' }, 'maxDuration'],
  ['a11y/font-size-is-readable', { minSize: '-10px' }, 'minSize'],
  ['a11y/text-spacing-is-readable', { minLetterSpacing: '-1em' }, 'minLetterSpacing'],
  ['a11y/text-spacing-is-readable', { minWordSpacing: '-1em' }, 'minWordSpacing'],
];

const valid = [
  ['a11y/no-spread-text', { minWidth: 40, maxWidth: 90 }],
  ['a11y/animation-duration-reasonable', { maxDuration: '3s' }],
  ['a11y/animation-duration-reasonable', { maxDuration: '500ms' }],
  ['a11y/font-size-is-readable', { minSize: '16px' }],
  ['a11y/text-spacing-is-readable', { minLetterSpacing: '0.2em' }],
];

const lint = (rule, options) =>
  stylelint.lint({
    code: '.a { color: red; }',
    config: { plugins: [plugins], rules: { [rule]: [true, options] } },
  });

describe('secondary option validation', () => {
  it.each(invalid)('%s rejects %p', async (rule, options, key) => {
    const { results } = await lint(rule, options);

    expect(results[0].invalidOptionWarnings).toHaveLength(1);
    expect(results[0].invalidOptionWarnings[0].text).toContain(`option "${key}"`);
  });

  it.each(valid)('%s accepts %p', async (rule, options) => {
    const { results } = await lint(rule, options);

    expect(results[0].invalidOptionWarnings).toHaveLength(0);
  });
});

/**
 * Two digit quantifiers separated only by an optional atom (`\d*\.?\d+`) can
 * trade characters, so the engine has many ways to split one digit run and
 * backtracks polynomially on a long non-matching value. Requiring a digit
 * after the dot (`\d+(?:\.\d+)?|\.\d+`) makes each split unique.
 *
 * This asserts the property directly on the source, so a future rule cannot
 * reintroduce the shape without failing here.
 */
describe('numeric patterns are unambiguous', () => {
  const AMBIGUOUS = /\\d[*+][^/]{0,4}\?\s*\\d[*+]/;

  /** Source with comments stripped — they quote the bad shape to explain it. */
  const code = (source) =>
    source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'));

  it.each(['font-size-is-readable', 'text-spacing-is-readable'])(
    '%s declares no exchangeable digit quantifiers',
    async (rule) => {
      const source = await readFile(new URL(`./${rule}/index.js`, import.meta.url), 'utf8');
      const offenders = code(source)
        .filter((line) => AMBIGUOUS.test(line))
        .map((line) => line.trim());

      expect(offenders).toEqual([]);
    }
  );
});
