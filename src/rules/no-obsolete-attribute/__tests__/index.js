import { ruleName, messages } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: pink; }',
    },
    {
      code: 'a[href] { color: pink; }',
      description: 'a conforming attribute on the same element',
    },
    {
      code: 'div[link] { color: pink; }',
      description: 'link is obsolete on body, not on div',
    },
    {
      code: '[data-name] { color: pink; }',
      description: 'a data attribute that merely resembles an obsolete one',
    },
    {
      code: '.body[link] { color: pink; }',
      description: 'a class named like an element does not qualify the attribute',
    },
    {
      code: '#body[link] { color: pink; }',
      description: 'an id named like an element does not qualify the attribute',
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
    {
      code: '.wrapper a[charset] { color: pink; }',
      message: messages.expected('.wrapper a[charset]'),
      line: 1,
      description: 'obsolete attribute on a descendant element',
    },
    {
      code: 'a[charset="utf-8"] { color: pink; }',
      message: messages.expected('a[charset="utf-8"]'),
      line: 1,
      description: 'obsolete attribute matched with a value',
    },
    {
      code: 'a.link[charset]:hover { color: pink; }',
      message: messages.expected('a.link[charset]:hover'),
      line: 1,
      description: 'obsolete attribute alongside a class and pseudo-class',
    },
    {
      code: '[dropzone] { color: pink; }',
      message: messages.expected('[dropzone]'),
      line: 1,
      description: 'tag-independent obsolete attribute',
    },
    {
      code: 'section [dropzone] { color: pink; }',
      message: messages.expected('section [dropzone]'),
      line: 1,
      description: 'tag-independent obsolete attribute as a descendant',
    },
    {
      code: 'BODY[LINK] { color: pink; }',
      message: messages.expected('BODY[LINK]'),
      line: 1,
      description: 'tag and attribute are matched case-insensitively',
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

// Non-standard syntax rule skipped
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

// At-rules are not walked by this rule
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: 'an at-rule is not walked by this rule',
    },
  ],
});

// Rules nested in a media query are reached like any other rule
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { a { color: pink; } }',
      description: 'a rule nested in a media query is still checked',
    },
  ],
});
