const fs = require('fs');
const path = require('path');
const { test } = require('./baseTest');
const { STORAGE_DIR } = require('../utils/authPaths');

/** Deletes the shared users created by auth.setup.js and removes the saved state. */
test('delete shared users', async ({ apiClient }) => {
  if (!fs.existsSync(STORAGE_DIR)) return;
  for (const file of fs.readdirSync(STORAGE_DIR).filter((f) => f.endsWith('.user.json'))) {
    const user = JSON.parse(fs.readFileSync(path.join(STORAGE_DIR, file), 'utf-8'));
    if (!user.preexisting) await apiClient.deleteAccount(user);
  }
  fs.rmSync(STORAGE_DIR, { recursive: true, force: true });
});
