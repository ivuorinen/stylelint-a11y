import { readFileSync } from 'node:fs';
import plugins from './index.js';
import rules from './rules/index.js';

/** Rules the README marks with `-` and that pass a `fix` callback to report(). */
const FIXABLE = [
  'a11y/animation-duration-reasonable',
  'a11y/font-size-is-readable',
  'a11y/line-height-is-vertical-rhythmed',
  'a11y/media-prefers-reduced-motion',
  'a11y/no-important-on-focus',
  'a11y/no-outline-none',
  'a11y/no-spread-text',
  'a11y/no-text-align-justify',
  'a11y/selector-pseudo-class-focus',
  'a11y/text-spacing-is-readable',
];

describe('plugin registration', () => {
  it('registers one plugin per rule', () => {
    expect(plugins).toHaveLength(Object.keys(rules).length);
  });

  it('namespaces every rule with a11y/', () => {
    for (const plugin of plugins) {
      expect(plugin.ruleName).toMatch(/^a11y\/[a-z-]+$/);
    }
  });

  it('registers exactly the rules in the registry', () => {
    expect(plugins.map((plugin) => plugin.ruleName).sort()).toEqual(
      Object.keys(rules)
        .map((name) => `a11y/${name}`)
        .sort()
    );
  });
});

describe('rule metadata', () => {
  it('gives every rule a documentation url pointing at its README', () => {
    for (const plugin of plugins) {
      const name = plugin.ruleName.replace('a11y/', '');

      expect(plugin.rule.meta.url).toBe(
        `https://github.com/ivuorinen/stylelint-a11y/blob/master/src/rules/${name}/README.md`
      );
    }
  });

  it('marks exactly the fixable rules as fixable', () => {
    const fixable = plugins
      .filter((plugin) => plugin.rule.meta.fixable)
      .map((plugin) => plugin.ruleName)
      .sort();

    expect(fixable).toEqual([...FIXABLE].sort());
  });

  it('declares fixable as a boolean on every rule', () => {
    for (const plugin of plugins) {
      expect(typeof plugin.rule.meta.fixable).toBe('boolean');
    }
  });
});

describe('README fixability column', () => {
  /**
   * `FIXABLE` in `src/index.js` claims to be the single source of truth for
   * both `meta.fixable` and the `-` column in the README. Nothing enforced the
   * README half, so the two could drift silently — this asserts they agree.
   */
  it('marks exactly the fixable rules with `-`', () => {
    const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
    const marked = readme
      .split('\n')
      .filter((line) => line.startsWith('|'))
      .map((line) => line.split('|'))
      .filter((columns) => columns.length >= 5 && /\]\[rule-/.test(columns[3]))
      .filter((columns) => columns[2].includes('-'))
      .map((columns) => `a11y/${/\[([a-z-]+)\]\[rule-/.exec(columns[3])[1]}`)
      .sort();

    expect(marked).toEqual([...FIXABLE].sort());
  });
});
