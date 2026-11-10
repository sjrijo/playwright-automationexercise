const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ROOT = path.resolve(__dirname, '..');

/**
 * Loads environment config.
 *   1. .env                 – defaults / local values (gitignored)
 *   2. .env.<TEST_ENV>      – overrides for dev / qa / staging (gitignored)
 * Real environment variables (e.g. from CI) always win over both files.
 */
function loadEnv() {
  dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });
  const testEnv = process.env.TEST_ENV;
  if (testEnv) {
    const file = path.join(ROOT, `.env.${testEnv}`);
    if (!fs.existsSync(file)) throw new Error(`TEST_ENV=${testEnv} but ${file} does not exist`);
    dotenv.config({ path: file, override: true, quiet: true });
  }

  return {
    TEST_ENV: testEnv || 'default',
    BASE_URL: (process.env.BASE_URL || 'https://automationexercise.com').replace(/\/$/, ''),
    BROWSERS: (process.env.BROWSERS || 'chromium').split(',').map((b) => b.trim()).filter(Boolean),
    // Optional: an existing account to use instead of creating a fresh one each run.
    USER_EMAIL: process.env.USER_EMAIL || '',
    USER_PASSWORD: process.env.USER_PASSWORD || '',
  };
}

module.exports = { loadEnv };
