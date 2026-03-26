import { ruleName, messages } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { color: pink; }',
    },
  ],

  reject: [
    {
      code: 'blink { color: pink; }',
      message: messages.expected('blink'),
      line: 1,
    },
    {
      code: 'applet, a { color: pink; }',
      message: messages.expected('applet, a'),
      line: 1,
    },
    {
      code: 'applet, blink { color: pink; }',
      message: messages.expected('applet, blink'),
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
      code: 'blink { color: pink; }',
      message:
        'Invalid option value "false" for rule "a11y/no-obsolete-element".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 34)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { color: pink; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 38)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (not an obsolete element)',
    },
  ],
});

// Non-rule node type returns true from check (line 14)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo { color: pink; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});
