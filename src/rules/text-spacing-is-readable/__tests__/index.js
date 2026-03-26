import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
    {
      code: '.bar { display: flex; }',
    },
    {
      code: '.foo { color: red; letter-spacing: normal; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 2px; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.05em; }',
      fixed: '.foo { color: red; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.foo', '0.12em'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.1em; }',
      fixed: '.foo { color: red; word-spacing: 0.16em; }',
      message: messages.expectedWordSpacing('.foo', '0.16em'),
      line: 1,
    },
    {
      code: '.bar { line-height: 1.5; letter-spacing: 0em; }',
      fixed: '.bar { line-height: 1.5; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.bar', '0.12em'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minLetterSpacing: '0.15em', minWordSpacing: '0.2em' }],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
      fixed: '.foo { color: red; letter-spacing: 0.15em; }',
      message: messages.expectedLetterSpacing('.foo', '0.15em'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
      fixed: '.foo { color: red; word-spacing: 0.2em; }',
      message: messages.expectedWordSpacing('.foo', '0.2em'),
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
      code: '.foo { color: red; letter-spacing: 0.01em; }',
      message:
        'Invalid option value "false" for rule "a11y/text-spacing-is-readable".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 56)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { color: red; letter-spacing: 0.01em; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// Zero word-spacing triggers rejection (line 61 - empty selector guard)
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.foo { color: red; word-spacing: 0; }',
      fixed: '.foo { color: red; word-spacing: 0.16em; }',
      message: messages.expectedWordSpacing('.foo', '0.16em'),
      line: 1,
    },
  ],
});
