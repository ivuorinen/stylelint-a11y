import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { outline: 0; }',
    },
    {
      code: '$primary-color: #333; .bar:focus { outline: 1px solid $primary-color; }',
    },
    {
      code: '.baz:focus { outline: none; border-color: #333; }',
    },
    {
      code: '.quux:focus { outline: 0; border: 1px solid #000; }',
    },
    {
      code: '.quuux:focus { outline: none; box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }',
    },
  ],

  reject: [
    {
      code: '.foo1:focus { outline: none; } .foo2:focus { outline: 1px solid red; }',
      message: messages.expected('.foo1:focus'),
      line: 1,
    },
    {
      code: '.bar:focus { outline: none; }',
      message: messages.expected('.bar:focus'),
      line: 1,
    },
    {
      code: '.baz:focus { outline: none; border: transparent; }',
      message: messages.expected('.baz:focus'),
      line: 1,
    },
    {
      code: '.quux { .quuux:focus { outline: 0; } }',
      message: messages.expected('.quuux:focus'),
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
      code: '.foo:focus { outline: none; }',
      message:
        'Invalid option value "false" for rule "a11y/no-outline-none".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 52)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { outline: none; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 56)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (no outline issue)',
    },
  ],
});

// Non-rule node type returns true from check (line 13)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo:focus { outline: 1px solid red; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});
