import { textStyles, nodesProbablyForText } from '../text-helpers.js';

describe('textStyles', () => {
  it('contains expected text-related properties', () => {
    expect(textStyles).toContain('color');
    expect(textStyles).toContain('letter-spacing');
    expect(textStyles).toContain('text-align');
    expect(textStyles).toContain('line-height');
  });

  it('does not contain non-text properties', () => {
    expect(textStyles).not.toContain('display');
    expect(textStyles).not.toContain('margin');
    expect(textStyles).not.toContain('padding');
  });
});

describe('nodesProbablyForText', () => {
  it('returns true when nodes contain a text-related property', () => {
    const nodes = [{ prop: 'color' }, { prop: 'display' }];
    expect(nodesProbablyForText(nodes)).toBe(true);
  });

  it('returns false when no nodes have text-related properties', () => {
    const nodes = [{ prop: 'display' }, { prop: 'margin' }];
    expect(nodesProbablyForText(nodes)).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(nodesProbablyForText([])).toBe(false);
  });

  it('handles case-insensitive matching', () => {
    const nodes = [{ prop: 'Color' }];
    expect(nodesProbablyForText(nodes)).toBe(true);
  });

  it('handles uppercase properties', () => {
    const nodes = [{ prop: 'TEXT-ALIGN' }];
    expect(nodesProbablyForText(nodes)).toBe(true);
  });

  it('filters out nodes without prop', () => {
    const nodes = [{ type: 'comment' }, { prop: 'letter-spacing' }];
    expect(nodesProbablyForText(nodes)).toBe(true);
  });

  it('returns false when all nodes lack prop', () => {
    const nodes = [{ type: 'comment' }, { type: 'atrule' }];
    expect(nodesProbablyForText(nodes)).toBe(false);
  });

  it('handles nodes with undefined prop', () => {
    const nodes = [{ prop: undefined }, { prop: null }, { prop: 'word-spacing' }];
    expect(nodesProbablyForText(nodes)).toBe(true);
  });
});
