const { test, expect } = require('../../fixtures/baseTest');
const products = require('../../test-data/products.json');

const priceValue = (text) => Number(text.replace(/[^\d]/g, ''));

// These tests run as anonymous visitors: the guest cart lives in the browser session,
// so every test gets its own isolated cart.
test.describe('Cart', () => {
  test('TC12: add products in cart @smoke', async ({ productsPage, cartPage }) => {
    const { first, second } = products.cart;
    await productsPage.open();

    await productsPage.grid.addToCart(first.name);
    await productsPage.grid.continueShopping();
    await productsPage.grid.addToCart(second.name);
    await productsPage.grid.viewCart();

    await expect(cartPage.rows).toHaveCount(2);
    for (const item of [first, second]) {
      const details = await cartPage.itemDetails(item.name);
      expect(details.price).toBe(item.price);
      expect(details.quantity).toBe(1);
      expect(details.total).toBe(item.price);
    }
  });

  test('TC13: verify product quantity in cart', async ({ productDetailPage, cartPage }) => {
    const product = products.productDetails[0];
    await productDetailPage.open(product.id);
    await productDetailPage.addToCart(4);
    await productDetailPage.viewCart();

    const details = await cartPage.itemDetails(product.name);
    expect(details.quantity).toBe(4);
    expect(priceValue(details.total)).toBe(priceValue(product.price) * 4);
  });

  test('adding the same product twice increases its quantity', async ({ productsPage, cartPage }) => {
    const { first } = products.cart;
    await productsPage.open();
    await productsPage.grid.addToCart(first.name);
    await productsPage.grid.continueShopping();
    await productsPage.grid.addToCart(first.name);
    await productsPage.grid.viewCart();

    await expect(cartPage.rows).toHaveCount(1);
    expect((await cartPage.itemDetails(first.name)).quantity).toBe(2);
  });

  test('TC17: remove products from cart', async ({ homePage, cartPage }) => {
    const { first, second } = products.cart;
    await homePage.open();
    await homePage.products.addToCart(first.name);
    await homePage.products.continueShopping();
    await homePage.products.addToCart(second.name);
    await homePage.products.viewCart();
    await expect(cartPage.rows).toHaveCount(2);

    await cartPage.removeItem(first.name);
    await expect(cartPage.rows).toHaveCount(1);
    expect(await cartPage.productNames()).toEqual([second.name]);

    await cartPage.removeItem(second.name);
    await expect(cartPage.emptyMessage).toBeVisible();
  });

  test('empty cart shows the empty message', async ({ cartPage }) => {
    await cartPage.open();
    await expect(cartPage.rows).toHaveCount(0);
    await expect(cartPage.emptyMessage).toBeVisible();
  });

  test('TC20: search products and verify cart after login', async ({ productsPage, cartPage, loginPage, homePage, registeredUser }) => {
    const { term } = products.searches[0];
    await productsPage.open();
    await productsPage.search(term);

    const found = await productsPage.grid.names();
    expect(found.length).toBeGreaterThan(0);
    for (const name of found) {
      await productsPage.grid.addToCart(name);
      await productsPage.grid.continueShopping();
    }

    await cartPage.open();
    expect(await cartPage.productNames()).toEqual(expect.arrayContaining(found));

    await cartPage.nav.signupLogin.click();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await homePage.expectLoggedInAs(registeredUser.name);

    await cartPage.open();
    expect(await cartPage.productNames()).toEqual(expect.arrayContaining(found));
  });

  test('TC22: add to cart from recommended items', async ({ homePage, cartPage }) => {
    await homePage.open();
    await homePage.scrollToBottom();
    await expect(homePage.recommendedHeading).toBeVisible();

    // The Bootstrap carousel pauses on hover, so the active slide stays put while we click.
    await homePage.page.locator('#recommended-item-carousel').hover();
    const name = (await homePage.recommended.names())[0];
    await homePage.recommended.addNthToCart(0);
    await homePage.recommended.viewCart();

    expect(await cartPage.productNames()).toContain(name);
  });

  test('TC14 (part): guest checkout asks the visitor to register or log in', async ({ productsPage, cartPage }) => {
    await productsPage.open();
    await productsPage.grid.addToCart(products.cart.first.name);
    await productsPage.grid.viewCart();

    await cartPage.proceedToCheckout();
    await expect(cartPage.checkoutModal).toBeVisible();
    await expect(cartPage.checkoutModalMessage).toBeVisible();
    await cartPage.checkoutModalContinue.click();
    await expect(cartPage.checkoutModal).toBeHidden();
  });
});
