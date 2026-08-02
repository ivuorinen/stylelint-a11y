import { list } from 'postcss';
import parser from 'postcss-selector-parser';

/**
 * Runs `visit` over the parsed `selector`. Returns the (possibly rewritten)
 * selector, or `null` when it cannot be parsed.
 *
 * The single place this plugin parses a selector. A selector PostCSS accepted
 * but postcss-selector-parser rejects cannot be judged, so the parse is
 * guarded once here rather than at each call site: report nothing rather than
 * failing the whole lint run.
 */
function withParsedSelector(selector, visit) {
  try {
    return parser((selectors) => selectors.walk(visit)).processSync(selector);
  } catch {
    return null;
  }
}

/** True if any node of the parsed `selector` satisfies `predicate`. */
export function someSelectorNode(selector, predicate) {
  let found = false;

  withParsedSelector(selector, (node) => {
    if (!found && predicate(node)) found = true;
  });

  return found;
}

/**
 * True when `node` is the subject of its selector rather than an argument to a
 * functional pseudo-class.
 *
 * `:not(:hover)` selects the *absence* of hover and `:has(:hover)` selects an
 * ancestor; neither is the hovered element, and rewriting either inverts what
 * the selector matches.
 */
const isSubject = (node) => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'pseudo') return false;
  }

  return true;
};

/** True if the selector hovers the element it selects. */
export const hasSubjectHover = (selector) =>
  someSelectorNode(
    selector,
    (node) => node.type === 'pseudo' && node.value.toLowerCase() === ':hover' && isSubject(node)
  );

/**
 * The `:focus` counterpart of a `:hover` selector, or `null` when the selector
 * cannot be parsed.
 *
 * Only subject-level `:hover` is rewritten. A blanket `replace(/:hover/g, ...)`
 * also rewrote arguments, so `.card:hover .child:not(:hover)` became
 * `.card:focus .child:not(:focus)` — a different set of elements.
 */
export const toFocusSelector = (selector) =>
  withParsedSelector(selector, (node) => {
    if (node.type !== 'pseudo' || node.value.toLowerCase() !== ':hover') return;
    if (!isSubject(node)) return;

    node.value = ':focus';
  });

/**
 * A selector list split into its parts.
 *
 * `list.comma` from PostCSS, not `String.split(',')`: a comma inside a
 * functional pseudo-class is part of one selector, so splitting naively tore
 * `:is(.a, .b):hover` into `:is(.a` and `.b):hover`.
 */
const parts = (selectorList) => list.comma(selectorList);

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
