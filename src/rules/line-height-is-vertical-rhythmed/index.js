import stylelint from 'stylelint';
const { utils } = stylelint;
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule.mjs';

export const ruleName = 'a11y/line-height-is-vertical-rhythmed';

export const messages = utils.ruleMessages(ruleName, {
  expected: (selector) => `Expected a vertical rhythmed line-height in ${selector}`,
});

const DEFAULT_MIN_UNITLESS = 1.5;
const DEFAULT_GRID_PX = 24;

export default function (actual, options) {
  return (root, result) => {
    const validOptions = utils.validateOptions(
      result,
      ruleName,
      { actual },
      {
        actual: options,
        possible: {
          minUnitless: [(v) => typeof v === 'number'],
          gridPx: [(v) => typeof v === 'number'],
        },
        optional: true,
      }
    );

    if (!validOptions || !actual) {
      return;
    }

    const minUnitless = options?.minUnitless ?? DEFAULT_MIN_UNITLESS;
    const gridPx = options?.gridPx ?? DEFAULT_GRID_PX;

    function check(node) {
      if (node.type !== 'rule') {
        return true;
      }

      const checkInPx = (o) =>
        o.value.toLowerCase().endsWith('px') && parseInt(o.value) % gridPx !== 0;
      const checkInRel = (o) => !isNaN(o.value) && parseFloat(o.value) < minUnitless;

      return !node.nodes.some(
        (o) =>
          o.type === 'decl' &&
          o.prop.toLowerCase() === 'line-height' &&
          (checkInPx(o) || checkInRel(o))
      );
    }

    root.walk((node) => {
      let selector = null;

      if (node.type === 'rule') {
        if (!isStandardSyntaxRule(node)) {
          return;
        }
        selector = node.selector;
      } else if (node.type === 'atrule' && node.name.toLowerCase() === 'page' && node.params) {
        selector = node.params;
      }

      if (!selector) {
        return;
      }

      const isAccepted = check(node);

      if (!isAccepted) {
        utils.report({
          message: messages.expected(selector),
          node,
          ruleName,
          result,
        });
      }
    });
  };
}
