import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
    },
    {
      code: '.foo { color: #666; } @media (prefers-contrast: more) { .foo { color: #000; } }',
    },
    {
      code: '.bar { background-color: red } @media screen and (prefers-contrast: more) { .bar { background-color: blue } }',
    },
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: 'a { color: red; }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { background-color: red;}',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { color: #666; } @media (prefers-contrast: more) { .foo { background-color: #fff; } }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

// Same three shapes as media-prefers-color-scheme: both rules share
// utils/create-media-query-rule.js.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: black; @media (prefers-contrast: more) { color: white; } }',
      description: 'a counterpart nested in the rule itself covers the property',
    },
    {
      code: '.a,.b { color: black; } @media (prefers-contrast: more) { .a, .b { color: white; } }',
      description: 'selector lists match regardless of comma spacing',
    },
  ],

  reject: [
    {
      code: '@media (prefers-contrast: more) { a { color: white; } } a { color: black; }',
      message: messages.expected('a'),
      description: 'an override placed before the rule loses the cascade and is not accepted',
    },
  ],
});
