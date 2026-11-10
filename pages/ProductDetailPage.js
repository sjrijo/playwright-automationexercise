const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /product_details/:id */
class ProductDetailPage extends BasePage {
  constructor(page) {
    super(page);
    this.info = page.locator('.product-information');
    this.name = this.info.getByRole('heading', { level: 2 });
    this.category = this.info.getByText(/^Category:/);
    this.price = this.info.getByText(/^Rs\. \d+/);
    this.availability = this.info.locator('p').filter({ hasText: 'Availability:' });
    this.condition = this.info.locator('p').filter({ hasText: 'Condition:' });
    this.brand = this.info.locator('p').filter({ hasText: 'Brand:' });
    // The "Quantity:" label is not associated with its input, so use the id.
    this.quantity = page.locator('#quantity');
    this.addToCartButton = this.info.getByRole('button', { name: 'Add to cart' });

    this.addedModal = page.locator('#cartModal');
    this.viewCartLink = this.addedModal.getByRole('link', { name: 'View Cart' });
    this.continueShoppingButton = this.addedModal.getByRole('button', { name: 'Continue Shopping' });

    this.writeReviewTab = page.getByRole('link', { name: 'Write Your Review' });
    this.reviewName = page.getByPlaceholder('Your Name');
    this.reviewEmail = page.getByPlaceholder('Email Address', { exact: true });
    this.reviewText = page.getByPlaceholder('Add Review Here!');
    this.reviewSubmit = page.locator('#review-form').getByRole('button', { name: 'Submit' });
    this.reviewSuccess = page.getByText('Thank you for your review.');
  }

  async open(productId) {
    await this.goto(`/product_details/${productId}`);
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/product_details\/\d+$/);
    await expect(this.name).toBeVisible();
  }

  async addToCart(quantity = 1) {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
    await expect(this.addedModal).toBeVisible();
  }

  async viewCart() {
    await this.viewCartLink.click();
  }

  async submitReview({ name, email, review }) {
    await expect(this.writeReviewTab).toBeVisible();
    await this.reviewName.fill(name);
    await this.reviewEmail.fill(email);
    await this.reviewText.fill(review);
    await this.reviewSubmit.click();
  }
}

module.exports = { ProductDetailPage };
