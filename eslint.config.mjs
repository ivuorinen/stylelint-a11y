import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import jest from 'eslint-plugin-jest';
import security from 'eslint-plugin-security';

export default [
  js.configs.recommended,
  prettier,
  jest.configs['flat/recommended'],
  security.configs.recommended,
  {
    // The security rules ship as warnings, and `eslint` exits 0 on warnings —
    // so they would never gate. These are the findings Codacy rejects the PR
    // over (ReDoS-prone patterns, object-injection sinks); catching them here
    // means catching them before the push rather than after.
    name: 'a11y/security-gates-locally',
    files: ['src/**/*.js', 'recommended.js', 'eslint.config.mjs'],
    rules: Object.fromEntries(
      Object.keys(security.configs.recommended.rules).map((rule) => [rule, 'error'])
    ),
  },
  {
    // Mirrors the `.codacy.yml` excludes. Test fixtures index by a computed
    // rule name and the smoke harness writes into a temp directory it just
    // created — both are the point of those files, and neither takes external
    // input.
    name: 'a11y/security-off-for-tests-and-tooling',
    files: ['**/__tests__/**', '**/*.test.js', 'scripts/**'],
    rules: Object.fromEntries(
      Object.keys(security.configs.recommended.rules).map((rule) => [rule, 'off'])
    ),
  },
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        testRule: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          printWidth: 100,
          singleQuote: true,
          trailingComma: 'es5',
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.coverage/**'],
  },
];
