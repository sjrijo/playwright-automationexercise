#!/usr/bin/env node
/**
 * Cross-platform "TEST_ENV=<env> playwright test ..." without extra dependencies.
 * Usage: node scripts/with-env.js <env> [playwright test args...]
 */
const { spawnSync } = require('child_process');

const [testEnv, ...args] = process.argv.slice(2);
if (!testEnv) {
  console.error('Usage: node scripts/with-env.js <env> [playwright args...]');
  process.exit(1);
}

const result = spawnSync('npx', ['playwright', 'test', ...args], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, TEST_ENV: testEnv },
});
process.exit(result.status ?? 1);
