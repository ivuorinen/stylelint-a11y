import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: '.foo { display: none; }',
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
      code: '.foo { display: none; }',
      message:
        'Invalid option value "false" for rule "a11y/no-display-none".' +
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
      code: '%placeholder { display: none; }',
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
      code: '@media screen { .foo { display: flex; } }',
      description: 'a rule nested in a media query is still checked',
    },
  ],
});

// Hiding content for print carries none of the cost this rule prevents.
// See finding audit-cca38725.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media print { .nav { display: none; } }',
      description: 'a print-only stylesheet may hide content',
    },
    {
      code: '@media only print { .nav { display: none; } }',
      description: 'only print is still print-only',
    },
  ],

  reject: [
    {
      code: '@media screen, print { .nav { display: none; } }',
      message: messages.expected('.nav'),
      description: 'a query that also affects screen output is not exempt',
    },
    {
      code: '@media screen { .nav { display: none; } }',
      message: messages.expected('.nav'),
      description: 'screen-only is not exempt',
    },
  ],
});

// Last declaration wins. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { display: none; display: block; }',
      description: 'an overridden display: none hides nothing',
    },
  ],

  reject: [
    {
      code: '.a { display: block; display: none; }',
      message: messages.expected('.a'),
      description: 'the last declaration is the one judged',
    },
    {
      code: '.a { display: none !important; display: block; }',
      message: messages.expected('.a'),
      description: '!important beats a later plain declaration',
    },
  ],
});

// A nested at-rule is its own declaration context, and the print exemption
// applies per context. See finding audit-4037f66d.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { color: red; @media print { display: none; } }',
      description: 'a nested print-only block may hide content',
    },
    {
      code: '.a { display: block; @media print { display: none; } }',
      description: 'hidden only for print is still exempt',
    },
  ],

  reject: [
    {
      code: '.a { color: red; @media screen { display: none; } }',
      message: messages.expected('.a'),
      description: 'a declaration inside a nested at-rule is checked',
    },
    {
      code: '.a { display: none; @media print { display: block; } }',
      message: messages.expected('.a'),
      description: 'the outer context still hides content outside print',
    },
  ],
});

// `@media not print` means everything *except* print, so it affects screen
// output. Matching the bare word `print` treated it as print-only.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media only print { .n { display: none; } }',
      description: 'only print is print-only',
    },
    {
      code: '@media print and (min-width: 10px) { .n { display: none; } }',
      description: 'a qualified print query is still print-only',
    },
  ],

  reject: [
    {
      code: '@media not print { .n { display: none; } }',
      message: messages.expected('.n'),
      description: 'not print applies to screen output',
    },
    {
      code: '@media all { .n { display: none; } }',
      message: messages.expected('.n'),
      description: 'all includes screen',
    },
  ],
});
