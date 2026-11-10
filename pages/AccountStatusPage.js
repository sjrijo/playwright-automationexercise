const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** Confirmation screens: /account_created and /delete_account. */
class AccountStatusPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountCreated = page.getByTestId('account-created');
    this.accountDeleted = page.getByTestId('account-deleted');
    this.continueButton = page.getByTestId('continue-button');
  }

  async expectAccountCreated() {
    await expect(this.page).toHaveURL(/\/account_created$/);
    await expect(this.accountCreated).toHaveText('Account Created!', { ignoreCase: true });
  }

  async expectAccountDeleted() {
    await expect(this.page).toHaveURL(/\/delete_account$/);
    await expect(this.accountDeleted).toHaveText('Account Deleted!', { ignoreCase: true });
  }

  async continue() {
    await this.continueButton.click();
  }
}

module.exports = { AccountStatusPage };
