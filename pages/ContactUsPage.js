const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /contact_us */
class ContactUsPage extends BasePage {
  constructor(page) {
    super(page);
    this.getInTouchHeading = page.getByRole('heading', { name: 'Get In Touch' });
    this.name = page.getByTestId('name');
    this.email = page.getByTestId('email');
    this.subject = page.getByTestId('subject');
    this.message = page.getByTestId('message');
    // File input has no label or test id.
    this.uploadFile = page.locator('input[name="upload_file"]');
    this.submitButton = page.getByTestId('submit-button');
    this.successMessage = page.locator('#contact-page').getByText('Success! Your details have been submitted successfully.');
    this.homeButton = page.locator('#form-section').getByRole('link', { name: 'Home' });
  }

  async open() {
    await this.goto('/contact_us');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/contact_us$/);
    await expect(this.getInTouchHeading).toBeVisible();
  }

  async fillForm({ name, email, subject, message, file }) {
    if (name !== undefined) await this.name.fill(name);
    if (email !== undefined) await this.email.fill(email);
    if (subject !== undefined) await this.subject.fill(subject);
    if (message !== undefined) await this.message.fill(message);
    if (file) await this.uploadFile.setInputFiles(file);
  }

  /** Submits and accepts the browser confirm() dialog the site shows. */
  async submit() {
    // The submit handler (confirm + success message) is bound by an inline script at the very end
    // of the page, after a slow synchronous Google Maps script. Clicking earlier does a plain POST
    // that just reloads the empty form, so wait for the page to finish loading first.
    await this.waitForScripts();
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.submitButton.click();
  }
}

module.exports = { ContactUsPage };
