import parser from 'postcss-selector-parser';

/**
 * True if any node of the parsed `selector` satisfies `predicate`.
 *
 * The single place this plugin parses a selector. A selector PostCSS accepted
 * but postcss-selector-parser rejects cannot be judged, so the parse is
 * guarded once here rather than at each call site: report nothing rather than
 * failing the whole lint run.
 */
export function someSelectorNode(selector, predicate) {
  let found = false;

  try {
    parser((selectors) => {
      selectors.walk((node) => {
        if (!found && predicate(node)) found = true;
      });
    }).processSync(selector);
  } catch {
    return false;
  }

  return found;
}

/** A selector list split into its trimmed parts. */
const parts = (list) => list.split(',').map((part) => part.trim());

/**
 * True if `candidate` targets at least everything `required` targets.
 *
 * Coverage, not equality, is what makes an override a counterpart: a block
 * written for `.a:hover, .a:focus` applies to every element `.a:hover` applies
 * to, so it overrides that rule. Demanding identical lists made a *broader*
 * override invisible, and `--fix` then appended another one on every pass.
 *
 * A narrower candidate still fails, which is correct — an override for `.a`
 * does not cover a rule that also styles `.b`.
 */
export function coversSelectors(candidate, required) {
  const have = new Set(parts(candidate));

  return parts(required).every((part) => have.has(part));
}
