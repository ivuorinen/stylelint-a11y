import stylelint from 'stylelint';
import plugins from '../index.js';

/**
 * Properties every `--fix` must hold, asserted for every fixable rule from one
 * place so a new fix cannot be added without meeting them.
 *
 * The per-rule test files pin the exact fixed output. This file asserts the
 * things that are easy to get wrong and easy to miss in a hand-written
 * `fixed:` string:
 *
 * 1. **Convergence** — the fixed stylesheet no longer violates the rule.
 *    A fix that reports again on its own output would loop under
 *    `--fix` in a watcher.
 * 2. **Idempotence** — fixing twice changes nothing the second time.
 * 3. **No collateral damage** — `--fix` leaves already-clean CSS byte-identical,
 *    and leaves declarations the rule does not own untouched.
 * 4. **Parseability** — the output is still valid CSS, not a broken string.
 */

/** Violating CSS per fixable rule, covering each shape that rule's fix handles. */
const VIOLATIONS = {
  'a11y/animation-duration-reasonable': [
    '.a { animation-duration: 10s; }',
    '.a { animation-duration: 8000ms; }',
    '.a { animation: slide 10s ease-in-out 2s infinite; }',
    '.a { transition-duration: 1s, 10s; }',
    '.a { transition: opacity 10s ease, color 1s; }',
    '.a { -webkit-animation-duration: 10s; }',
    '.a { color: red; @media screen { animation: 10s linear; } }',
  ],
  'a11y/font-size-is-readable': [
    '.a { font-size: 10px; }',
    '.a { font-size: 8pt; }',
    '.a { font-size: 0.5rem; }',
    '.a { font: italic bold 12px/30px Georgia, serif; }',
    '.a { color: red; @media screen { font-size: 10px; } }',
  ],
  'a11y/line-height-is-vertical-rhythmed': [
    '.a { line-height: 1; }',
    '.a { line-height: 23px; }',
    '.a { line-height: 0px; }',
    '.a { line-height: 110%; }',
    '.a { line-height: 1.1em; }',
    '.a { color: red; @media screen { line-height: 1; } }',
  ],
  'a11y/media-prefers-reduced-motion': [
    '.a { animation: spin 1s; }',
    '.a { transition: 1s; animation: 2s x; }',
    '.a { animation: 1s x; }\n@media (prefers-reduced-motion: reduce) { b { animation: none; } }\n',
  ],
  'a11y/no-important-on-focus': [
    '.a:focus { outline: 2px solid red !important; }',
    '.a:focus { box-shadow: 0 0 0 2px blue !important; }',
    '.a:focus { -webkit-box-shadow: none !important; }',
  ],
  'a11y/no-outline-none': [
    '.a:focus { outline: none; }',
    '.a:focus { outline: 0; }',
    '.a:focus { outline-style: none; }',
    '.a:focus { outline-width: 0; }',
    '.a:focus { outline: 2px solid; outline-color: transparent; }',
    '.a:focus { color: red; @media screen { outline: none; } }',
  ],
  'a11y/no-spread-text': [
    '.a { color: red; max-width: 20ch; }',
    '.a { color: red; max-width: 120ch; }',
    '.a { color: red; max-width: 100px; }',
    '.a { color: red; max-width: 10rem; }',
    '.a { color: red; max-width: 10em; }',
  ],
  'a11y/no-text-align-justify': [
    '.a { text-align: justify; }',
    '.a { text-align: justify !important; }',
    '.a { color: red; @media screen { text-align: justify; } }',
  ],
  'a11y/selector-pseudo-class-focus': [
    '.a:hover { color: red; }',
    '.a:hover, .b:hover { color: red; }',
  ],
  'a11y/text-spacing-is-readable': [
    '.a { color: red; letter-spacing: 0.01em; }',
    '.a { color: red; word-spacing: 0.01em; }',
    '.a { color: red; letter-spacing: 1px; }',
  ],
};

/** CSS that violates nothing, so `--fix` must leave it byte-identical. */
const CLEAN = [
  '.a { color: red; }',
  '.a:focus { outline: 2px solid red; }',
  '.a:hover, .a:focus { color: red; }',
  '.a { font-size: 16px; line-height: 24px; }',
  '.a { color: red; max-width: 60ch; letter-spacing: 0.2em; }',
  '.a { animation: spin 1s; }\n@media screen and (prefers-reduced-motion: reduce) { .a { animation: none; } }\n',
  '.a { text-align: start; }',
  '@media print { .nav { display: none; } }',
];

const fixableRules = plugins
  .filter((plugin) => plugin.rule.meta.fixable)
  .map((plugin) => plugin.ruleName)
  .sort();

const configFor = (rule) => ({ plugins: [plugins], rules: { [rule]: true } });

const lint = (code, rule, fix = false) => stylelint.lint({ code, config: configFor(rule), fix });

describe('autofix safety', () => {
  it('has a fixture set for every fixable rule', () => {
    expect(Object.keys(VIOLATIONS).sort()).toEqual(fixableRules);
  });

  describe.each(fixableRules)('%s', (rule) => {
    const cases = VIOLATIONS[rule];

    it('reports every fixture before fixing', async () => {
      for (const code of cases) {
        const { results } = await lint(code, rule);

        expect({ code, warnings: results[0].warnings.length > 0 }).toEqual({
          code,
          warnings: true,
        });
      }
    });

    it('converges: the fixed output no longer violates the rule', async () => {
      for (const code of cases) {
        const fixed = (await lint(code, rule, true)).code;
        const { results } = await lint(fixed, rule);

        expect({ code, remaining: results[0].warnings.map((w) => w.text) }).toEqual({
          code,
          remaining: [],
        });
      }
    });

    it('is idempotent: fixing twice changes nothing the second time', async () => {
      for (const code of cases) {
        const once = (await lint(code, rule, true)).code;
        const twice = (await lint(once, rule, true)).code;

        expect({ code, twice }).toEqual({ code, twice: once });
      }
    });

    it('produces parseable CSS', async () => {
      for (const code of cases) {
        const fixed = (await lint(code, rule, true)).code;
        const { results } = await stylelint.lint({
          code: fixed,
          config: { rules: {} },
        });

        expect({ code, errors: results[0].parseErrors }).toEqual({ code, errors: [] });
      }
    });

    it('leaves already-clean CSS byte-identical', async () => {
      for (const code of CLEAN) {
        const fixed = (await lint(code, rule, true)).code;

        expect({ rule, code, fixed }).toEqual({ rule, code, fixed: code });
      }
    });
  });

  describe('every fixable rule at once', () => {
    const allFixable = Object.fromEntries(fixableRules.map((rule) => [rule, true]));
    const config = { plugins: [plugins], rules: allFixable };

    /**
     * Selector-widening and block-inserting fixes interact:
     * `selector-pseudo-class-focus` rewrites `.card:hover` to
     * `.card:hover, .card:focus` *inside* the block
     * `media-prefers-reduced-motion` just inserted. If a broader override is
     * not recognised as covering the rule, the next pass inserts another one
     * and `--fix` grows the file without bound. Each rule alone is idempotent,
     * so only the combination catches it.
     */
    const CROSS_RULE = [
      '.card:hover { animation: slide 12s ease 2s infinite; }',
      '.card:hover, .card:active { animation: spin 9s; font-size: 9px; }',
      '.card:focus { outline: 0 !important; }',
    ];

    it('converges when a selector-widening fix meets a block-inserting fix', async () => {
      for (const code of CROSS_RULE) {
        const once = (await stylelint.lint({ code, config, fix: true })).code;
        const twice = (await stylelint.lint({ code: once, config, fix: true })).code;

        expect({ code, twice }).toEqual({ code, twice: once });
      }
    });

    it('converges and is idempotent with every rule enabled together', async () => {
      const code = [...Object.values(VIOLATIONS).flat(), ...CROSS_RULE].join('\n');
      const once = (await stylelint.lint({ code, config, fix: true })).code;
      const twice = (await stylelint.lint({ code: once, config, fix: true })).code;
      const { results } = await stylelint.lint({ code: once, config });

      expect(twice).toBe(once);
      expect(results[0].warnings.map((w) => w.text)).toEqual([]);
    });

    it('leaves clean CSS untouched with every rule enabled together', async () => {
      const code = CLEAN.join('\n');
      const fixed = (await stylelint.lint({ code, config, fix: true })).code;

      expect(fixed).toBe(code);
    });
  });

  describe('declarations the rule does not own', () => {
    it('no-important-on-focus keeps !important on unrelated properties', async () => {
      const { code } = await lint(
        '.a:focus { outline: 1px solid red !important; color: red !important; }',
        'a11y/no-important-on-focus',
        true
      );

      expect(code).toBe('.a:focus { outline: 1px solid red; color: red !important; }');
    });

    it('animation-duration-reasonable keeps delay, easing and name', async () => {
      const { code } = await lint(
        '.a { animation: slide 10s cubic-bezier(0.1, 0.7, 1, 0.1) 2s 3 reverse; }',
        'a11y/animation-duration-reasonable',
        true
      );

      expect(code).toBe('.a { animation: slide 5s cubic-bezier(0.1, 0.7, 1, 0.1) 2s 3 reverse; }');
    });

    it('font-size-is-readable keeps the rest of the font shorthand', async () => {
      const { code } = await lint(
        '.a { font: italic small-caps bold 12px/1.8 "Helvetica Neue", sans-serif; }',
        'a11y/font-size-is-readable',
        true
      );

      expect(code).toBe(
        '.a { font: italic small-caps bold 15px/1.8 "Helvetica Neue", sans-serif; }'
      );
    });

    it('no-text-align-justify keeps !important', async () => {
      const { code } = await lint(
        '.a { text-align: justify !important; }',
        'a11y/no-text-align-justify',
        true
      );

      expect(code).toBe('.a { text-align: start !important; }');
    });
  });
});
