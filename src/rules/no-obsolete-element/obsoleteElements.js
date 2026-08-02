/**
 * Elements listed under "Non-conforming features" in the HTML Living Standard.
 * `menu` and `hgroup` are deliberately absent: both are conforming elements in
 * the current spec. Re-check against the spec's obsolete-features section
 * before adding entries.
 */
export const obsoleteElements = new Set([
  'applet',
  'acronym',
  'bgsound',
  'dir',
  'frame',
  'frameset',
  'noframes',
  'image',
  'isindex',
  'listing',
  'nextid',
  'noembed',
  'plaintext',
  'rb',
  'rtc',
  'strike',
  'xmp',
  'basefont',
  'big',
  'blink',
  'center',
  'font',
  'marquee',
  'multicol',
  'nobr',
  'spacer',
  'tt',
  'keygen',
  'menuitem',
]);
