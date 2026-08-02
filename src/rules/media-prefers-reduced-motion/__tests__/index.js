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
        'a { animation-name: skew; }\n@media screen and (prefers-reduced-motion: reduce) {\na { animation: none;\n}\n}',
      message: messages.expected('a'),
      line: 1,
      description: 'generated override is placed after the rule so it wins the cascade',
    },
    {
      code: 'a { animation-name: skew; } @media screen and (prefers-reduced-motion) { a { transition: none; } }',
      fixed:
        'a { animation-name: skew; } @media screen and (prefers-reduced-motion) { a { transition: none; animation: none; } }',
      message: messages.expected('a'),
      line: 1,
      description: 'appends to the existing override without dropping its declarations',
    },
    {
      code: '.foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) { .foo { animation: 1s ease-in; } }',
      fixed:
        '.foo { animation: 1s ease-in; } @media screen and (prefers-reduced-motion) { .foo { animation: none; } }',
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
        '.foo { animation: spin 1s; } @media screen and (prefers-reduced-motion) { .foo { animation: none; } }',
      message: messages.expected('.foo'),
      line: 1,
      description: 'rejects when counterpart does not set value to none',
    },
    {
      code: '.bar { transition: all 0.3s; }',
      fixed:
        '.bar { transition: all 0.3s; }\n@media screen and (prefers-reduced-motion: reduce) {\n.bar { transition: none;\n}\n}',
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
        '.baz { animation-name: fade; } @media screen and (prefers-reduced-motion) { .baz { transition: none; animation: none; } }',
      message: messages.expected('.baz'),
      line: 1,
      description: 'rejects animation-name when counterpart sets wrong property',
    },
  ],
});

// Property names are case-insensitive in CSS
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { ANIMATION: 2s slide; }',
      fixed:
        '.a { ANIMATION: 2s slide; }\n@media screen and (prefers-reduced-motion: reduce) {\n.a { animation: none;\n}\n}',
      message: messages.expected('.a'),
      line: 1,
      description: 'uppercase property name is still checked',
    },
    {
      code: '.b { Transition: all 0.3s; }',
      fixed:
        '.b { Transition: all 0.3s; }\n@media screen and (prefers-reduced-motion: reduce) {\n.b { transition: none;\n}\n}',
      message: messages.expected('.b'),
      line: 1,
      description: 'mixed-case property name is still checked',
    },
  ],
});

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { ANIMATION: none; } ',
      description: 'uppercase property already set to none needs no counterpart',
    },
  ],
});

// Every animated property needs its own counterpart, not just the first
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { transition: 1s; animation: 2s x; } @media (prefers-reduced-motion: reduce) { .a { transition: none; } }',
      fixed:
        '.a { transition: 1s; animation: 2s x; } @media (prefers-reduced-motion: reduce) { .a { transition: none; animation: none; } }',
      message: messages.expected('.a'),
      line: 1,
      description: 'one override does not satisfy two animated properties',
    },
  ],
});

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { transition: 1s; animation: 2s x; } @media (prefers-reduced-motion: reduce) { .a { transition: none; animation: none; } }',
      description: 'both animated properties overridden',
    },
  ],
});

// The third arm of addOverrides: a later reduced-motion block exists, but has
// no rule for this selector, so a whole rule is appended to it.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: 'a { animation: 1s x; }\n@media (prefers-reduced-motion: reduce) { b { animation: none; } }\n',
      fixed:
        'a { animation: 1s x; }\n@media (prefers-reduced-motion: reduce) { b { animation: none; }\na { animation: none;\n} }\n',
      message: messages.expected('a'),
      line: 1,
      description: 'appends a new rule to an existing block that lacks this selector',
    },
  ],
});

// A reduced-motion block placed before the rule does not satisfy it: both have
// the same specificity, so the later rule wins and no motion is reduced.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '@media (prefers-reduced-motion: reduce) { .a { animation: none; } } .a { animation: 2s x; }',
      fixed:
        '@media (prefers-reduced-motion: reduce) { .a { animation: none; } } .a { animation: 2s x; }\n@media screen and (prefers-reduced-motion: reduce) {\n.a { animation: none;\n}\n}',
      message: messages.expected('.a'),
      description: 'an override placed before the rule loses the cascade and is not accepted',
    },
  ],
});

// A nested reduced-motion block belongs to the rule it is nested in and to no
// other. See finding audit-dd2bb4e9.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { animation: spin 1s; @media (prefers-reduced-motion) { animation: none; } }',
      description: 'a block nested in the offending rule covers it',
    },
    {
      code: '.a,.b { animation: spin 1s } @media (prefers-reduced-motion) { .a, .b { animation: none } }',
      description: 'selector lists match regardless of comma spacing',
    },
  ],

  reject: [
    {
      code: '.a { animation: spin 1s; }\n.b { @media (prefers-reduced-motion) { animation: none; } }\n',
      message: messages.expected('.a'),
      line: 1,
      description: 'a block nested in a different rule does not cover this one',
    },
  ],
});

// Media feature names are ASCII case-insensitive. See finding audit-746b62e8.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { animation: spin 1s; }\n@media (PREFERS-REDUCED-MOTION: REDUCE) { .a { animation: none; } }\n',
      description: 'an uppercase media query is still a reduced-motion override',
    },
    {
      code: '@media (PREFERS-REDUCED-MOTION) { .a { animation: spin 1s; } }',
      description: 'a rule inside an uppercase reduced-motion block is the override itself',
    },
  ],
});

// Parity with the factory-backed media-prefers-* rules: the override is found
// through transparent grouping at-rules, but not through @layer.
// See finding audit-6c68c9b2.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { animation: spin 1s; } @supports (color: red) { @media (prefers-reduced-motion) { .a { animation: none; } } }',
      description: 'an override wrapped in @supports is found',
    },
    {
      code: '.a { animation: spin 1s; } @media screen { @media (prefers-reduced-motion) { .a { animation: none; } } }',
      description: 'an override in a nested media query is found',
    },
  ],

  reject: [
    {
      code: '.a { animation: spin 1s; } @layer m { @media (prefers-reduced-motion) { .a { animation: none; } } }',
      message: messages.expected('.a'),
      description: 'unlayered styles beat every layer, so a layered override loses the cascade',
    },
  ],
});

// @page is not walked: its params are a page selector and no counterpart could
// ever satisfy a report. See finding audit-ec57fbb3.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { animation: spin 1s; }',
      description: '@page is not walked by this rule',
    },
  ],
});

// Shapes PostCSS parses inside a nested override block: a bodyless at-rule
// (`nodes` is undefined) and a non-declaration child.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { animation: spin 1s; @media (prefers-reduced-motion) { /* note */ animation: none; } }',
      description: 'a comment inside a nested override block is stepped over',
    },
  ],

  reject: [
    {
      code: '.a { animation: spin 1s; @media (prefers-reduced-motion); }',
      message: messages.expected('.a'),
      description: 'a bodyless nested at-rule overrides nothing',
    },
  ],
});
