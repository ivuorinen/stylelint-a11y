import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
    {
      code: '.bar { display: flex; }',
    },
    {
      code: '.foo { color: red; letter-spacing: normal; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
    },
    {
      code: '.foo { color: red; letter-spacing: 2px; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.05em; }',
      fixed: '.foo { color: red; letter-spacing: 0.12em; }',
      message: messages.expectedLetterSpacing('.foo', '0.12em'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.1em; }',
      fixed: '.foo { color: red; word-spacing: 0.16em; }',
      message: messages.expectedWordSpacing('.foo', '0.16em'),
      line: 1,
    },
    {
      code: '.bar { line-height: 1.5; letter-spacing: 0em; }',
      unfixable: true,
      message: messages.expectedLetterSpacing('.bar', '0.12em'),
      line: 1,
      description: 'an explicit zero is reported but left alone by --fix',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minLetterSpacing: '0.15em', minWordSpacing: '0.2em' }],
  fix: true,

  accept: [
    {
      code: '.foo { color: red; letter-spacing: 0.15em; word-spacing: 0.2em; }',
    },
  ],

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.12em; }',
      fixed: '.foo { color: red; letter-spacing: 0.15em; }',
      message: messages.expectedLetterSpacing('.foo', '0.15em'),
      line: 1,
    },
    {
      code: '.foo { color: red; word-spacing: 0.16em; }',
      fixed: '.foo { color: red; word-spacing: 0.2em; }',
      message: messages.expectedWordSpacing('.foo', '0.2em'),
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
      code: '.foo { color: red; letter-spacing: 0.01em; }',
      message:
        'Invalid option value "false" for rule "a11y/text-spacing-is-readable".' +
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
      code: '%placeholder { color: red; letter-spacing: 0.01em; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '{ color: red; letter-spacing: 0; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],

  reject: [
    {
      code: 'p { /* c */ color: red; letter-spacing: 0.01em; }',
      message: messages.expectedLetterSpacing('p', '0.12em'),
      line: 1,
      description: 'a comment among the declarations does not stop the scan',
    },
  ],
});

// An explicit zero is reported, but --fix never rewrites it: widening spacing
// the author set to zero is a typographic decision, not a lint fix.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.foo { color: red; word-spacing: 0; }',
      unfixable: true,
      message: messages.expectedWordSpacing('.foo', '0.16em'),
      line: 1,
      description: 'zero word-spacing is reported but not auto-fixed',
    },
    {
      code: '.foo { color: red; letter-spacing: 0px; }',
      unfixable: true,
      message: messages.expectedLetterSpacing('.foo', '0.12em'),
      line: 1,
      description: 'zero with a unit is reported but not auto-fixed',
    },
  ],
});

// Non-zero values below the threshold are still fixed.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.foo { color: red; letter-spacing: 0.01em; word-spacing: 0.02em; }',
      fixed: '.foo { color: red; letter-spacing: 0.12em; word-spacing: 0.16em; }',
      message: messages.expectedLetterSpacing('.foo', '0.12em'),
      warnings: [
        { message: messages.expectedLetterSpacing('.foo', '0.12em') },
        { message: messages.expectedWordSpacing('.foo', '0.16em') },
      ],
      description: 'both properties reported and fixed independently',
    },
  ],
});

// Absolute units are converted against the 16px root assumption rather than
// being skipped outright. See finding audit-ad74d1bb.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { color: red; letter-spacing: 3px; }',
      description: '3px is 0.1875em at the 16px root, above the 0.12em threshold',
    },
    {
      code: '.a { color: red; letter-spacing: 5%; }',
      description: 'a percentage cannot be resolved statically and is skipped',
    },
    {
      code: '.a { color: red; letter-spacing: calc(1em / 4); }',
      description: 'calc() cannot be resolved statically and is skipped',
    },
  ],

  reject: [
    {
      code: '.a { color: red; letter-spacing: 1px; }',
      message: messages.expectedLetterSpacing('.a', '0.12em'),
      description: '1px is 0.0625em, below the threshold',
    },
    {
      code: '.a { color: red; word-spacing: 1px; }',
      message: messages.expectedWordSpacing('.a', '0.16em'),
      description: 'word-spacing in px is converted the same way',
    },
  ],
});

// pt is converted through px against the same 16px root assumption.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { color: red; letter-spacing: 3pt; }',
      description: '3pt is 4px, 0.25em at the 16px root',
    },
  ],

  reject: [
    {
      code: '.a { color: red; letter-spacing: 1pt; }',
      message: messages.expectedLetterSpacing('.a', '0.12em'),
      description: '1pt is 1.33px, 0.083em, below the threshold',
    },
  ],
});

// Last declaration wins, per property. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { color: red; letter-spacing: 0.01em; letter-spacing: 0.2em; }',
      description: 'an overridden tight letter-spacing does not apply',
    },
  ],

  reject: [
    {
      code: '.a { color: red; letter-spacing: 0.2em; letter-spacing: 0.01em; }',
      message: messages.expectedLetterSpacing('.a', '0.12em'),
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
      code: '.a { color: red; @media screen { letter-spacing: 0.01em; } }',
      message: messages.expectedLetterSpacing('.a', '0.12em'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});
