const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { ProductGrid } = require('./components/ProductGrid');
const { Sidebar } = require('./components/Sidebar');

/** /products, plus the search, category and brand listings that reuse its layout. */
class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    this.allProductsHeading = page.getByRole('heading', { name: 'All Products' });
    this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products' });
    this.searchInput = page.getByPlaceholder('Search Product');
    // Icon-only search button without an accessible name.
    this.searchButton = page.locator('#submit_search');
    this.grid = new ProductGrid(page, '.features_items');
    this.sidebar = new Sidebar(page);
  }

  async open() {
    await this.goto('/products');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/products$/);
    await expect(this.allProductsHeading).toBeVisible();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await expect(this.searchedProductsHeading).toBeVisible();
  }

  listingHeading(text) {
    return this.page.locator('.features_items').getByRole('heading', { name: text });
  }
}

module.exports = { ProductsPage };
