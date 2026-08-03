import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { }',
    },
    {
      code: '.foo { color: red } @media screen and (prefers-color-scheme: dark) { .foo { color: blue } }',
    },
    {
      code: '.bar { background-color: red } @media screen and (prefers-color-scheme: dark) { .bar { background-color: blue } }',
    },
  ],

  reject: [
    {
      code: 'a { color: red; }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: 'a { color: red; } @media screen and (prefers-color-scheme: dark) { a { background-color: red; } }',
      message: messages.expected('a'),
      line: 1,
    },
    {
      code: '.foo { background-color: red;}',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { color: red; } .baz { background-color: red; } @media screen and (prefers-color-scheme: dark) { .baz { color: blue; } }',
      warnings: [
        {
          message: messages.expected('.bar'),
          line: 1,
        },
        {
          message: messages.expected('.baz'),
          line: 1,
        },
      ],
    },
    {
      code: '.foo { background-color: red; } @media screen and (prefers-color-scheme) { .foo { color: red; } }',
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
      code: 'a { color: red; }',
      message:
        'Invalid option value "false" for rule "a11y/media-prefers-color-scheme".' +
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
      code: '%placeholder { color: red; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// Custom selectors (:--prefixed) are skipped
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: ':--custom { color: red; }',
      description: 'custom selector is skipped in check function',
    },
  ],
});

// Source order, native nesting and selector-list spacing: three shapes the
// counterpart search used to get wrong. See findings audit-81697e2a,
// audit-f3de4e79 and audit-8c8dc39d.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: black; @media (prefers-color-scheme: dark) { color: white; } }',
      description: 'a counterpart nested in the rule itself covers the property',
    },
    {
      code: '.a,.b { color: black; } @media (prefers-color-scheme: dark) { .a, .b { color: white; } }',
      description: 'selector lists match regardless of comma spacing',
    },
    {
      code: '.b, .a { color: black; } @media (prefers-color-scheme: dark) { .a, .b { color: white; } }',
      description: 'selector lists match regardless of order',
    },
  ],

  reject: [
    {
      code: '@media (prefers-color-scheme: dark) { a { color: white; } } a { color: black; }',
      message: messages.expected('a'),
      description: 'an override placed before the rule loses the cascade and is not accepted',
    },
  ],
});

// Shapes PostCSS parses but that carry no usable counterpart: a bodyless
// nested at-rule (`nodes` is undefined) and a non-rule child of the media block.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: black; } @media (prefers-color-scheme: dark) { /* note */ a { color: white; } }',
      description: 'a comment inside the media block is stepped over',
    },
    {
      code: 'a { color: black; @media (prefers-color-scheme: dark) { /* note */ color: white; } }',
      description: 'a comment inside a nested media block is stepped over',
    },
  ],

  reject: [
    {
      code: 'a { color: black; @media (prefers-color-scheme: dark); }',
      message: messages.expected('a'),
      description: 'a bodyless nested at-rule overrides nothing',
    },
  ],
});

// Media feature names are ASCII case-insensitive.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a { color: black; }\n@media (PREFERS-COLOR-SCHEME: DARK) { a { color: white; } }\n',
      description: 'an uppercase media query is still a counterpart',
    },
  ],
});

// Conditional grouping at-rules are transparent; @layer is not.
// See finding audit-790a5234.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@supports (color: red) { a { color: black; } @media (prefers-color-scheme: dark) { a { color: white; } } }',
      description: 'a counterpart in the same group as the rule covers it',
    },
  ],

  reject: [
    {
      code: 'a { color: black; } @supports (color: red) { @media (prefers-color-scheme: dark) { a { color: white; } } }',
      message: messages.expected('a'),
      description: 'a counterpart gated on @supports does not cover an ungated rule',
    },
    {
      code: 'a { color: black; } @media screen { @media (prefers-color-scheme: dark) { a { color: white; } } }',
      message: messages.expected('a'),
      description: 'a counterpart gated on a nested media query is narrower than the rule',
    },
    {
      code: 'a { color: black; } @layer theme { @media (prefers-color-scheme: dark) { a { color: white; } } }',
      message: messages.expected('a'),
      description: 'unlayered styles beat every layer, so a layered override loses the cascade',
    },
    {
      code: '@supports (color: red) { a { color: black; } }',
      message: messages.expected('a'),
      description: 'no counterpart anywhere is still a violation',
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
      code: '@page :first { color: red; }',
      description: '@page is not walked by this rule',
    },
  ],
});
