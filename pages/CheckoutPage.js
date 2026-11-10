const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /checkout – address details and order review. */
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    this.addressDetailsHeading = page.getByRole('heading', { name: 'Address Details' });
    this.reviewOrderHeading = page.getByRole('heading', { name: 'Review Your Order' });
    this.deliveryAddress = page.locator('#address_delivery');
    this.billingAddress = page.locator('#address_invoice');
    this.orderRows = page.locator('#cart_info tbody tr[id^="product-"]');
    this.totalAmount = page.getByRole('row').filter({ hasText: 'Total Amount' }).locator('.cart_total_price');
    this.comment = page.locator('#ordermsg textarea');
    this.placeOrderButton = page.getByRole('link', { name: 'Place Order' });
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/checkout$/);
    await expect(this.addressDetailsHeading).toBeVisible();
    await expect(this.reviewOrderHeading).toBeVisible();
  }

  /** Asserts both address blocks show the user's registration details. */
  async expectAddressesMatch(user) {
    for (const block of [this.deliveryAddress, this.billingAddress]) {
      await expect(block).toContainText(`${user.title}. ${user.firstName} ${user.lastName}`);
      await expect(block).toContainText(user.company);
      await expect(block).toContainText(user.address1);
      await expect(block).toContainText(user.address2);
      await expect(block).toContainText(`${user.city} ${user.state} ${user.zipcode}`);
      await expect(block).toContainText(user.country);
      await expect(block).toContainText(user.mobileNumber);
    }
  }

  async placeOrder(comment) {
    if (comment) await this.comment.fill(comment);
    await this.placeOrderButton.click();
  }
}

module.exports = { CheckoutPage };
