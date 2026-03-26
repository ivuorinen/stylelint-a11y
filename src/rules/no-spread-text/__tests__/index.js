import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { }',
    },
    {
      code: '.foo { display: flex; max-width: 82ch; }',
    },
    {
      code: '.foo { height: 100%; max-width: 82ch; }',
    },
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
    },
    {
      code: '.bar { word-spacing: -5px; max-width: 100px; }',
    },
    {
      code: '.baz { MAX-WIDTH: 63CH; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 40ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { LINE-HEIGHT: 1.8; MAX-WIDTH: 81CH; }',
      message: messages.expected('.bar'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minWidth: 50, maxWidth: 70 }],

  accept: [
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 45ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { text-transform: lowercase; max-width: 75ch; }',
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
      code: '.foo { text-transform: lowercase; max-width: 10ch; }',
      message:
        'Invalid option value "false" for rule "a11y/no-spread-text".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 50)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { text-transform: lowercase; max-width: 10ch; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// minWidth > maxWidth guard (lines 39-45)
testRule({
  ruleName,
  config: [true, { minWidth: 80, maxWidth: 45 }],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
      description: 'rejects when minWidth > maxWidth',
      message:
        'Invalid options: minWidth (80) must not be greater than maxWidth (45) (a11y/no-spread-text)',
    },
  ],
});
