import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a:focus { outline: 3px solid blue; }',
    },
    {
      code: 'a:focus { color: red !important; }',
    },
    {
      code: '.foo { outline: none !important; }',
    },
    {
      code: 'a:focus-visible { outline: 3px solid blue; }',
    },
    {
      code: 'a:focus { border: 1px solid red; box-shadow: 0 0 3px blue; }',
    },
  ],

  reject: [
    {
      code: 'a:focus { outline: 3px solid blue !important; }',
      message: messages.expected('outline', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus-visible { box-shadow: 0 0 3px blue !important; }',
      message: messages.expected('box-shadow', 'a:focus-visible'),
      line: 1,
    },
    {
      code: 'a:focus { border: 1px solid red !important; }',
      message: messages.expected('border', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus { outline-color: blue !important; }',
      message: messages.expected('outline-color', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus { border-inline-color: blue !important; }',
      message: messages.expected('border-inline-color', 'a:focus'),
      line: 1,
    },
    {
      code: 'a:focus { border-block-start-width: 2px !important; }',
      message: messages.expected('border-block-start-width', 'a:focus'),
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
      code: 'a:focus { outline: none !important; }',
      message:
        'Invalid option value "false" for rule "a11y/no-important-on-focus".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 29)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder:focus { outline: none !important; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});
