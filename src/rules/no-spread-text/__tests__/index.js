import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { }',
    },
    {
      code: '.foo { display: flex; max-width: 82ch; }',
    },
    {
      code: '.foo { height: 100%; max-width: 82ch; }',
    },
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
    },
    {
      code: '.baz { MAX-WIDTH: 63CH; }',
    },
    {
      code: '.foo { color: red; max-width: 100%; }',
      description: 'percentage cannot be resolved to a character count',
    },
    {
      code: '.foo { color: red; max-width: 50vw; }',
      description: 'viewport units cannot be resolved to a character count',
    },
    {
      code: '.foo { color: red; max-width: calc(100% - 2rem); }',
      description: 'calc() cannot be resolved to a character count',
    },
    {
      code: '.foo { color: red; max-width: 640px; }',
      description: '640px is ~80 characters, inside the default range',
    },
    {
      code: '.foo { color: red; max-width: 40rem; }',
      description: '40rem is 80 characters, inside the default range',
    },
  ],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 40ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.bar { LINE-HEIGHT: 1.8; MAX-WIDTH: 81CH; }',
      message: messages.expected('.bar'),
      line: 1,
    },
    {
      code: '.bar { word-spacing: -5px; max-width: 100px; }',
      message: messages.expected('.bar'),
      line: 1,
      description: '100px is ~12 characters, far below the 45 minimum',
    },
    {
      code: '.foo { color: red; max-width: 1200px; }',
      message: messages.expected('.foo'),
      line: 1,
      description: '1200px is ~150 characters, far above the 80 maximum',
    },
    {
      code: '.foo { color: red; max-width: 60rem; }',
      message: messages.expected('.foo'),
      line: 1,
      description: '60rem is 120 characters, above the 80 maximum',
    },
    {
      code: '.foo { color: red; max-width: 10em; }',
      message: messages.expected('.foo'),
      line: 1,
      description: '10em is 20 characters, below the 45 minimum',
    },
  ],
});

testRule({
  ruleName,
  config: [true, { minWidth: 50, maxWidth: 70 }],

  accept: [
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
    },
  ],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 45ch; }',
      message: messages.expected('.foo'),
      line: 1,
    },
    {
      code: '.foo { text-transform: lowercase; max-width: 75ch; }',
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
      code: '.foo { text-transform: lowercase; max-width: 10ch; }',
      message:
        'Invalid option value "false" for rule "a11y/no-spread-text".' +
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
      code: '%placeholder { text-transform: lowercase; max-width: 10ch; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '{ color: red; max-width: 100em; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],
});

// minWidth > maxWidth guard (lines 39-45)
testRule({
  ruleName,
  config: [true, { minWidth: 80, maxWidth: 45 }],

  reject: [
    {
      code: '.foo { text-transform: lowercase; max-width: 65ch; }',
      description: 'reports an invalid option rather than a stylesheet violation',
      message:
        'Invalid option: minWidth (80) must not be greater than maxWidth (45) for rule "a11y/no-spread-text"',
    },
  ],
});

// A font property is as strong a text signal as `color`. See finding audit-53f10603.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { max-width: 60ch; font-size: 16px; }',
      description: 'a comfortable measure beside font-size is accepted',
    },
    {
      code: '.a { max-width: 20ch; display: block; }',
      description: 'no text signal at all is still skipped',
    },
  ],

  reject: [
    {
      code: '.a { max-width: 20ch; font-size: 16px; }',
      message: messages.expected('.a'),
      description: 'font-size marks the rule as text, so the measure is checked',
    },
    {
      code: '.a { max-width: 20ch; font-family: serif; }',
      message: messages.expected('.a'),
      description: 'font-family marks the rule as text',
    },
  ],
});

// Last declaration wins. See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { color: red; max-width: 20ch; max-width: 60ch; }',
      description: 'an overridden narrow measure does not apply',
    },
  ],

  reject: [
    {
      code: '.a { color: red; max-width: 60ch; max-width: 20ch; }',
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
      code: '.a { color: red; @media screen { max-width: 20ch; } }',
      message: messages.expected('.a'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// --fix clamps the measure into the comfortable range, in the author's unit.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { color: red; max-width: 20ch; }',
      fixed: '.a { color: red; max-width: 45ch; }',
      message: messages.expected('.a'),
      description: 'too narrow is widened to the minimum',
    },
    {
      code: '.a { color: red; max-width: 120ch; }',
      fixed: '.a { color: red; max-width: 80ch; }',
      message: messages.expected('.a'),
      description: 'too wide is narrowed to the maximum',
    },
    {
      code: '.a { color: red; max-width: 100px; }',
      fixed: '.a { color: red; max-width: 360px; }',
      message: messages.expected('.a'),
      description: 'px is converted back to px',
    },
    {
      code: '.a { color: red; max-width: 10em; }',
      fixed: '.a { color: red; max-width: 22.5em; }',
      message: messages.expected('.a'),
      description: 'em is converted back to em',
    },
  ],
});
