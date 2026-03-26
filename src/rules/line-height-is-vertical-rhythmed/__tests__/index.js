import { messages, ruleName } from '../index.js';

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
