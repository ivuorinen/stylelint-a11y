// The plugin array is imported rather than named by path. stylelint resolves a
// string entry in `plugins` from the *consumer's* base directory, not from this
// file, so the previous `plugins: ['.']` failed with `Could not find "."` in
// every project that extended this config.
import plugins from './dist/index.js';

export default {
  plugins: [plugins],
  rules: {
    'a11y/media-prefers-reduced-motion': true,
    'a11y/no-outline-none': true,
    'a11y/selector-pseudo-class-focus': true,
  },
};
