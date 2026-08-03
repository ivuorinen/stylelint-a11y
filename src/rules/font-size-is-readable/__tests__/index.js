import { messages, ruleName } from '../index.js';

// The `font` shorthand carries a font-size too.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { font: 16px/1.5 Arial, sans-serif; }',
      description: 'shorthand size at or above the default threshold',
    },
    {
      code: '.a { font: bold 20px/1.5 Arial; }',
      description: 'shorthand with a preceding font-weight',
    },
    {
      code: '.a { font: 1.5em/1.5 Arial; }',
      description: 'em resolves against an inherited size and is not judged',
    },
    {
      code: '.a { font: inherit; }',
      description: 'shorthand with no length component',
    },
    {
      code: '.a { font-family: Arial; }',
      description: 'unrelated font longhand',
    },
  ],

  reject: [
    {
      code: '.a { font: 10px/1.5 Arial, sans-serif; }',
      message: messages.expected('.a'),
      line: 1,
      description: 'shorthand size below the default threshold',
    },
    {
      code: '.a { font: italic bold 12px/30px Georgia, serif; }',
      message: messages.expected('.a'),
      line: 1,
      description: 'shorthand size below threshold with style and weight',
    },
    {
      code: '.a { font: 8pt Arial; }',
      message: messages.expected('.a'),
      line: 1,
      description: 'shorthand size in points below the threshold',
    },
    {
      code: '.a { FONT: 10PX/1.5 Arial; }',
      message: messages.expected('.a'),
      line: 1,
      description: 'shorthand is matched case-insensitively',
    },
  ],
});

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { }',
    },
    {
      code: '.foo { font-size: 15px; }',
    },
    {
      code: '.foo { font-size: 12pt; }',
    },
    {
      code: '.bar { FONT-SIZE: 15PX; }',
    },
    {
      code: '.baz { font-size: 1em; }',
    },
    {
      code: '.foo { font-size: 1rem; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 10px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { font-size: 3pt; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { FONT-SIZE: 8PX; }',
      message: messages.expected('.bar'),
      line: 1,
    },
    {
      code: '.foo { font-size: 0.5rem; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '15em' }],

  reject: [
    {
      code: '.foo { font-size: 8px; }',
      description: 'rejects invalid option (em unit not allowed)',
      message: 'Invalid value "15em" for option "minSize" of rule "a11y/font-size-is-readable"',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: 'abc' }],

  reject: [
    {
      code: '.foo { font-size: 8px; }',
      description: 'rejects invalid option (non-numeric)',
      message: 'Invalid value "abc" for option "minSize" of rule "a11y/font-size-is-readable"',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '1rem' }],

  accept: [
    {
      code: '.foo { font-size: 1rem; }',
    },
    {
      code: '.foo { font-size: 16px; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 0.5rem; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { font-size: 12px; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minSize: '16px' }],

  accept: [
    {
      code: '.foo { font-size: 16px; }',
    },
    {
      code: '.foo { font-size: 20px; }',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 15px; }',
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
      code: '.foo { font-size: 1px; }',
      message:
        'Invalid option value "false" for rule "a11y/font-size-is-readable".' +
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
      code: '%placeholder { font-size: 1px; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '{ font-size: 10px; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],

  reject: [
    {
      code: 'a { /* c */ font-size: 10px; }',
      message: messages.expected('a'),
      line: 1,
      description: 'a comment among the declarations does not stop the scan',
    },
  ],
});

// minSize must be a string carrying a unit
testRule({
  ruleName,
  config: [true, { minSize: 12 }],

  reject: [
    {
      code: '.foo { font-size: 8px; }',
      description: 'rejects a unitless numeric minSize',
      message: 'Invalid value "12" for option "minSize" of rule "a11y/font-size-is-readable"',
    },
  ],
});

// pt threshold parsing
testRule({
  ruleName,
  config: [true, { minSize: '12pt' }],

  accept: [
    {
      code: '.foo { font-size: 12pt; }',
      description: 'pt threshold: at threshold',
    },
    {
      code: '.foo { font-size: 16px; }',
      description: 'pt threshold: above threshold in px',
    },
  ],

  reject: [
    {
      code: '.foo { font-size: 10pt; }',
      message: messages.expected('.foo'),
      line: 1,
    },
  ],
});

// Last declaration wins, across `font` and `font-size` together.
// See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { font-size: 10px; font-size: 20px; }',
      description: 'an overridden small fallback does not apply',
    },
    {
      code: '.a { font-size: 10px; font: 20px serif; }',
      description: 'the font shorthand overrides an earlier font-size',
    },
  ],

  reject: [
    {
      code: '.a { font-size: 20px; font-size: 10px; }',
      message: messages.expected('.a'),
      description: 'the last declaration is the one judged',
    },
    {
      code: '.a { font: 20px serif; font-size: 10px; }',
      message: messages.expected('.a'),
      description: 'font-size overrides an earlier shorthand',
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
      code: '.a { color: red; @media screen { font-size: 10px; } }',
      message: messages.expected('.a'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// --fix raises to the threshold in the author's unit.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { font-size: 10px; }',
      fixed: '.a { font-size: 15px; }',
      message: messages.expected('.a'),
      description: 'px is raised to the px threshold',
    },
    {
      code: '.a { font-size: 8pt; }',
      fixed: '.a { font-size: 11.25pt; }',
      message: messages.expected('.a'),
      description: 'pt stays pt',
    },
    {
      code: '.a { font-size: 0.5rem; }',
      fixed: '.a { font-size: 0.9375rem; }',
      message: messages.expected('.a'),
      description: 'rem stays rem',
    },
    {
      code: '.a { font: italic bold 12px/30px Georgia, serif; }',
      fixed: '.a { font: italic bold 15px/30px Georgia, serif; }',
      message: messages.expected('.a'),
      description: 'only the size component of the shorthand changes',
    },
  ],
});
