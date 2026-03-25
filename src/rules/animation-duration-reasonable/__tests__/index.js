import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { transition: all 0.3s ease; }',
    },
    {
      code: '.foo { animation-duration: 2s; }',
    },
    {
      code: '.foo { transition-duration: 500ms; }',
    },
    {
      code: '.foo { animation-duration: 5s; }',
    },
    {
      code: '.foo { animation: spin 3s linear infinite; }',
    },
    {
      code: '.foo { transition: none; }',
    },
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 10s; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 6000ms; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition: opacity 6s linear; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { animation: spin 10s linear infinite; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { maxDuration: '3s' }],

  accept: [
    {
      code: '.foo { animation-duration: 3s; }',
    },
    {
      code: '.foo { transition-duration: 2s; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 4s; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 3500ms; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});
