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
  const compound = [];

  for (let i = index - 1; i >= 0 && siblings[i].type !== 'combinator'; i -= 1) {
    compound.push(siblings[i]);
  }

  for (let i = index + 1; i < siblings.length && siblings[i].type !== 'combinator'; i += 1) {
    compound.push(siblings[i]);
  }

  return compound;
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
