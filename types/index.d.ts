import type { Plugin } from 'stylelint';

/**
 * Every rule this plugin registers, namespaced as it appears in a stylelint
 * `rules` config. Kept in sync with `src/rules/index.js` by
 * `src/rules/index.test.js`.
 */
export type A11yRuleName =
  | 'a11y/animation-duration-reasonable'
  | 'a11y/content-property-no-static-value'
  | 'a11y/font-size-is-readable'
  | 'a11y/line-height-is-vertical-rhythmed'
  | 'a11y/media-prefers-color-scheme'
  | 'a11y/media-prefers-contrast'
  | 'a11y/media-prefers-reduced-motion'
  | 'a11y/no-display-none'
  | 'a11y/no-important-on-focus'
  | 'a11y/no-obsolete-attribute'
  | 'a11y/no-obsolete-element'
  | 'a11y/no-outline-none'
  | 'a11y/no-spread-text'
  | 'a11y/no-text-align-justify'
  | 'a11y/selector-pseudo-class-focus'
  | 'a11y/text-spacing-is-readable';

/** Secondary options accepted by `a11y/animation-duration-reasonable`. */
export interface AnimationDurationReasonableOptions {
  /** CSS time value, e.g. `"3s"` or `"500ms"`. Default `"5s"`. */
  maxDuration?: string;
}

/** Secondary options accepted by `a11y/font-size-is-readable`. */
export interface FontSizeIsReadableOptions {
  /** Length with a `px`, `pt` or `rem` unit. Default `"15px"`. */
  minSize?: string;
}

/** Secondary options accepted by `a11y/line-height-is-vertical-rhythmed`. */
export interface LineHeightIsVerticalRhythmedOptions {
  /** Minimum unitless line-height. Default `1.5`. */
  minUnitless?: number;
  /** Vertical rhythm grid in pixels. Default `24`. */
  gridPx?: number;
}

/** Secondary options accepted by `a11y/no-spread-text`. */
export interface NoSpreadTextOptions {
  /** Minimum line length in characters. Default `45`. */
  minWidth?: number;
  /** Maximum line length in characters. Default `80`. */
  maxWidth?: number;
}

/** Secondary options accepted by `a11y/text-spacing-is-readable`. */
export interface TextSpacingIsReadableOptions {
  /** Length with an `em` unit. Default `"0.12em"`. */
  minLetterSpacing?: string;
  /** Length with an `em` unit. Default `"0.16em"`. */
  minWordSpacing?: string;
}

/**
 * The plugin array, ready to pass to stylelint's `plugins` option.
 *
 * @example
 * import a11y from '@ivuorinen/stylelint-a11y';
 * export default { plugins: [a11y], rules: { 'a11y/no-outline-none': true } };
 */
declare const plugins: Plugin[];

export default plugins;
