import { messages, ruleName } from '../index.js';

// Percentages and em are ratios relative to the element's own font size, so
// they are held to the same minUnitless threshold as a bare number.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { line-height: 160%; }',
      description: '160% equals 1.6, above the 1.5 default',
    },
    {
      code: '.a { line-height: 150%; }',
      description: '150% equals exactly the 1.5 default',
    },
    {
      code: '.a { line-height: 1.6em; }',
      description: '1.6em is above the 1.5 default',
    },
    {
      code: '.a { line-height: 1rem; }',
      description: 'rem resolves against the root font size and is not a ratio',
    },
    {
      code: '.a { line-height: normal; }',
      description: 'keyword values are not judged',
    },
    {
      code: '.a { line-height: calc(1rem + 2px); }',
      description: 'calc() cannot be resolved statically',
    },
  ],

  reject: [
    {
      code: '.a { line-height: 110%; }',
      message: messages.expected('.a'),
      line: 1,
      description: '110% equals 1.1, below the 1.5 default',
    },
    {
      code: '.a { line-height: 1.1em; }',
      message: messages.expected('.a'),
      line: 1,
      description: '1.1em is below the 1.5 default',
    },
    {
      code: '.a { LINE-HEIGHT: 100%; }',
      message: messages.expected('.a'),
      line: 1,
      description: 'property name is matched case-insensitively',
    },
  ],
});

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
    },
    {
      code: '.smallText { line-height: 24px; }',
    },
    {
      code: '.largeText { line-height: 48px; }',
    },
    {
      code: '.relText { line-height: 1.5; }',
    },
    {
      code: '.smallTextU { LINE-HEIGHT: 24PX; }',
    },
    {
      code: 'body { font-size: 15px; line-height: 48px; }',
    },
    {
      code: 'a { font-size: 15px; line-height: 1.6; }',
    },
  ],

  reject: [
    {
      code: '.foo { line-height: 12px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { line-height: 50px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { line-height: 1.2; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '@media screen { .bar { line-height: 7px; } }',
      message: messages.expected('.bar'),
      line: 1,
      description: 'rejects invalid line-height inside media queries',
    },
    {
      code: '.foo { LINE-HEIGHT: 23PX; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: 'p { font-size: 23px; line-height: 23px; }',
      message: messages.expected('p'),
      line: 1,
    },
    {
      code: 'a { font-size: 23px; line-height: 1; }',
      message: messages.expected('a'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minUnitless: 1.8, gridPx: 12 }],

  accept: [
    {
      code: '.foo { line-height: 1.8; }',
    },
    {
      code: '.foo { line-height: 24px; }',
    },
    {
      code: '.foo { line-height: 12px; }',
    },
  ],

  reject: [
    {
      code: '.foo { line-height: 1.5; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { line-height: 7px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

// config: [false] triggers the !actual guard
testRule({
  ruleName,
  config: [false],

  reject: [
    {
      code: '.foo { line-height: 1px; }',
      message:
        'Invalid option value "false" for rule "a11y/line-height-is-vertical-rhythmed".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax selectors are skipped
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { line-height: 1px; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '@media screen { .foo { line-height: 24px; } }',
      description: 'rules inside media queries are still checked',
    },
    {
      code: '{ line-height: 1; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],
});

// Invalid options
testRule({
  ruleName,
  config: [true, { minUnitless: -1 }],

  reject: [
    {
      code: '.foo { line-height: 1px; }',
      description: 'rejects invalid option (negative minUnitless)',
      message:
        'Invalid value "-1" for option "minUnitless" of rule "a11y/line-height-is-vertical-rhythmed"',
    },
  ],
});

// Zero divides evenly into every grid. See finding audit-eeb8ff32.
testRule({
  ruleName,
  config: [true],

  reject: [
    {
      code: '.a { line-height: 0px; }',
      message: messages.expected('.a'),
      description: 'a zero px line-height collapses every line onto one baseline',
    },
  ],
});

// A px length the rule cannot read statically is skipped, not guessed at.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { line-height: $base-px; }',
      description: 'an unresolvable px-suffixed value is skipped',
    },
  ],
});

// Last declaration wins. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { line-height: 1; line-height: 1.6; }',
      description: 'an overridden tight line-height does not apply',
    },
  ],

  reject: [
    {
      code: '.a { line-height: 1.6; line-height: 1; }',
      message: messages.expected('.a'),
      description: 'the last declaration is the one judged',
    },
  ],
});

// A nested at-rule is its own declaration context, so the nested spelling of a
// violation is checked like the flat one. See finding audit-4037f66d.
testRule({
  ruleName,
  config: [true],

  reject: [
    {
      code: '.a { color: red; @media screen { line-height: 1; } }',
      message: messages.expected('.a'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// --fix snaps px up to the next grid multiple and raises ratios to the minimum.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { line-height: 23px; }',
      fixed: '.a { line-height: 24px; }',
      message: messages.expected('.a'),
      description: 'px snaps up to the grid, never down',
    },
    {
      code: '.a { line-height: 0px; }',
      fixed: '.a { line-height: 24px; }',
      message: messages.expected('.a'),
      description: 'a collapsed line-height becomes one grid step',
    },
    {
      code: '.a { line-height: 1; }',
      fixed: '.a { line-height: 1.5; }',
      message: messages.expected('.a'),
      description: 'a unitless ratio is raised to the minimum',
    },
    {
      code: '.a { line-height: 110%; }',
      fixed: '.a { line-height: 150%; }',
      message: messages.expected('.a'),
      description: 'a percentage stays a percentage',
    },
    {
      code: '.a { line-height: 1.1em; }',
      fixed: '.a { line-height: 1.5em; }',
      message: messages.expected('.a'),
      description: 'em stays em',
    },
  ],
});
