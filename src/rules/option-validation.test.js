import { readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { parse } from '@babel/parser';
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
 * backtracks polynomially on a long non-matching value. Spelling the number as
 * flat alternatives (`\d+\.\d+|\d+|\.\d+`) makes each split unique.
 *
 * Asserted against the real regex literals in every rule and utility, so a new
 * one cannot reintroduce the shape.
 */
describe('numeric patterns are unambiguous', () => {
  const AMBIGUOUS = /\\d[*+][^|)]{0,4}\?\s*\\d[*+]/;

  /**
   * Every regex literal in a module, read from the parsed AST.
   *
   * Parsed rather than pattern-matched over the text: comments are not AST
   * nodes, so an explanatory comment quoting the bad shape — as the two rules
   * below do deliberately — cannot register as a violation. Stripping comments
   * textually missed trailing `// ...` ones.
   */
  const regexLiterals = (source) => {
    const found = [];
    const visit = (node) => {
      if (Array.isArray(node)) return node.forEach(visit);
      if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
      if (node.type === 'RegExpLiteral') found.push(node.pattern);

      for (const [key, value] of Object.entries(node)) {
        if (key !== 'loc' && !key.endsWith('Comments')) visit(value);
      }
    };

    visit(parse(source, { sourceType: 'module' }).program);

    return found;
  };

  const src = new URL('..', import.meta.url);
  const jsFiles = (dir) =>
    readdirSync(new URL(dir, src)).filter(
      (name) => name.endsWith('.js') && !name.endsWith('.test.js')
    );
  const sources = [
    ...jsFiles('utils/').map((name) => `utils/${name}`),
    ...readdirSync(new URL('rules/', src), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) =>
        jsFiles(`rules/${entry.name}/`).map((name) => `rules/${entry.name}/${name}`)
      ),
  ];

  it('finds the rule and utility sources to scan', () => {
    expect(sources.length).toBeGreaterThan(15);
  });

  it.each(sources)('%s declares no exchangeable digit quantifiers', async (relative) => {
    const source = await readFile(new URL(`../${relative}`, import.meta.url), 'utf8');
    const offenders = regexLiterals(source).filter((pattern) => AMBIGUOUS.test(`/${pattern}/`));

    expect(offenders).toEqual([]);
  });
});
