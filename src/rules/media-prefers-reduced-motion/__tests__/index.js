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
        '@media screen and (prefers-reduced-motion: reduce) {\na { animation: none;\n}\n} a { animation-name: skew; } @media screen and (prefers-reduced-motion) { a { transition: none; } }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) { .foo { animation: 1s ease-in; } }',
      fixed:
        '@media screen and (prefers-reduced-motion: reduce) {\n.foo { animation: none;\n}\n} .foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) { .foo { animation: 1s ease-in; } }',
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

// Non-standard syntax rule skipped (line 113)
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

// @page atrule (line 118-122)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked but has no animation',
    },
  ],
});

// Custom selector check (line 42) - isCustomSelector checks :--prefixed selectors
// But :--custom IS standard syntax, it's just a custom selector
// The check function returns true for custom selectors
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: ':--custom { transition: all 0.3s; }',
      description: 'custom selector is skipped in check function',
    },
  ],
});

// No declarations in node (line 38 - !declarations)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
      description: 'empty rule with no declarations returns true',
    },
  ],
});

// transition: none inside prefers-reduced-motion (line 73 - not matched)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { transition: all 0.3s; } @media screen and (prefers-reduced-motion) { .foo { transition: none } }',
      description: 'transition matched by media query counterpart',
    },
  ],
});

// Non-standard syntax for atrule (line 97)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { a { color: red; } }',
      description: 'no animation properties means accepted',
    },
  ],
});

// Value not 'none' in prefers-reduced-motion counterpart (line 73)
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.foo { animation: spin 1s; } @media screen and (prefers-reduced-motion) { .foo { animation: spin 0.5s; } }',
      fixed:
        '@media screen and (prefers-reduced-motion: reduce) {\n.foo { animation: none;\n}\n} .foo { animation: spin 1s; } @media screen and (prefers-reduced-motion) { .foo { animation: spin 0.5s; } }',
      message: messages.expected('.foo'),
      line: 1,
      description: 'rejects when prefers-reduced-motion counterpart does not set value to none',
    },
  ],
});

// Non-standard selector in check function (line 38) - SCSS interpolation passed as selector
// This is hit when the selector passed to check() is non-standard
// But isStandardSyntaxRule prevents it from reaching check(), so this is unreachable
// Testing that transition with non-matching property is rejected
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.bar { transition: all 0.3s; }',
      fixed:
        '@media screen and (prefers-reduced-motion: reduce) {\n.bar { transition: none;\n}\n}\n.bar { transition: all 0.3s; }',
      message: messages.expected('.bar'),
      line: 1,
    },
  ],
});
