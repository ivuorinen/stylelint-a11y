import { messages, ruleName } from '../index.js';

testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { transition: all 0.3s ease; }',
    },
    {
      code: '.foo { animation-duration: 2s; }',
    },
    {
      code: '.foo { transition-duration: 500ms; }',
    },
    {
      code: '.foo { animation-duration: 5s; }',
    },
    {
      code: '.foo { animation: spin 3s linear infinite; }',
    },
    {
      code: '.foo { transition: none; }',
    },
    {
      code: '.foo { display: flex; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 10s; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 6000ms; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
    },
    {
      code: '.foo { transition: opacity 6s linear; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
    },
    {
      code: '.foo { animation: spin 10s linear infinite; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
    },
  ],
});

testRule({
  ruleName,
  config: [true, { maxDuration: '3s' }],

  accept: [
    {
      code: '.foo { animation-duration: 3s; }',
    },
    {
      code: '.foo { transition-duration: 2s; }',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 4s; }',
      message: messages.expected('.foo', '3s'),
      line: 1,
    },
    {
      code: '.foo { transition-duration: 3500ms; }',
      message: messages.expected('.foo', '3s'),
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
      code: '.foo { animation-duration: 999s; }',
      message:
        'Invalid option value "false" for rule "a11y/animation-duration-reasonable".' +
        ' Are you trying to disable this rule? If so use "null" instead',
    },
  ],
});

// Edge cases: non-standard syntax, unitless values, missing time values
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '%placeholder { animation-duration: 999s; }',
      description: 'skips SCSS placeholder selectors',
    },
    {
      code: '.foo { animation-duration: 100; }',
      description: 'unitless duration value returns NaN and is ignored',
    },
    {
      code: '.foo { animation: spin linear infinite; }',
      description: 'shorthand with no time value returns NaN',
    },
    {
      code: '{ animation-duration: 10s; }',
      description: 'a rule with an empty selector is skipped',
    },
  ],

  reject: [
    {
      code: 'a { /* c */ animation-duration: 10s; }',
      message: messages.expected('a', '5s'),
      line: 1,
      description: 'a comment among the declarations does not stop the scan',
    },
  ],
});

// `animation-duration` and `transition-duration` take a comma-separated list.
// Every segment is checked, not just the first.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.foo { animation-duration: 1s, 2s, 3s; }',
      description: 'every segment under the threshold',
    },
  ],

  reject: [
    {
      code: '.foo { animation-duration: 1s, 10s; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
      description: 'a later segment over the threshold is still caught',
    },
    {
      code: '.foo { transition-duration: 200ms, 6s; }',
      message: messages.expected('.foo', '5s'),
      line: 1,
      description: 'the over-threshold segment need not be first',
    },
  ],
});

// maxDuration must be a string carrying a time unit
testRule({
  ruleName,
  config: [true, { maxDuration: 5 }],

  reject: [
    {
      code: '.foo { animation-duration: 10s; }',
      description: 'rejects a unitless numeric maxDuration',
      message:
        'Invalid value "5" for option "maxDuration" of rule "a11y/animation-duration-reasonable"',
    },
  ],
});

// Last declaration wins within each property family.
// See finding audit-82a06e54.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { animation-duration: 10s; animation-duration: 1s; }',
      description: 'an overridden long duration does not apply',
    },
  ],

  reject: [
    {
      code: '.a { animation-duration: 1s; animation-duration: 10s; }',
      message: messages.expected('.a', '5s'),
      description: 'the last declaration is the one judged',
    },
    {
      code: '.a { animation-duration: 1s; transition-duration: 10s; }',
      message: messages.expected('.a', '5s'),
      description: 'transitions are tracked independently of animations',
    },
  ],
});

// Animations and transitions are separate families, so a rule can violate
// through either — and the first violation stops the scan.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { transition: all 1s ease; }',
      description: 'a short transition shorthand is fine',
    },
  ],

  reject: [
    {
      code: '.a { transition: all 10s ease; }',
      message: messages.expected('.a', '5s'),
      description: 'the transition shorthand is read for its duration',
    },
    {
      code: '.a { animation-duration: 10s; transition-duration: 10s; }',
      message: messages.expected('.a', '5s'),
      description: 'both families over the threshold is still one report',
    },
  ],
});

// Vendor-prefixed spellings name the same property. See finding audit-ae065bca.
testRule({
  ruleName,
  config: [true],

  accept: [
    {
      code: '.a { -webkit-animation-duration: 1s; }',
      description: 'a prefixed duration under the threshold is fine',
    },
  ],

  reject: [
    {
      code: '.a { -webkit-animation-duration: 10s; }',
      message: messages.expected('.a', '5s'),
      description: 'a prefixed duration is still checked',
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
      code: '.a { color: red; @media screen { animation: 10s linear; } }',
      message: messages.expected('.a', '5s'),
      description: 'a declaration inside a nested at-rule is checked',
    },
  ],
});

// --fix clamps the duration and leaves every other part of the value alone.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { animation-duration: 10s; }',
      fixed: '.a { animation-duration: 5s; }',
      message: messages.expected('.a', '5s'),
      description: 'the duration is clamped to the threshold',
    },
    {
      code: '.a { animation-duration: 8000ms; }',
      fixed: '.a { animation-duration: 5000ms; }',
      message: messages.expected('.a', '5s'),
      description: 'ms stays ms',
    },
    {
      code: '.a { animation: slide 10s ease-in-out 2s infinite; }',
      fixed: '.a { animation: slide 5s ease-in-out 2s infinite; }',
      message: messages.expected('.a', '5s'),
      description: 'the delay, easing, name and count are preserved',
    },
    {
      code: '.a { transition-duration: 1s, 10s; }',
      fixed: '.a { transition-duration: 1s, 5s; }',
      message: messages.expected('.a', '5s'),
      description: 'only the over-budget entry of the list changes',
    },
  ],
});

// Unit identifiers are case-insensitive in CSS. Detection lowercased the
// value but the fix path read the declaration as written, so an uppercase
// unit was reported and then left untouched.
testRule({
  ruleName,
  config: [true],
  fix: true,

  reject: [
    {
      code: '.a { animation-duration: 10S; }',
      fixed: '.a { animation-duration: 5s; }',
      message: messages.expected('.a', '5s'),
      description: 'an uppercase unit is fixed, not just reported',
    },
    {
      code: '.a { animation: slide 10S ease 2s infinite; }',
      fixed: '.a { animation: slide 5s ease 2s infinite; }',
      message: messages.expected('.a', '5s'),
      description: 'an uppercase unit inside a shorthand is fixed',
    },
  ],
});
