const { test, expect } = require('../../fixtures/baseTest');
const users = require('../../test-data/users.json');

test.describe('Registration & login', () => {
  test('TC1: register user @smoke', async ({ homePage, loginPage, signupPage, accountStatusPage, freshUser }) => {
    await homePage.open();
    await homePage.nav.signupLogin.click();
    await loginPage.expectLoaded();

    await loginPage.startSignup(freshUser.name, freshUser.email);
    await signupPage.expectLoaded();
    await expect(signupPage.name).toHaveValue(freshUser.name);
    await expect(signupPage.email).toHaveValue(freshUser.email);
    await expect(signupPage.addressInfoHeading).toBeVisible();

    await signupPage.createAccount(freshUser);
    await accountStatusPage.expectAccountCreated();
    await accountStatusPage.continue();
    await homePage.expectLoggedInAs(freshUser.name);

    await homePage.deleteAccount();
    await accountStatusPage.expectAccountDeleted();
    await accountStatusPage.continue();
    await homePage.expectLoggedOut();
  });

  test('TC2: login with correct email and password @smoke', async ({ homePage, loginPage, accountStatusPage, registeredUser }) => {
    await homePage.open();
    await homePage.nav.signupLogin.click();
    await loginPage.expectLoaded();

    await loginPage.login(registeredUser.email, registeredUser.password);
    await homePage.expectLoggedInAs(registeredUser.name);

    await homePage.deleteAccount();
    await accountStatusPage.expectAccountDeleted();
  });

  for (const { case: name, email, password } of users.invalidLogins) {
    test(`TC3: login with incorrect credentials (${name})`, async ({ loginPage }) => {
      await loginPage.open();
      await loginPage.login(email, password);
      await expect(loginPage.loginError).toHaveText(users.messages.loginError);
      await loginPage.expectLoggedOut();
    });
  }

  test('TC3: login with a wrong password for an existing user', async ({ loginPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.login(registeredUser.email, `${registeredUser.password}-wrong`);
    await expect(loginPage.loginError).toBeVisible();
    await loginPage.expectLoggedOut();
  });

  test('TC4: logout user', async ({ homePage, loginPage, page, registeredUser }) => {
    await loginPage.open();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await homePage.expectLoggedInAs(registeredUser.name);

    await homePage.logout();
    await loginPage.expectLoaded();
    await loginPage.expectLoggedOut();

    // The session is really gone: protected pages bounce back to login.
    await page.goto('/checkout');
    await expect(loginPage.nav.signupLogin).toBeVisible();
  });

  test('TC5: register user with an existing email', async ({ loginPage, signupPage, registeredUser }) => {
    await loginPage.open();
    await loginPage.startSignup('Someone Else', registeredUser.email);
    await expect(loginPage.signupError).toHaveText(users.messages.emailExists);
    await expect(signupPage.accountInfoHeading).toBeHidden();
  });

  test('login form requires a valid email address', async ({ loginPage, page }) => {
    const { isInvalid, validationMessage } = require('../../utils/formValidation');
    await loginPage.open();
    await loginPage.login('not-an-email', 'whatever');
    expect(await isInvalid(loginPage.loginEmail)).toBe(true);
    expect(await validationMessage(loginPage.loginEmail)).not.toBe('');
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Shared logged-in session', () => {
  test.use({ useSharedLogin: true });

  test('starts already logged in via saved storage state', async ({ homePage, sharedUser }) => {
    await homePage.open();
    await homePage.expectLoggedInAs(sharedUser.name);
    await expect(homePage.nav.logout).toBeVisible();
    await expect(homePage.nav.deleteAccount).toBeVisible();
  });
});
