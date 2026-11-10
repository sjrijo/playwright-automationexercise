const crypto = require('crypto');
const defaults = require('../test-data/users.json').newUserTemplate;

const uid = () => `${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

/** A unique email address (example.com is reserved for testing, so nothing is ever delivered). */
const uniqueEmail = (prefix = 'pw') => `${prefix}.${uid()}@example.com`;

/**
 * A complete, unique user profile. Field names match the signup form;
 * ApiClient maps them to the API's parameter names.
 */
function randomUser(overrides = {}) {
  const id = uid();
  return {
    ...defaults,
    name: `PW User ${id}`,
    email: `pw.${id}@example.com`,
    password: `Pw!${id}`,
    ...overrides,
  };
}

module.exports = { uid, uniqueEmail, randomUser };
