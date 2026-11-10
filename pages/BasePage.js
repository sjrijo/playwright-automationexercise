const { expect } = require('@playwright/test');

/** Parts shared by every page: header navigation, footer subscription and scroll-up arrow. */
class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.header = page.locator('#header');

    this.nav = {
      home: this.header.getByRole('link', { name: 'Home' }),
      products: this.header.getByRole('link', { name: 'Products' }),
      cart: this.header.getByRole('link', { name: 'Cart' }),
      signupLogin: this.header.getByRole('link', { name: 'Signup / Login' }),
      logout: this.header.getByRole('link', { name: 'Logout' }),
      deleteAccount: this.header.getByRole('link', { name: 'Delete Account' }),
      testCases: this.header.getByRole('link', { name: 'Test Cases' }),
      apiTesting: this.header.getByRole('link', { name: 'API Testing' }),
      contactUs: this.header.getByRole('link', { name: 'Contact us' }),
    };
    this.loggedInAs = this.header.getByText(/Logged in as/);

    this.subscriptionHeading = page.getByRole('heading', { name: 'Subscription' });
    this.subscriptionEmail = page.getByPlaceholder('Your email address');
    // Icon-only button without an accessible name, so an id is the only stable hook.
    this.subscribeButton = page.locator('#subscribe');
    this.subscriptionSuccess = page.getByText('You have been successfully subscribed!');
    this.scrollUpArrow = page.locator('#scrollUp');
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  /**
   * Waits until the page's scripts have run. The site binds most click handlers in inline scripts
   * at the end of <body>; clicking before then silently does nothing (or does a plain form POST).
   */
  async waitForScripts() {
    await this.page.waitForLoadState('load');
  }

  async expectLoggedInAs(name) {
    await expect(this.loggedInAs).toContainText(name);
  }

  async expectLoggedOut() {
    await expect(this.nav.signupLogin).toBeVisible();
    await expect(this.loggedInAs).toBeHidden();
  }

  async logout() {
    await this.nav.logout.click();
  }

  async deleteAccount() {
    await this.nav.deleteAccount.click();
  }

  async subscribe(email) {
    await this.subscriptionHeading.scrollIntoViewIfNeeded();
    await this.subscriptionEmail.fill(email);
    await this.subscribeButton.click();
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }
}

module.exports = { BasePage };
