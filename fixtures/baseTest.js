const base = require('@playwright/test');
const allure = require('allure-js-commons');
const pages = require('../pages');
const { ApiClient } = require('../utils/apiClient');
const { randomUser } = require('../utils/dataFactory');
const { blockAds } = require('../utils/blockAds');
const { authFile, readSharedUser } = require('../utils/authPaths');

/**
 * Custom test object used by every spec:
 *   - page objects are injected as fixtures (homePage, loginPage, cartPage, ...)
 *   - `test.use({ useSharedLogin: true })` starts each test already logged in, using the
 *     storageState saved by fixtures/auth.setup.js (no UI login per test)
 *   - `registeredUser` / `freshUser` give each test its own throwaway account
 *   - ads are blocked in every browser context
 */
const test = base.test.extend({
  // ---- options -------------------------------------------------------------------
  useSharedLogin: [false, { option: true }],

  storageState: async ({ useSharedLogin, storageState }, use, testInfo) => {
    await use(useSharedLogin ? authFile(testInfo.project.name) : storageState);
  },

  context: async ({ context }, use) => {
    await blockAds(context);
    await use(context);
  },

  // Labels every test in the Allure report: epic by project, severity by tag.
  allureLabels: [
    async ({}, use, testInfo) => {
      const project = testInfo.project.name;
      await allure.epic(project === 'api' ? 'API' : project === 'setup' || project === 'teardown' ? 'Test setup' : 'Web UI');
      await allure.severity(testInfo.tags.includes('@smoke') ? 'critical' : 'normal');
      await allure.parameter('browser', project);
      await use();
    },
    { auto: true },
  ],

  // ---- page objects --------------------------------------------------------------
  homePage: async ({ page }, use) => use(new pages.HomePage(page)),
  loginPage: async ({ page }, use) => use(new pages.LoginPage(page)),
  signupPage: async ({ page }, use) => use(new pages.SignupPage(page)),
  accountStatusPage: async ({ page }, use) => use(new pages.AccountStatusPage(page)),
  productsPage: async ({ page }, use) => use(new pages.ProductsPage(page)),
  productDetailPage: async ({ page }, use) => use(new pages.ProductDetailPage(page)),
  cartPage: async ({ page }, use) => use(new pages.CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new pages.CheckoutPage(page)),
  paymentPage: async ({ page }, use) => use(new pages.PaymentPage(page)),
  contactUsPage: async ({ page }, use) => use(new pages.ContactUsPage(page)),
  testCasesPage: async ({ page }, use) => use(new pages.TestCasesPage(page)),

  // ---- data / API ----------------------------------------------------------------
  apiClient: async ({ request }, use) => use(new ApiClient(request)),

  /** The shared logged-in user's profile (pair with useSharedLogin: true). */
  sharedUser: async ({}, use, testInfo) => use(readSharedUser(testInfo.project.name)),

  /** A user created via the API before the test and deleted after it. */
  registeredUser: async ({ apiClient }, use) => {
    const user = randomUser();
    await apiClient.createAccountOrThrow(user);
    await use(user);
    await apiClient.deleteAccount(user).catch(() => {});
  },

  /**
   * Profile for a user the test registers itself through the UI.
   * Deleted via the API afterwards in case the test failed before deleting it.
   */
  freshUser: async ({ apiClient }, use) => {
    const user = randomUser();
    await use(user);
    await apiClient.deleteAccount(user).catch(() => {});
  },
});

module.exports = { test, expect: base.expect, allure };
