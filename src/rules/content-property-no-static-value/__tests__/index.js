import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: ".foo::after { content: ''; }",
    },
    {
      code: 'a { }',
    },
    {
      code: ".foo:after { content: ''; }",
    },
    {
      code: '.foo::after { content: ""; }',
    },
    {
      code: '.bar::before { content: attr(aria-label); }',
    },
    {
      code: ".foo { font-size: '12px'; width: '200px'; }",
    },
  ],

  reject: [
    {
      code: '.foo::before { content: "bar"; }',
      message: messages.expected('.foo::before'),
      line: 1,
    },
    {
      code: '.bar::before { content: 23; }',
      message: messages.expected('.bar::before'),
      line: 1,
    },
    {
      code: ".foo:before, .bar { content: ''; }",
      message: messages.expected('.foo:before, .bar'),
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
      code: '.foo { content: "static text"; }',
      message:
        'Invalid option value "false" for rule "a11y/content-property-no-static-value".' +
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
      code: '%placeholder { content: "static text"; }',
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

// `none` and `normal` cancel a pseudo-element rather than injecting text, so
// neither reaches the accessibility tree. See finding audit-e39e660e.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a::before { content: none; }',
      description: 'content: none removes the pseudo-element',
    },
    {
      code: 'a::after { content: normal; }',
      description: 'content: normal is the initial value',
    },
  ],
});

// Last declaration wins, and ::marker content is the list bullet.
// See findings audit-82a06e54 and audit-d1717dc5.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a::before { content: "Price: $50"; content: ""; }',
      description: 'an overridden static value never renders',
    },
    {
      code: 'li::marker { content: "- "; }',
      description: '::marker content is the list bullet, not announced text',
    },
    {
      code: 'li::marker { content: counter(list-item) ". "; }',
      description: 'a counter marker is presentational',
    },
  ],

  reject: [
    {
      code: 'a::before { content: ""; content: "Price: $50"; }',
      message: messages.expected('a::before'),
      description: 'a decorative value must not mask the one that overrides it',
    },
  ],
});

// A nested at-rule is its own declaration context, so the nested spelling of a
// violation is checked like the flat one. See finding audit-4037f66d.
testRule({
  ruleName,
  config: [true],

  reject: [
    {
      code: 'a::before { color: red; @media screen { content: "Price"; } }',
      message: messages.expected('a::before'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});
