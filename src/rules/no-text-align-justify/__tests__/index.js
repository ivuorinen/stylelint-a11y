import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { text-align: center; }',
    },
    {
      code: '.foo { text-align: left; }',
    },
    {
      code: '.foo { text-align: right; }',
    },
    {
      code: '.foo { text-align: start; }',
    },
    {
      code: '.foo { text-align: end; }',
    },
    {
      code: '.foo { TEXT-ALIGN: CENTER; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-align: justify; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { TEXT-ALIGN: JUSTIFY; }',
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
      code: '.foo { text-align: justify; }',
      message:
        'Invalid option value "false" for rule "a11y/no-text-align-justify".' +
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
      code: '%placeholder { text-align: justify; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// `@page` is not walked by this rule. The declaration is the violating one, so
// the case fails if the rule ever starts traversing @page — the previous
// fixture used `margin: 1cm` and passed either way.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@page :first { text-align: justify; }',
      description: '@page is not walked by this rule',
    },
  ],
});

// Rules nested in a media query are reached like any other rule. The reject
// case is what proves the traversal happens; an accepted value would pass even
// if the rule stopped descending.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '@media screen { .foo { text-align: center; } }',
      description: 'an accepted value nested in a media query stays accepted',
    },
  ],

  reject: [
    {
      code: '@media screen { .foo { text-align: justify; } }',
      message: messages.expected('.foo'),
      description: 'a rule nested in a media query is still checked',
    },
  ],
});

// Last declaration wins. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { text-align: justify; text-align: left; }',
      description: 'an overridden justify does not apply',
    },
  ],

  reject: [
    {
      code: '.a { text-align: left; text-align: justify; }',
      message: messages.expected('.a'),
      description: 'the last declaration is the one judged',
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
      code: '.a { color: red; @media screen { text-align: justify; } }',
      message: messages.expected('.a'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// --fix rewrites to `start`, which follows the writing direction.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { text-align: justify; }',
      fixed: '.a { text-align: start; }',
      message: messages.expected('.a'),
      description: 'justify becomes start',
    },
    {
      code: '.a { text-align: justify !important; }',
      fixed: '.a { text-align: start !important; }',
      message: messages.expected('.a'),
      description: 'the !important flag survives the fix',
    },
  ],
});
