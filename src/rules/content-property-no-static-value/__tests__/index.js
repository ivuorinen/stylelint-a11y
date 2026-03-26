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

// Non-standard syntax rule skipped (line 51)
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

// @page atrule with params (line 55)
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { margin: 1cm; }',
      description: '@page atrule with params is walked but has no content property',
    },
  ],
});
