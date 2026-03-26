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
      code: '.foo { line-height: 12px; }',
      message: messages.expected('.foo'),
      line: 1,
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

// Non-standard syntax rule skipped (line 63)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { line-height: 1px; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 67)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (no line-height issue)',
    },
  ],
});

// Non-rule node type (line 40) - check returns true for atrule nodes
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo { line-height: 24px; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});

// Invalid options (line 31)
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
