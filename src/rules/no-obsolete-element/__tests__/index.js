import { ruleName, messages } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { color: pink; }',
    },
    {
      code: 'menu { color: pink; }',
      description: 'menu is a conforming element in the current HTML spec',
    },
    {
      code: 'hgroup { color: pink; }',
      description: 'hgroup is a conforming element in the current HTML spec',
    },
    {
      code: '.blink { color: pink; }',
      description: 'a class that merely shares a name with an obsolete element',
    },
    {
      code: '[data-el="blink"] { color: pink; }',
      description: 'an attribute value that merely mentions an obsolete element',
    },
  ],

  reject: [
    {
      code: 'blink { color: pink; }',
      message: messages.expected('blink'),
      line: 1,
    },
    {
      code: 'applet, a { color: pink; }',
      message: messages.expected('applet, a'),
      line: 1,
    },
    {
      code: 'applet, blink { color: pink; }',
      message: messages.expected('applet, blink'),
      line: 1,
    },
    {
      code: '.wrapper font { color: pink; }',
      message: messages.expected('.wrapper font'),
      line: 1,
      description: 'obsolete element as a descendant',
    },
    {
      code: 'font.legacy { color: pink; }',
      message: messages.expected('font.legacy'),
      line: 1,
      description: 'obsolete element qualified by a class',
    },
    {
      code: 'nav > marquee:hover { color: pink; }',
      message: messages.expected('nav > marquee:hover'),
      line: 1,
      description: 'obsolete element behind a combinator and a pseudo-class',
    },
    {
      code: 'BLINK { color: pink; }',
      message: messages.expected('BLINK'),
      line: 1,
      description: 'element names are matched case-insensitively',
    },
  ],
});

// config: [false] triggers the !actual guard
testRule({
  ruleName,
  config: [false],

  reject: [
    {
      code: 'blink { color: pink; }',
      message:
        'Invalid option value "false" for rule "a11y/no-obsolete-element".' +
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
      code: '@media screen { .foo { color: pink; } }',
      description: 'a rule nested in a media query is still checked',
    },
  ],
});

// `image` is a conforming SVG element, and the HTML parser rewrites an
// `<image>` start tag to `img` — so the tag can only legitimately appear as
// SVG, and this rule could never catch the HTML mistake anyway.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'svg image { color: pink; }',
      description: 'image is a conforming SVG element',
    },
    {
      code: 'image { color: pink; }',
      description: 'a bare image selector can only be the SVG element',
    },
  ],
});
