const { test, expect } = require('./baseTest');
const { loadEnv } = require('../utils/env');
const { authFile, saveSharedUser } = require('../utils/authPaths');
const { randomUser } = require('../utils/dataFactory');

/**
 * Logs in ONCE per browser project and saves the browser state (cookies) to .auth/<project>.json.
 * Tests that call `test.use({ useSharedLogin: true })` start from that state.
 *
 * Each browser project gets its own user because the cart is stored server-side per account,
 * so parallel browsers sharing one account would interfere with each other.
 */
const env = loadEnv();
const useExistingAccount = Boolean(env.USER_EMAIL && env.USER_PASSWORD);
const projects = useExistingAccount ? env.BROWSERS.slice(0, 1) : env.BROWSERS;

if (useExistingAccount && env.BROWSERS.length > 1) {
  console.warn('USER_EMAIL is set: the shared account is reused by every browser project – run them one at a time.');
}

for (const projectName of projects) {
  test(`authenticate shared user for ${projectName}`, async ({ apiClient, loginPage, homePage, page }) => {
    let user;
    if (useExistingAccount) {
      const details = await apiClient.getUserByEmail(env.USER_EMAIL);
      expect(details.responseCode, `USER_EMAIL ${env.USER_EMAIL} does not exist`).toBe(200);
      const u = details.user;
      user = {
        name: u.name, email: env.USER_EMAIL, password: env.USER_PASSWORD, title: u.title,
        firstName: u.first_name, lastName: u.last_name, company: u.company,
        address1: u.address1, address2: u.address2, country: u.country, state: u.state,
        city: u.city, zipcode: u.zipcode, mobileNumber: '', preexisting: true,
      };
    } else {
      user = randomUser();
      await apiClient.createAccountOrThrow(user);
    }

    await loginPage.open();
    await loginPage.login(user.email, user.password);
    await homePage.expectLoggedInAs(user.name);

    await page.context().storageState({ path: authFile(projectName) });
    saveSharedUser(projectName, user);
  });
}

// When only one project uses an existing account, point the others at the same files.
if (useExistingAccount) {
  test('share existing-account state with remaining projects', async () => {
    const fs = require('fs');
    const { userFile } = require('../utils/authPaths');
    const [first, ...rest] = env.BROWSERS;
    for (const p of rest) {
      fs.copyFileSync(authFile(first), authFile(p));
      fs.copyFileSync(userFile(first), userFile(p));
    }
  });
}
