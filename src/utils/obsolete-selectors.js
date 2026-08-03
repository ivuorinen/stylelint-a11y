import { someSelectorNode } from './selectors.js';

/**
 * The nodes sharing a compound selector with `node` — everything up to the
 * nearest combinator on either side.
 *
 * Scanning the whole selector instead matched `body a[link]` against obsolete
 * `body[link]`: the `[link]` belongs to `a`, and `body` is a different
 * element entirely.
 */
function compoundSiblings(node) {
  const siblings = node.parent.nodes;
  const index = siblings.indexOf(node);

  /** Takes nodes until a combinator ends the compound selector. */
  const untilCombinator = (nodes) => {
    const taken = [];

    for (const sibling of nodes) {
      if (sibling.type === 'combinator') break;

      taken.push(sibling);
    }

    return taken;
  };

  return [
    ...untilCombinator(siblings.slice(0, index).reverse()),
    ...untilCombinator(siblings.slice(index + 1)),
  ];
}

/**
 * Returns true if a selector targets any obsolete tag or tag/attribute pair in
 * `obsolete`.
 *
 * The selector is parsed rather than string-matched, so descendant and
 * qualified forms (`.wrapper font`, `font.legacy`, `a[charset="utf-8"]`) are
 * caught the same way as the bare `font` and `a[charset]` forms.
 *
 * Attribute entries are matched both tag-qualified (`a[charset]`) and bare
 * (`[dropzone]`), matching the two shapes present in the obsolete lists.
 */
export function hasObsoleteSelector(selector, obsolete) {
  return someSelectorNode(selector, (node) => {
    if (node.type === 'tag') return obsolete.has(node.value.toLowerCase());
    if (node.type !== 'attribute') return false;

    const attribute = node.attribute.toLowerCase();

    if (obsolete.has(`[${attribute}]`)) return true;

    // A tag-qualified entry must be qualified by an actual tag in the *same*
    // compound selector: a class or id that merely shares the element's name
    // does not target that element, and neither does a tag on the other side
    // of a combinator.
    return compoundSiblings(node).some(
      (sibling) =>
        sibling.type === 'tag' && obsolete.has(`${sibling.value.toLowerCase()}[${attribute}]`)
    );
  });
}
