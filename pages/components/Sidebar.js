/** Left sidebar with the Category accordion and the Brands list. */
class Sidebar {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.root = page.locator('.left-sidebar');
    this.categoryHeading = this.root.getByRole('heading', { name: 'Category' });
    this.brandsHeading = this.root.getByRole('heading', { name: 'Brands' });
    this.brandsList = this.root.locator('.brands-name');
  }

  /** e.g. openCategory('Women', 'Dress') */
  async openCategory(main, sub) {
    // Accessible name has an icon-glyph prefix (" Women"), and "Men" is a suffix of "Women",
    // so match the whole word at the end of the name.
    await this.root.getByRole('link', { name: new RegExp(`(^|\\s)${main}$`) }).click();
    // Each accordion panel's id equals its category name (#Women, #Men, #Kids).
    const panel = this.page.locator(`#${main}`);
    await panel.getByRole('link', { name: sub }).click();
  }

  brandLink(brand) {
    // Accessible name is "(6)Polo" – the count badge comes first.
    const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.brandsList.getByRole('link', { name: new RegExp(`^\\(\\d+\\)\\s*${escaped}$`) });
  }

  async openBrand(brand) {
    await this.brandLink(brand).click();
  }
}

module.exports = { Sidebar };
