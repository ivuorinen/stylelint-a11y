import { someSelectorNode } from './selectors.js';

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

    // A tag-qualified entry must be qualified by an actual tag: a class or id
    // that merely shares the element's name does not target that element.
    return node.parent.nodes.some(
      (sibling) =>
        sibling.type === 'tag' && obsolete.has(`${sibling.value.toLowerCase()}[${attribute}]`)
    );
  });
}
