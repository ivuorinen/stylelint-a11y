import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
    },
    {
      code: '.foo { color: red } @media screen and (prefers-color-scheme: dark) { .foo { color: blue } }',
    },
    {
      code: '.bar { background-color: red } @media screen and (prefers-color-scheme: dark) { .bar { background-color: blue } }',
    },
  ],

  reject: [
    {
      code: 'a { color: red; }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: 'a { color: red; } @media screen and (prefers-color-scheme: dark) { a { background-color: red; } }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { background-color: red;}',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { color: red; } .baz { background-color: red; } @media screen and (prefers-color-scheme: dark) { .baz { color: blue; } }',
      warnings: [
        {
          message: messages.expected('.bar'),
          line: 1,
        },
        {
          message: messages.expected('.baz'),
          line: 1,
        },
      ],
    },
    {
      code: '.foo { background-color: red; } @media screen and (prefers-color-scheme) { .foo { color: red; } }',
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
      code: 'a { color: red; }',
      message:
        'Invalid option value "false" for rule "a11y/media-prefers-color-scheme".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 78 in create-media-query-rule)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { color: red; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// @page atrule with params (line 83-87 in create-media-query-rule)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked',
    },
  ],
});

// Custom selector check (line 27 in create-media-query-rule)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: ':--custom { color: red; }',
      description: 'custom selector is skipped in check function',
    },
  ],
});
