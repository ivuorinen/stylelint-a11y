import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
    {
      code: '.bar { display: flex; }',
    },
    {
      code: '.foo { color: red; letter-spacing: normal; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 2px; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.05em; }',
      fixed: '.foo { color: red; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.foo'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.1em; }',
      fixed: '.foo { color: red; word-spacing: 0.16em; }',
      message: messages.expectedWordSpacing('.foo'),
      line: 1,
    },
    {
      code: '.bar { line-height: 1.5; letter-spacing: 0em; }',
      fixed: '.bar { line-height: 1.5; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.bar'),
      line: 1,
    },
  ],
});
