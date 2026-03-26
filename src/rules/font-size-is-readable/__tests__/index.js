import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { }',
    },
    {
      code: '.foo { font-size: 15px; }',
    },
    {
      code: '.foo { font-size: 12pt; }',
    },
    {
      code: '.bar { FONT-SIZE: 15PX; }',
    },
    {
      code: '.baz { font-size: 1em; }',
    },
    {
      code: '.foo { font-size: 1rem; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 10px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { font-size: 3pt; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { FONT-SIZE: 8PX; }',
      message: messages.expected('.bar'),
      line: 1,
    },
    {
      code: '.foo { font-size: 0.5rem; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '15em' }],

  reject: [
    {
      code: '.foo { font-size: 8px; }',
      description: 'rejects invalid option (em unit not allowed)',
      message: 'Invalid value "15em" for option "minSize" of rule "a11y/font-size-is-readable"',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: 'abc' }],

  reject: [
    {
      code: '.foo { font-size: 8px; }',
      description: 'rejects invalid option (non-numeric)',
      message: 'Invalid value "abc" for option "minSize" of rule "a11y/font-size-is-readable"',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '1rem' }],

  accept: [
    {
      code: '.foo { font-size: 1rem; }',
    },
    {
      code: '.foo { font-size: 16px; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 0.5rem; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { font-size: 12px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '16px' }],

  accept: [
    {
      code: '.foo { font-size: 16px; }',
    },
    {
      code: '.foo { font-size: 20px; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 15px; }',
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
      code: '.foo { font-size: 1px; }',
      message:
        'Invalid option value "false" for rule "a11y/font-size-is-readable".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 72)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { font-size: 1px; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// pt threshold parsing (line 25)
testRule({
  ruleName,
  config: [true, { minSize: '12pt' }],

  accept: [
    {
      code: '.foo { font-size: 12pt; }',
      description: 'pt threshold: at threshold',
    },
    {
      code: '.foo { font-size: 16px; }',
      description: 'pt threshold: above threshold in px',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 10pt; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
