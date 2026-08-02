/** @type {import('jest').Config} */
export default {
  preset: 'jest-preset-stylelint',
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js', '!src/rules/index.js'],
  coverageDirectory: './.coverage/',
  coverageReporters: ['lcov', 'text'],
  // Holding the gate at 100 means a new guard clause has to arrive with the
  // test that exercises it, rather than quietly eroding the margin.
  //
  // It measures only that no code is unexercised — not that the rules produce
  // correct verdicts. Value and source-order shapes (CSS Color 4 functions,
  // native nesting, selector-list spacing, override ordering) run through code
  // that is already covered, so a defect in one changes no counter here. Six
  // such defects once passed a green 100%. Behavioural coverage belongs in the
  // per-rule accept/reject cases, not in this number.
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  setupFiles: ['./jest.setup.mjs'],
  testEnvironment: 'node',
  roots: ['src'],
  testRegex: '.*\\.test\\.js$|src/.*/__tests__/.*\\.js$',
};
