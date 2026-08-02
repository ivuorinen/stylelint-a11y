import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';
import { someSelectorNode } from '../../utils/selectors.js';

export const ruleName = 'a11y/selector-pseudo-class-focus';

export const messages = utils.ruleMessages(ruleName, {
  expected: (value) => `Expected that ${value} is used together with :focus pseudo-class`,
});

/**
 * True if the selector hovers the element it selects, rather than merely
 * mentioning `:hover` inside a functional pseudo-class argument.
 *
 * `:not(:hover)` selects the *absence* of hover and `:has(:hover)` selects an
 * ancestor of a hovered element; neither has a `:focus` counterpart to
 * require, and rewriting the `:hover` inside them inverts what the selector
 * matches. Only a top-level `:hover` is the subject of this rule.
 */
const hasSubjectHover = (selector) =>
  someSelectorNode(selector, (node) => {
    if (node.type !== 'pseudo' || node.value.toLowerCase() !== ':hover') return false;

    // Anything nested inside a functional pseudo-class (`:not(...)`,
    // `:is(...)`, `:has(...)`) is an argument, not the subject.
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (parent.type === 'pseudo') return false;
    }

    return true;
  });

/** The `:focus` counterpart of a `:hover` selector. */
const toFocus = (selector) => selector.replace(/:hover/gi, ':focus').trim();

/** Every selector declared by rules under `parent`. */
const declaredSelectors = (parent) =>
  parent.nodes.filter((node) => node.type === 'rule').flatMap((node) => node.selectors);

export default function (actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    // The declared-selector set depends only on the parent, so building it once
    // per parent keeps the walk linear. Rebuilding it per rule made the check
    // quadratic: 8.5s on a 4000-rule stylesheet. Scoped to this run, so nothing
    // leaks between lint invocations.
    const cache = new WeakMap();
    const declaredFor = (parent) => {
      let declared = cache.get(parent);

      if (!declared) {
        declared = new Set(declaredSelectors(parent));
        cache.set(parent, declared);
      }

      return declared;
    };

    root.walkRules((rule) => {
      if (!isStandardSyntaxRule(rule) || !rule.selector) {
        return;
      }

      if (rule.selector.indexOf(':') === -1) {
        return;
      }

      // Compared per selector, not over the joined string: an unrelated
      // `:focus` elsewhere in the list must not satisfy this `:hover`.
      const hovered = rule.selectors.filter(
        (selector) => hasSubjectHover(selector) && !/:focus/i.test(selector)
      );

      if (hovered.length === 0) {
        return;
      }

      const declared = declaredFor(rule.parent);
      const uncovered = hovered.filter((selector) => !declared.has(toFocus(selector)));

      if (uncovered.length === 0) {
        return;
      }

      utils.report({
        message: messages.expected(rule.selector),
        node: rule,
        ruleName,
        result,
        fix: () => {
          const focused = uncovered.map(toFocus);

          rule.selector = [rule.selector, ...focused].join(', ');

          // The cached set is now stale: later rules in the same parent must
          // see the selectors this fix just declared.
          for (const selector of focused) declared.add(selector);
        },
      });
    });
  };
}
