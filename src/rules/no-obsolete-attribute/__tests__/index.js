import { ruleName, messages } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: pink; }',
    },
  ],

  reject: [
    {
      code: 'body[link] { color: pink; }',
      message: messages.expected('body[link]'),
      line: 1,
    },
    {
      code: 'a, img[datasrc] { color: pink; }',
      message: messages.expected('a, img[datasrc]'),
      line: 1,
    },
    {
      code: 'img[align], a[name] { color: pink; }',
      message: messages.expected('img[align], a[name]'),
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
      code: 'body[link] { color: pink; }',
      message:
        'Invalid option value "false" for rule "a11y/no-obsolete-attribute".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax rule skipped (line 35)
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

// @page atrule with params (line 39)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked (not an obsolete attribute)',
    },
  ],
});

// Non-rule node type returns true from check (line 14)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { a { color: pink; } }',
      description: 'non-rule node type returns true from check',
    },
  ],
});
