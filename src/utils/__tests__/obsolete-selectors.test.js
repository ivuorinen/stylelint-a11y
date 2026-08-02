import { hasObsoleteSelector } from '../obsolete-selectors.js';

const elements = new Set(['font', 'marquee', 'blink']);
const attributes = new Set(['a[charset]', 'body[link]', '[dropzone]']);

describe('hasObsoleteSelector', () => {
  describe('tags', () => {
    it.each([
      ['font', true],
      ['FONT', true],
      ['font.legacy', true],
      ['.wrapper font', true],
      ['nav > marquee:hover', true],
      ['a, blink', true],
      ['.font', false],
      ['#font', false],
      ['[data-el="font"]', false],
      ['a', false],
      ['menu', false],
    ])('%s -> %s', (selector, expected) => {
      expect(hasObsoleteSelector(selector, elements)).toBe(expected);
    });
  });

  describe('attributes', () => {
    it.each([
      ['a[charset]', true],
      ['a[charset="utf-8"]', true],
      ['A[CHARSET]', true],
      ['.wrapper a[charset]', true],
      ['a.link[charset]:hover', true],
      ['[dropzone]', true],
      ['section [dropzone]', true],
      ['div[charset]', false],
      ['a[href]', false],
      ['[data-name]', false],
      ['a', false],
      // A tag-qualified entry must be qualified by an actual tag. A class or id
      // that merely shares the element's name does not target that element.
      ['.body[link]', false],
      ['#body[link]', false],
    ])('%s -> %s', (selector, expected) => {
      expect(hasObsoleteSelector(selector, attributes)).toBe(expected);
    });
  });

  it('returns false for a selector the parser cannot read', () => {
    expect(hasObsoleteSelector('a[', elements)).toBe(false);
  });

  it('returns false for an empty obsolete set', () => {
    expect(hasObsoleteSelector('font', new Set())).toBe(false);
  });
});
