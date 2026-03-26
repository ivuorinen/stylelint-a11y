import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { text-align: center; }',
    },
    {
      code: '.foo { text-align: left; }',
    },
    {
      code: '.foo { text-align: right; }',
    },
    {
      code: '.foo { text-align: start; }',
    },
    {
      code: '.foo { text-align: end; }',
    },
    {
      code: '.foo { TEXT-ALIGN: CENTER; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-align: justify; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { TEXT-ALIGN: JUSTIFY; }',
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
      code: '.foo { text-align: justify; }',
      message:
        'Invalid option value "false" for rule "a11y/no-text-align-justify".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 37)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { text-align: justify; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 41)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (no text-align issue)',
    },
  ],
});

// Non-rule node type returns true from check (line 13)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo { text-align: center; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});
