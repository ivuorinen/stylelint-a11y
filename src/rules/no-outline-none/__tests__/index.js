import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { outline: 0; }',
    },
    {
      code: '$primary-color: #333; .bar:focus { outline: 1px solid $primary-color; }',
    },
    {
      code: '.baz:focus { outline: none; border-color: #333; }',
    },
    {
      code: '.quux:focus { outline: 0; border: 1px solid #000; }',
    },
    {
      code: '.quuux:focus { outline: none; box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25); }',
    },
    {
      code: '.a:focus { outline: 0px; box-shadow: 0 0 0 2px blue; }',
      description: 'zero-length outline with a visible replacement',
    },
    {
      code: '.a:focus { outline-style: none; border: 2px solid blue; }',
      description: 'outline-style longhand with a visible replacement',
    },
    {
      code: '.a:focus { outline-width: 0; box-shadow: 0 0 0 2px blue; }',
      description: 'outline-width longhand with a visible replacement',
    },
    {
      code: '.a:focus { outline: 2px solid red; }',
      description: 'a visible outline is never reported',
    },
    {
      code: '.a:focus { outline-width: 2px; }',
      description: 'a non-zero outline-width is never reported',
    },
    {
      code: '.a:focus { outline-style: solid; }',
      description: 'a non-none outline-style is never reported',
    },
    {
      code: '.a:focus { outline: thin solid red; }',
      description: 'keyword outline widths are not zero',
    },
  ],

  reject: [
    {
      code: '.foo1:focus { outline: none; } .foo2:focus { outline: 1px solid red; }',
      message: messages.expected('.foo1:focus'),
      line: 1,
    },
    {
      code: '.bar:focus { outline: none; }',
      message: messages.expected('.bar:focus'),
      line: 1,
    },
    {
      code: '.baz:focus { outline: none; border: transparent; }',
      message: messages.expected('.baz:focus'),
      line: 1,
    },
    {
      code: '.quux { .quuux:focus { outline: 0; } }',
      message: messages.expected('.quuux:focus'),
      line: 1,
    },
    {
      code: '.a:focus { outline: 0px; }',
      message: messages.expected('.a:focus'),
      line: 1,
      description: 'a zero length with a unit still removes the focus ring',
    },
    {
      code: '.a:focus { outline-style: none; }',
      message: messages.expected('.a:focus'),
      line: 1,
      description: 'the outline-style longhand removes the focus ring',
    },
    {
      code: '.a:focus { outline-width: 0; }',
      message: messages.expected('.a:focus'),
      line: 1,
      description: 'the outline-width longhand removes the focus ring',
    },
    {
      code: '.a:focus { outline: 0 none; }',
      message: messages.expected('.a:focus'),
      line: 1,
      description: 'a multi-part shorthand that zeroes the outline',
    },
    {
      code: '.a:focus { OUTLINE: NONE; }',
      message: messages.expected('.a:focus'),
      line: 1,
      description: 'property and value are matched case-insensitively',
    },
  ],
});

// config: [false] triggers the !actual guard
testRule({
  ruleName,
  config: [false],

  reject: [
    {
      code: '.foo:focus { outline: none; }',
      message:
        'Invalid option value "false" for rule "a11y/no-outline-none".' +
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
      code: '%placeholder { outline: none; }',
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
      code: '@media screen { .foo:focus { outline: 1px solid red; } }',
      description: 'a rule nested in a media query is still checked',
    },
  ],
});

// CSS Color 4 puts bare numbers in the value; a zero colour channel is not a
// zero outline width. See finding audit-d94132ba.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: 'a:focus { outline: 2px solid rgb(0 0 0); }',
      description: 'a space-separated rgb() channel is not an outline width',
    },
    {
      code: 'a:focus { outline: 2px solid hsl(0 0% 0%); }',
      description: 'a space-separated hsl() channel is not an outline width',
    },
    {
      code: 'a:focus { outline: 2px solid rgb(0 0 0 / calc(1 * 50%)); }',
      description: 'nested function notation is stripped from the inside out',
    },
  ],

  reject: [
    {
      code: 'a:focus { outline: 0 solid rgb(0 0 0); }',
      message: messages.expected('a:focus'),
      description: 'a genuine zero width is still caught alongside a function value',
    },
  ],
});

// In CSS the last declaration of a property wins, so an overridden
// `outline: none` never removes anything. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a:focus { outline: none; outline: 1px solid red; }',
      description: 'an overridden outline: none is not a removed outline',
    },
    {
      code: '.a:focus { outline: 0; outline: auto 5px Highlight; }',
      description: 'the classic focus-ring fallback pair is accepted',
    },
  ],

  reject: [
    {
      code: '.a:focus { outline: 1px solid red; outline: none; }',
      message: messages.expected('.a:focus'),
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
      code: '.a:focus { color: red; @media screen { outline: none; } }',
      message: messages.expected('.a:focus'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// A transparent ring is as invisible as a zero-width one.
// See finding audit-a2381323.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a:focus { outline: 2px solid; outline-color: red; }',
      description: 'a real outline colour is a visible ring',
    },
  ],

  reject: [
    {
      code: '.a:focus { outline: 2px solid; outline-color: transparent; }',
      message: messages.expected('.a:focus'),
      description: 'a transparent outline colour hides the ring',
    },
  ],
});

// --fix reverts the suppressing declaration, restoring the UA focus ring.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a:focus { outline: none; }',
      fixed: '.a:focus { outline: revert; }',
      message: messages.expected('.a:focus'),
      description: 'outline: none becomes outline: revert',
    },
    {
      code: '.a:focus { outline-width: 0; }',
      fixed: '.a:focus { outline-width: revert; }',
      message: messages.expected('.a:focus'),
      description: 'only the longhand that suppressed the ring is reverted',
    },
    {
      code: '.a:focus { outline: 2px solid; outline-color: transparent; }',
      fixed: '.a:focus { outline: 2px solid; outline-color: revert; }',
      message: messages.expected('.a:focus'),
      description: 'the visible part of the outline is untouched',
    },
  ],
});

// Distinct longhands do not override one another, so more than one can
// suppress the ring at once. Reverting only the last left the ring gone while
// the next pass read the effective declaration as `revert` and reported clean.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a:focus { outline-style: none; outline-width: 0; }',
      fixed: '.a:focus { outline-style: revert; outline-width: revert; }',
      message: messages.expected('.a:focus'),
      description: 'every suppressing longhand is reverted, not just the last',
    },
    {
      code: '.a:focus { outline-style: none; outline-width: 0; outline-color: transparent; }',
      fixed: '.a:focus { outline-style: revert; outline-width: revert; outline-color: revert; }',
      message: messages.expected('.a:focus'),
      description: 'all three longhands are reverted together',
    },
  ],
});
