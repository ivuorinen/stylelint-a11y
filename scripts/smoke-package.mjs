/**
 * Packs the package, installs the tarball into a throwaway project, and uses it
 * the way a consumer does.
 *
 * Unit tests load rules straight from `src/`, so they cannot catch packaging
 * defects: a missing build step, an `exports` map that hides an entry point, a
 * shareable config whose plugin path does not resolve from the consumer's
 * directory, or test files leaking into the tarball. Every one of those has
 * shipped from this repo before.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });

const dir = mkdtempSync(join(tmpdir(), 'a11y-smoke-'));
let failures = 0;

const check = (label, condition, detail = '') => {
  console.log(
    `${condition ? 'ok  ' : 'FAIL'} ${label}${detail && !condition ? ` — ${detail}` : ''}`
  );
  if (!condition) failures++;
};

try {
  const tarball = run('npm', ['pack', '--silent'], root).trim().split('\n').pop();

  check('npm pack produced a tarball', Boolean(tarball), tarball);

  run('npm', ['init', '-y'], dir);
  run('npm', ['install', '--silent', 'stylelint', join(root, tarball)], dir);

  const installed = join(dir, 'node_modules', '@ivuorinen', 'stylelint-a11y');
  const shipped = readdirSync(installed, { recursive: true }).map(String);

  check(
    'no test files in the published package',
    !shipped.some((f) => /__tests__|\.test\./.test(f)),
    shipped.filter((f) => /__tests__|\.test\./.test(f)).join(', ')
  );
  const shippedPaths = shipped.map((f) => f.replace(/\\/g, '/'));

  for (const declaration of ['types/index.d.ts', 'types/recommended.d.ts']) {
    check(`${declaration} is published`, shippedPaths.includes(declaration));
  }

  writeFileSync(
    join(dir, '.stylelintrc.json'),
    '{"extends":"@ivuorinen/stylelint-a11y/recommended"}'
  );
  writeFileSync(join(dir, 'probe.css'), 'a:hover { color: red; }\nb:focus { outline: 0px; }\n');
  writeFileSync(
    join(dir, 'probe.mjs'),
    [
      "import stylelint from 'stylelint';",
      "import plugins from '@ivuorinen/stylelint-a11y';",
      'const extended = await stylelint.lint({ files: "probe.css" });',
      'const byName = await stylelint.lint({',
      "  code: 'a:focus { outline: 0px; }',",
      "  config: { plugins: ['@ivuorinen/stylelint-a11y'], rules: { 'a11y/no-outline-none': true } },",
      '});',
      'console.log(JSON.stringify({',
      '  pluginCount: plugins.length,',
      '  extendedWarnings: extended.results[0].warnings.length,',
      '  byNameWarnings: byName.results[0].warnings.length,',
      '  metaUrl: byName.results[0]._postcssResult.stylelint.ruleMetadata["a11y/no-outline-none"].url,',
      '  fixable: byName.results[0]._postcssResult.stylelint.ruleMetadata["a11y/no-outline-none"].fixable,',
      "  fixed: (await stylelint.lint({ code: 'a:focus { outline: 0; }', fix: true,",
      "    config: { plugins: ['@ivuorinen/stylelint-a11y'], rules: { 'a11y/no-outline-none': true } } })).code,",
      '}));',
    ].join('\n')
  );

  let out = null;
  let probeError = '';

  try {
    out = JSON.parse(run('node', ['--no-warnings', 'probe.mjs'], dir).trim().split('\n').pop());
  } catch (error) {
    // A config that does not resolve throws here. Report it as a failed check
    // rather than a stack trace, so the offending guarantee is named.
    probeError = String(error.stderr || error.message).split('\n')[0];
  }

  check('consumer probe runs', out !== null, probeError);
  check('bare-name import exposes every rule', out?.pluginCount === 16, `got ${out?.pluginCount}`);
  check(
    'extends "@ivuorinen/stylelint-a11y/recommended" resolves and reports',
    out?.extendedWarnings === 2,
    `got ${out?.extendedWarnings} warnings`
  );
  check('plugins: ["@ivuorinen/stylelint-a11y"] resolves', out?.byNameWarnings === 1);
  check(
    'rule metadata reaches the consumer',
    Boolean(out?.metaUrl?.endsWith('no-outline-none/README.md'))
  );
  check('fixability is advertised to the consumer', out?.fixable === true);
  check(
    '--fix works from the published package',
    out?.fixed === 'a:focus { outline: revert; }',
    `got ${JSON.stringify(out?.fixed)}`
  );

  rmSync(join(root, tarball), { force: true });
} finally {
  rmSync(dir, { recursive: true, force: true });
}

console.log(failures ? `\n${failures} smoke check(s) failed` : '\nall smoke checks passed');
process.exit(failures ? 1 : 0);
