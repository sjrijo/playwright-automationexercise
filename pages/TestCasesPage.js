const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /test_cases and /api_list – static listing pages. */
class TestCasesPage extends BasePage {
  constructor(page) {
    super(page);
    this.testCasesHeading = page.getByRole('heading', { name: 'Test Cases', exact: true });
    this.testCaseTitles = page.getByRole('heading', { name: /^Test Case \d+:/ });
    this.apiListHeading = page.getByRole('heading', { name: 'APIs List for practice' });
    this.apiTitles = page.getByRole('heading', { name: /^API \d+:/ });
  }

  async expectTestCasesLoaded() {
    await expect(this.page).toHaveURL(/\/test_cases$/);
    await expect(this.testCasesHeading).toBeVisible();
  }

  async expectApiListLoaded() {
    await expect(this.page).toHaveURL(/\/api_list$/);
    await expect(this.apiListHeading).toBeVisible();
  }
}

module.exports = { TestCasesPage };
