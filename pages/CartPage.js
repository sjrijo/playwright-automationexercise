const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /view_cart */
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.breadcrumb = page.locator('.breadcrumb').getByText('Shopping Cart');
    this.rows = page.locator('#cart_info_table tbody tr');
    this.emptyMessage = page.getByText('Cart is empty!');
    this.proceedToCheckoutButton = page.getByText('Proceed To Checkout');

    this.checkoutModal = page.locator('#checkoutModal');
    this.checkoutModalMessage = this.checkoutModal.getByText('Register / Login account to proceed on checkout.');
    this.checkoutModalLoginLink = this.checkoutModal.getByRole('link', { name: 'Register / Login' });
    this.checkoutModalContinue = this.checkoutModal.getByRole('button', { name: 'Continue On Cart' });
  }

  async open() {
    await this.goto('/view_cart');
    await expect(this.breadcrumb).toBeVisible();
  }

  /** The cart row for an exact product name. */
  row(name) {
    return this.rows.filter({ has: this.page.getByRole('link', { name, exact: true }) });
  }

  async itemDetails(name) {
    const row = this.row(name);
    return {
      price: (await row.locator('.cart_price').innerText()).trim(),
      quantity: Number((await row.locator('.cart_quantity').innerText()).trim()),
      total: (await row.locator('.cart_total_price').innerText()).trim(),
    };
  }

  async productNames() {
    return this.rows.locator('.cart_description h4').allInnerTexts();
  }

  async removeItem(name) {
    await this.waitForScripts();
    const row = this.row(name);
    await row.locator('.cart_quantity_delete').click();
    await expect(row).toHaveCount(0);
  }

  /** Empties the cart (rows are removed client-side one at a time). */
  async clear() {
    await this.open();
    await this.waitForScripts();
    while ((await this.rows.count()) > 0) {
      const first = this.rows.first();
      const id = await first.getAttribute('id');
      await first.locator('.cart_quantity_delete').click();
      await expect(this.page.locator(`#${id}`)).toHaveCount(0);
    }
    await expect(this.emptyMessage).toBeVisible();
  }

  async proceedToCheckout() {
    await this.waitForScripts();
    await this.proceedToCheckoutButton.click();
  }
}

module.exports = { CartPage };
