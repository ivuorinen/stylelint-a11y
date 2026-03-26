import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: 'a { }',
    },
    {
      code: 'a:focus { }',
    },
    {
      code: 'a:hover, a:focus { }',
    },
    {
      code: 'a:hover { } a:focus { }',
    },
    {
      code: 'a:focus { outline: thin dotted; } a:active, a:hover { outline: 0; }',
    },
  ],

  reject: [
    {
      code: 'a:hover { }',
      fixed: 'a:hover, a:focus { }',
      message: messages.expected('a:hover'),
    },
    {
      code: 'a:hover { } b:hover { }',
      fixed: 'a:hover, a:focus { } b:hover, b:focus { }',
      warnings: [
        { message: messages.expected('a:hover'), line: 1 },
        { message: messages.expected('b:hover'), line: 1 },
      ],
    },
    {
      code: 'a:hover { } a:focus { } b:hover { } b { }',
      fixed: 'a:hover { } a:focus { } b:hover, b:focus { } b { }',
      message: messages.expected('b:hover'),
    },
    {
      code: 'a:hover, a:focus { } b:hover { } b { }',
      fixed: 'a:hover, a:focus { } b:hover, b:focus { } b { }',
      message: messages.expected('b:hover'),
    },
  ],
});

// config: [false] triggers the !actual guard
testRule({
  ruleName,
  config: [false],

  reject: [
    {
      code: 'a:hover { }',
      message:
        'Invalid option value "false" for rule "a11y/selector-pseudo-class-focus".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 45)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder:hover { color: red; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});
