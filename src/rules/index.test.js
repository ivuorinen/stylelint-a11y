import rules from './index.js';

describe('rules registry', () => {
  it('exports all 16 rules', () => {
    expect(Object.keys(rules)).toHaveLength(16);
  });

  it('exports functions for each rule', () => {
    for (const [, rule] of Object.entries(rules)) {
      expect(typeof rule).toBe('function');
    }
  });
});
