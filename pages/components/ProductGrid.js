const { expect } = require('@playwright/test');

/**
 * The product-card grid used on Home, Products, Search, Category and Brand pages,
 * plus the "Added!" modal that appears after adding to cart.
 */
class ProductGrid {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {string} rootSelector container of the cards
   */
  constructor(page, rootSelector = '.features_items') {
    this.page = page;
    this.root = page.locator(rootSelector);
    this.cards = this.root.locator('.product-image-wrapper');
    this.title = this.root.getByRole('heading', { level: 2 }).first();

    this.addedModal = page.locator('#cartModal');
    this.continueShoppingButton = this.addedModal.getByRole('button', { name: 'Continue Shopping' });
    this.viewCartLink = this.addedModal.getByRole('link', { name: 'View Cart' });
  }

  /** The card whose product name is exactly `name`. */
  card(name) {
    return this.cards.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  /** Product names in the grid, in display order. */
  async names() {
    return this.cards.locator('.productinfo p').allInnerTexts();
  }

  async addToCart(name) {
    // Without an href the "Add to cart" anchor has no link role, so match it by text.
    await this.card(name).locator('.productinfo').getByText('Add to cart').click();
    await expect(this.addedModal).toBeVisible();
  }

  async addNthToCart(index) {
    await this.cards.nth(index).locator('.productinfo').getByText('Add to cart').click();
    await expect(this.addedModal).toBeVisible();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
    await expect(this.addedModal).toBeHidden();
  }

  async viewCart() {
    await this.viewCartLink.click();
  }

  async openProduct(name) {
    await this.card(name).getByRole('link', { name: 'View Product' }).click();
  }

  async openNthProduct(index) {
    await this.cards.nth(index).getByRole('link', { name: 'View Product' }).click();
  }
}

module.exports = { ProductGrid };
