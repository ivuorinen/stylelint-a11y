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
