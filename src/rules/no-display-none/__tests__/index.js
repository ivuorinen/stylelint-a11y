import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: '.foo { display: none; }',
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
      code: '.foo { display: none; }',
      message:
        'Invalid option value "false" for rule "a11y/no-display-none".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 35)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { display: none; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 39)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (no display: none)',
    },
  ],
});

// Non-rule node type returns true from check (line 13)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo { display: flex; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});
