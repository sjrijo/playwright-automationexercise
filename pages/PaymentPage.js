const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /payment and the /payment_done confirmation. */
class PaymentPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Payment', exact: true });
    this.nameOnCard = page.getByTestId('name-on-card');
    this.cardNumber = page.getByTestId('card-number');
    this.cvc = page.getByTestId('cvc');
    this.expiryMonth = page.getByTestId('expiry-month');
    this.expiryYear = page.getByTestId('expiry-year');
    this.payButton = page.getByTestId('pay-button');

    this.orderPlaced = page.getByTestId('order-placed');
    this.confirmationMessage = page.getByText('Congratulations! Your order has been confirmed!');
    this.downloadInvoiceButton = page.getByRole('link', { name: 'Download Invoice' });
    this.continueButton = page.getByTestId('continue-button');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/payment$/);
    await expect(this.heading).toBeVisible();
  }

  async pay(card) {
    await this.nameOnCard.fill(card.nameOnCard);
    await this.cardNumber.fill(card.number);
    await this.cvc.fill(card.cvc);
    await this.expiryMonth.fill(card.expiryMonth);
    await this.expiryYear.fill(card.expiryYear);
    await this.payButton.click();
  }

  async expectOrderPlaced() {
    await expect(this.page).toHaveURL(/\/payment_done\/\d+/);
    await expect(this.orderPlaced).toHaveText('Order Placed!', { ignoreCase: true });
    await expect(this.confirmationMessage).toBeVisible();
  }

  /** Clicks "Download Invoice" and returns the Playwright Download. */
  async downloadInvoice() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadInvoiceButton.click(),
    ]);
    return download;
  }
}

module.exports = { PaymentPage };
