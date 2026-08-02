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
      code: 'a:focus { }',
    },
    {
      code: 'a:hover, a:focus { }',
    },
    {
      code: 'a:hover { } a:focus { }',
    },
    {
      code: 'a:focus { outline: thin dotted; } a:active, a:hover { outline: 0; }',
    },
    {
      code: 'a:hover:focus { }',
      description: 'a selector that already combines both pseudo-classes',
    },
    {
      code: '.nav a:hover, .nav a:focus { }',
      description: 'compound selectors are matched as a whole',
    },
  ],

  reject: [
    {
      code: 'a:hover { }',
      fixed: 'a:hover, a:focus { }',
      message: messages.expected('a:hover'),
    },
    {
      code: 'a:hover { } b:hover { }',
      fixed: 'a:hover, a:focus { } b:hover, b:focus { }',
      warnings: [
        { message: messages.expected('a:hover'), line: 1 },
        { message: messages.expected('b:hover'), line: 1 },
      ],
    },
    {
      code: 'a:hover { } a:focus { } b:hover { } b { }',
      fixed: 'a:hover { } a:focus { } b:hover, b:focus { } b { }',
      message: messages.expected('b:hover'),
    },
    {
      code: 'a:hover, a:focus { } b:hover { } b { }',
      fixed: 'a:hover, a:focus { } b:hover, b:focus { } b { }',
      message: messages.expected('b:hover'),
    },
    {
      code: 'a:hover, b:focus { }',
      fixed: 'a:hover, b:focus, a:focus { }',
      message: messages.expected('a:hover, b:focus'),
      description: 'an unrelated :focus in the list does not cover a:hover',
    },
    {
      code: '.nav a:hover, .side b:focus { }',
      fixed: '.nav a:hover, .side b:focus, .nav a:focus { }',
      message: messages.expected('.nav a:hover, .side b:focus'),
      description: 'unrelated compound selectors do not cover each other',
    },
    {
      code: 'a:hover, b:hover { }',
      fixed: 'a:hover, b:hover, a:focus, b:focus { }',
      message: messages.expected('a:hover, b:hover'),
      description: 'every uncovered :hover in the list gets a counterpart',
    },
  ],
});

// config: [false] triggers the !actual guard
testRule({
  ruleName,
  config: [false],

  reject: [
    {
      code: 'a:hover { }',
      message:
        'Invalid option value "false" for rule "a11y/selector-pseudo-class-focus".' +
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
      code: '%placeholder:hover { color: red; }',
      description: 'skips SCSS placeholder selectors',
    },
  ],
});

// `:hover` inside a functional pseudo-class argument is not the subject of the
// selector. Rewriting it inverts what the selector matches — `:not(:focus)`
// matches nearly every element. See finding audit-ec6068bd.
testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: '.a:not(:hover) { color: red; }',
      description: ':not(:hover) selects the absence of hover and needs no :focus twin',
    },
    {
      code: '.a:has(:hover) { color: red; }',
      description: ':has(:hover) selects an ancestor, not the hovered element',
    },
    {
      code: '.a:is(:hover) { color: red; }',
      description: ':hover inside :is() is an argument, not the subject',
    },
    {
      code: '.a:where(:hover) { color: red; }',
      description: ':hover inside :where() is an argument, not the subject',
    },
  ],

  reject: [
    {
      code: '.a:not(.b):hover { color: red; }',
      fixed: '.a:not(.b):hover, .a:not(.b):focus { color: red; }',
      message: messages.expected('.a:not(.b):hover'),
      description: 'a subject :hover is still caught when the selector also uses :not()',
    },
  ],
});

// Only the subject `:hover` is rewritten. A blanket regex also rewrote
// arguments, so `.card:hover .child:not(:hover)` became
// `.card:focus .child:not(:focus)` — a different set of elements.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.card:hover .child:not(:hover) { color: red; }',
      fixed: '.card:hover .child:not(:hover), .card:focus .child:not(:hover) { color: red; }',
      message: messages.expected('.card:hover .child:not(:hover)'),
      description: 'a :hover argument is left alone while the subject is rewritten',
    },
    {
      code: ':is(.a, .b):hover { color: red; }',
      fixed: ':is(.a, .b):hover, :is(.a, .b):focus { color: red; }',
      message: messages.expected(':is(.a, .b):hover'),
      description: 'a comma inside :is() does not split the selector',
    },
  ],
});
