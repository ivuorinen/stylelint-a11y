/**
 * The declaration for a property that actually applies within a rule.
 *
 * A property declared more than once in the same rule resolves to its last
 * declaration, so judging every declaration reports fallbacks that never take
 * effect — `font-size: 10px; font-size: 20px` renders at 20px. `!important`
 * beats a later non-important declaration in the same rule and so wins here
 * too.
 *
 * `isTarget` receives the lowercased property name. Pass a predicate covering
 * a shorthand and its longhands together (`outline`, `outline-style`,
 * `outline-width`) so the last declaration across the family is the one
 * returned, which is correct for the common orderings in both directions.
 *
 * Known limitation: this does not resolve shorthand-versus-longhand
 * interaction. `outline-style: none` followed by `outline: 1px solid red` is
 * judged on the shorthand alone, which happens to be right; the reverse order
 * is judged on the longhand, which is also right. Partial resets
 * (`outline: 1px solid red; outline-width: 0`) are judged on the longhand and
 * so are also right. Only exotic mixtures fall outside it, and resolving those
 * would mean implementing the cascade.
 *
 * `node` is a PostCSS `Rule`, which always carries `nodes`; passing a nodeless
 * node throws rather than silently reporting no declaration.
 *
 * @returns the winning declaration node, or `null` when the rule declares none.
 */
export function effectiveDeclaration(node, isTarget) {
  let last = null;
  let important = null;

  for (const child of node.nodes) {
    if (child.type !== 'decl' || !isTarget(child.prop.toLowerCase())) continue;

    last = child;

    if (child.important) important = child;
  }

  return important ?? last;
}

/**
 * A rule and every at-rule nested inside it, each an independent declaration
 * context.
 *
 * `.a { color: red; @media screen { display: none } }` declares `display` only
 * under that condition, but it is still a declaration of `.a` and must be
 * judged. Merging the nested declarations into the rule's own list would be
 * wrong: `.a { display: none; @media print { display: block } }` is
 * unconditionally `display: none` outside print, and a flat last-wins scan
 * would read it as `block`. Resolving each context separately gets both right.
 */
export function* declarationContexts(rule) {
  yield rule;

  for (const child of rule.nodes) {
    if (child.type === 'atrule' && child.nodes) yield* declarationContexts(child);
  }
}

/** True if `violates` holds for the rule or any at-rule nested inside it. */
export function someContext(rule, violates) {
  for (const context of declarationContexts(rule)) {
    if (violates(context)) return true;
  }

  return false;
}

/**
 * A property name with any vendor prefix removed, so `-webkit-box-shadow` is
 * recognised as `box-shadow`. Hand-written legacy CSS carries the prefixed
 * spelling alone; autoprefixed output carries both.
 */
export const unprefixed = (prop) => prop.replace(/^-\w+-/, '');

/** `effectiveDeclaration` for a single property name. */
export const effectiveValue = (node, prop) => {
  const declaration = effectiveDeclaration(node, (name) => name === prop);

  return declaration ? declaration.value : null;
};
