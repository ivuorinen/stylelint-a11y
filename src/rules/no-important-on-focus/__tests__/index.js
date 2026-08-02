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

// Non-standard syntax rule skipped
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder:focus { outline: none !important; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '{ outline: none !important; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],

  reject: [
    {
      code: 'a:focus { /* c */ outline: none !important; }',
      message: messages.expected('outline', 'a:focus'),
      line: 1,
      description: 'a comment among the declarations does not stop the scan',
    },
  ],
});

// Vendor-prefixed spellings name the same property. See finding audit-ae065bca.
testRule({
  ruleName,
  config: [true],

  reject: [
    {
      code: '.a:focus { -webkit-box-shadow: none !important; }',
      message: messages.expected('-webkit-box-shadow', '.a:focus'),
      description: 'a prefixed box-shadow is still a focus indicator',
    },
  ],
});

// --fix drops the flag; the declaration and every unrelated !important stay.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a:focus { outline: 2px solid red !important; }',
      fixed: '.a:focus { outline: 2px solid red; }',
      message: messages.expected('outline', '.a:focus'),
      description: 'the flag is removed, the outline is kept',
    },
    {
      code: '.a:focus { box-shadow: 0 0 0 2px blue !important; color: red !important; }',
      fixed: '.a:focus { box-shadow: 0 0 0 2px blue; color: red !important; }',
      message: messages.expected('box-shadow', '.a:focus'),
      description: 'an unrelated !important is left alone',
    },
  ],
});
