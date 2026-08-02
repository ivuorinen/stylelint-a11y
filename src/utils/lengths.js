/**
 * Assumed root font size, used to compare and convert absolute lengths.
 *
 * Every rule that reasons about text size shares this assumption, so it lives
 * in one place rather than being restated per rule.
 */
export const ROOT_FONT_SIZE_PX = 16;

/**
 * A number formatted for CSS output: binary floating point makes
 * `0.16 * 3` print as `0.48000000000000004`, and a fix must not write that
 * into a stylesheet. Four decimals is finer than any length a browser
 * resolves, and trailing zeros are dropped.
 */
export const formatNumber = (value) => String(Number(value.toFixed(4)));
