import rules from './index.js';

describe('rules registry', () => {
  it('exports all expected rules', () => {
    expect(Object.keys(rules).sort()).toEqual(
      [
        'animation-duration-reasonable',
        'content-property-no-static-value',
        'font-size-is-readable',
        'line-height-is-vertical-rhythmed',
        'media-prefers-color-scheme',
        'media-prefers-contrast',
        'media-prefers-reduced-motion',
        'no-display-none',
        'no-important-on-focus',
        'no-obsolete-attribute',
        'no-obsolete-element',
        'no-outline-none',
        'no-spread-text',
        'no-text-align-justify',
        'selector-pseudo-class-focus',
        'text-spacing-is-readable',
      ].sort()
    );
  });

  it('exports functions for each rule', () => {
    for (const [, rule] of Object.entries(rules)) {
      expect(typeof rule).toBe('function');
    }
  });
});
