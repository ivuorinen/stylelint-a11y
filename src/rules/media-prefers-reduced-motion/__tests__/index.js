import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: 'a { }',
    },
    {
      code: 'div { transition: none; }',
    },
    {
      code: '.foo { transition: none } @media screen and (prefers-reduced-motion: reduce) { .foo { transition: none } }',
    },
    {
      code: '.bar { animation: none } @media screen and (prefers-reduced-motion) { .bar { animation: none } }',
    },
    {
      code: 'a { animation-name: skew; } @media screen and (prefers-reduced-motion) { a { animation: none } }',
    },
    {
      code: '.foo { transition: all; @media (prefers-reduced-motion: reduce) { transition: none; } }',
    },
  ],

  reject: [
    {
      code: 'a { animation-name: skew; }',
      fixed:
        '@media screen and (prefers-reduced-motion: reduce) {\na { animation: none;\n}\n}\na { animation-name: skew; }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: 'a { animation-name: skew; } @media screen and (prefers-reduced-motion) { a { transition: none; } }',
      fixed:
        'a { animation-name: skew; } @media screen and (prefers-reduced-motion) {\na { animation: none;\n} }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) { .foo { animation: 1s ease-in; } }',
      fixed:
        '.foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) {\n.foo { animation: none;\n} }',
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
      code: '.foo { animation: spin 1s; }',
      message:
        'Invalid option value "false" for rule "a11y/media-prefers-reduced-motion".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Non-standard syntax selectors are skipped
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { animation: spin 1s; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// Edge cases: @page, custom selectors, empty rules, non-animation rules
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with no animation properties',
    },
    {
      code: ':--custom { transition: all 0.3s; }',
      description: 'custom selector is skipped',
    },
    {
      code: 'a { }',
      description: 'empty rule with no declarations',
    },
    {
      code: '.foo { transition: all 0.3s; } @media screen and (prefers-reduced-motion) { .foo { transition: none } }',
      description: 'transition matched by media query counterpart',
    },
    {
      code: '@media screen { a { color: red; } }',
      description: 'no animation properties means accepted',
    },
  ],
});

// Counterpart value not set to none is rejected
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.foo { animation: spin 1s; } @media screen and (prefers-reduced-motion) { .foo { animation: spin 0.5s; } }',
      fixed:
        '.foo { animation: spin 1s; } @media screen and (prefers-reduced-motion) {\n.foo { animation: none;\n} }',
      message: messages.expected('.foo'),
      line: 1,
      description: 'rejects when counterpart does not set value to none',
    },
    {
      code: '.bar { transition: all 0.3s; }',
      fixed:
        '@media screen and (prefers-reduced-motion: reduce) {\n.bar { transition: none;\n}\n}\n.bar { transition: all 0.3s; }',
      message: messages.expected('.bar'),
      line: 1,
      description: 'rejects transition without any reduced-motion counterpart',
    },
  ],
});

// animation-name matched by animation shorthand in media query
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { animation-name: slide; } @media screen and (prefers-reduced-motion) { .foo { animation: none; } }',
      description: 'animation-name matched by animation shorthand in counterpart',
    },
  ],
});

// animation-name without matching counterpart is rejected
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.baz { animation-name: fade; } @media screen and (prefers-reduced-motion) { .baz { transition: none; } }',
      fixed:
        '.baz { animation-name: fade; } @media screen and (prefers-reduced-motion) {\n.baz { animation: none;\n} }',
      message: messages.expected('.baz'),
      line: 1,
      description: 'rejects animation-name when counterpart sets wrong property',
    },
  ],
});
