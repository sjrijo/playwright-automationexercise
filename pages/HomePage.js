const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { ProductGrid } = require('./components/ProductGrid');
const { Sidebar } = require('./components/Sidebar');

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    // The carousel repeats this heading on every slide; only the active one is visible.
    this.heroHeading = page
      .getByRole('heading', { name: 'Full-Fledged practice website for Automation Engineers' })
      .filter({ visible: true })
      .first();
    this.featuresHeading = page.getByRole('heading', { name: 'Features Items' });
    this.products = new ProductGrid(page, '.features_items');
    this.sidebar = new Sidebar(page);

    this.recommendedHeading = page.getByRole('heading', { name: 'recommended items' });
    this.recommended = new ProductGrid(page, '#recommended-item-carousel .item.active');
  }

  async open() {
    await this.goto('/');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/$/);
    await expect(this.page).toHaveTitle('Automation Exercise');
    await expect(this.heroHeading).toBeVisible();
  }
}

module.exports = { HomePage };
