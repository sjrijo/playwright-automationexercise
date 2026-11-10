const { test, expect } = require('../../fixtures/baseTest');
const products = require('../../test-data/products.json');
const { uniqueEmail } = require('../../utils/dataFactory');

test.describe('Products', () => {
  test('TC8: verify all products and product detail page @smoke', async ({ homePage, productsPage, productDetailPage }) => {
    await homePage.open();
    await homePage.nav.products.click();
    await productsPage.expectLoaded();
    await expect(productsPage.grid.cards).toHaveCount(products.totalProducts);

    await productsPage.grid.openNthProduct(0);
    await productDetailPage.expectLoaded();
    for (const field of ['name', 'category', 'price', 'availability', 'condition', 'brand']) {
      await expect(productDetailPage[field], field).toBeVisible();
    }
  });

  for (const p of products.productDetails) {
    test(`product detail page shows correct data for "${p.name}"`, async ({ productDetailPage }) => {
      await productDetailPage.open(p.id);
      await expect(productDetailPage.name).toHaveText(p.name);
      await expect(productDetailPage.price).toHaveText(p.price);
      await expect(productDetailPage.category).toHaveText(`Category: ${p.category}`);
      await expect(productDetailPage.brand).toHaveText(`Brand: ${p.brand}`);
    });
  }

  for (const { term, expected } of products.searches) {
    test(`TC9: search product "${term}"`, async ({ productsPage }) => {
      await productsPage.open();
      await productsPage.search(term);
      await expect(productsPage.grid.cards).not.toHaveCount(0);
      expect(await productsPage.grid.names()).toEqual(expect.arrayContaining(expected));
    });
  }

  test('TC9: search with no matches shows no products', async ({ productsPage }) => {
    await productsPage.open();
    await productsPage.search(products.noResultsTerm);
    await expect(productsPage.grid.cards).toHaveCount(0);
  });

  test('TC18: view category products', async ({ homePage, productsPage, page }) => {
    const [women, men] = [products.categories[0], products.categories[2]];
    await homePage.open();
    await expect(homePage.sidebar.categoryHeading).toBeVisible();

    await homePage.sidebar.openCategory(women.main, women.sub);
    await expect(page).toHaveURL(new RegExp(`${women.path}$`));
    await expect(productsPage.listingHeading(women.heading)).toBeVisible();

    await productsPage.sidebar.openCategory(men.main, men.sub);
    await expect(page).toHaveURL(new RegExp(`${men.path}$`));
    await expect(productsPage.listingHeading(men.heading)).toBeVisible();
  });

  for (const c of products.categories) {
    test(`category page lists products: ${c.heading}`, async ({ productsPage, page }) => {
      await page.goto(c.path);
      await expect(productsPage.listingHeading(c.heading)).toBeVisible();
      await expect(productsPage.grid.cards).not.toHaveCount(0);
    });
  }

  test('TC19: view and cart brand products', async ({ productsPage, page }) => {
    const [first, second] = products.brands;
    await productsPage.open();
    await expect(productsPage.sidebar.brandsHeading).toBeVisible();

    await productsPage.sidebar.openBrand(first.name);
    await expect(page).toHaveURL(new RegExp(`/brand_products/${encodeURIComponent(first.name)}$`));
    await expect(productsPage.listingHeading(`Brand - ${first.name} Products`)).toBeVisible();
    await expect(productsPage.grid.cards).toHaveCount(first.count);

    await productsPage.sidebar.openBrand(second.name);
    await expect(productsPage.listingHeading(`Brand - ${second.name} Products`)).toBeVisible();
    await expect(productsPage.grid.cards).toHaveCount(second.count);
  });

  for (const b of products.brands) {
    test(`brand sidebar count matches listing: ${b.name}`, async ({ productsPage }) => {
      await productsPage.open();
      await expect(productsPage.sidebar.brandLink(b.name)).toContainText(`(${b.count})`);
      await productsPage.sidebar.openBrand(b.name);
      await expect(productsPage.grid.cards).toHaveCount(b.count);
    });
  }

  test('TC21: add review on product', async ({ productsPage, productDetailPage }) => {
    await productsPage.open();
    await productsPage.grid.openNthProduct(0);
    await productDetailPage.expectLoaded();
    await productDetailPage.submitReview({
      name: 'Playwright Reviewer',
      email: uniqueEmail('review'),
      review: 'Automated review left by a Playwright test.',
    });
    await expect(productDetailPage.reviewSuccess).toBeVisible();
  });
});
