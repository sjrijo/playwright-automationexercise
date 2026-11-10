const fs = require('fs');
const { test, expect } = require('../../fixtures/baseTest');
const { CartPage } = require('../../pages');
const { authFile } = require('../../utils/authPaths');
const products = require('../../test-data/products.json');
const payment = require('../../test-data/payment.json');

const { first, second } = products.cart;

/** Adds the two reference products to the cart and opens it. */
async function fillCart({ productsPage, cartPage }) {
  await productsPage.open();
  await productsPage.grid.addToCart(first.name);
  await productsPage.grid.continueShopping();
  await productsPage.grid.addToCart(second.name);
  await productsPage.grid.viewCart();
  await expect(cartPage.rows).toHaveCount(2);
}

/** Signs up through the UI from the /login page and lands on Home logged in. */
async function registerViaUi({ loginPage, signupPage, accountStatusPage, homePage }, user) {
  await loginPage.startSignup(user.name, user.email);
  await signupPage.expectLoaded();
  await signupPage.createAccount(user);
  await accountStatusPage.expectAccountCreated();
  await accountStatusPage.continue();
  await homePage.expectLoggedInAs(user.name);
}

/** From /checkout: verifies addresses and order, places it and pays. */
async function reviewAndPay({ checkoutPage, paymentPage }, user) {
  await checkoutPage.expectLoaded();
  await checkoutPage.expectAddressesMatch(user);
  await expect(checkoutPage.orderRows).toHaveCount(2);
  await expect(checkoutPage.totalAmount).toBeVisible();

  await checkoutPage.placeOrder(payment.orderComment);
  await paymentPage.expectLoaded();
  await paymentPage.pay(payment.card);
  await paymentPage.expectOrderPlaced();
  await expect(paymentPage.confirmationMessage).toHaveText(payment.successMessage);
}

async function deleteAccountViaUi({ homePage, accountStatusPage }) {
  await homePage.deleteAccount();
  await accountStatusPage.expectAccountDeleted();
}

test.describe('Checkout & orders', () => {
  test('TC14: place order, register while checkout @smoke', async ({
    productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage, freshUser,
  }) => {
    const pages = { productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage };
    await fillCart(pages);

    await cartPage.proceedToCheckout();
    await cartPage.checkoutModalLoginLink.click();
    await registerViaUi(pages, freshUser);

    await homePage.nav.cart.click();
    await cartPage.proceedToCheckout();
    await reviewAndPay(pages, freshUser);
    await deleteAccountViaUi(pages);
  });

  test('TC15: place order, register before checkout', async ({
    productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage, freshUser,
  }) => {
    const pages = { productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage };
    await homePage.open();
    await homePage.nav.signupLogin.click();
    await loginPage.expectLoaded();
    await registerViaUi(pages, freshUser);

    await fillCart(pages);
    await cartPage.proceedToCheckout();
    await reviewAndPay(pages, freshUser);
    await deleteAccountViaUi(pages);
  });

  test('TC16: place order, login before checkout', async ({
    productsPage, cartPage, loginPage, homePage, checkoutPage, paymentPage, registeredUser,
  }) => {
    await loginPage.open();
    await loginPage.login(registeredUser.email, registeredUser.password);
    await homePage.expectLoggedInAs(registeredUser.name);

    await fillCart({ productsPage, cartPage });
    await cartPage.proceedToCheckout();
    await reviewAndPay({ checkoutPage, paymentPage }, registeredUser);
  });

  test('TC23: verify address details in checkout page', async ({
    productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, freshUser,
  }) => {
    const pages = { productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage };
    await loginPage.open();
    await registerViaUi(pages, freshUser);

    await fillCart(pages);
    await cartPage.proceedToCheckout();
    await checkoutPage.expectLoaded();
    await checkoutPage.expectAddressesMatch(freshUser);
    await deleteAccountViaUi(pages);
  });

  test('TC24: download invoice after purchase order', async ({
    productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage, freshUser,
  }) => {
    const pages = { productsPage, cartPage, loginPage, signupPage, accountStatusPage, homePage, checkoutPage, paymentPage };
    await fillCart(pages);

    await cartPage.proceedToCheckout();
    await cartPage.checkoutModalLoginLink.click();
    await registerViaUi(pages, freshUser);
    await homePage.nav.cart.click();
    await cartPage.proceedToCheckout();
    await reviewAndPay(pages, freshUser);

    const download = await paymentPage.downloadInvoice();
    expect(download.suggestedFilename()).toMatch(/invoice/i);
    const invoice = fs.readFileSync(await download.path(), 'utf-8');
    expect(invoice).toContain(`${freshUser.firstName} ${freshUser.lastName}`);

    await paymentPage.continueButton.click();
    await deleteAccountViaUi(pages);
  });
});

// Uses the shared account created by fixtures/auth.setup.js. Its cart is stored server-side,
// so these tests run one after another and start from an empty cart.
test.describe('Checkout with the shared logged-in user', () => {
  test.use({ useSharedLogin: true });
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ cartPage }) => {
    await cartPage.clear();
  });

  test('logged-in user goes straight to checkout with saved address', async ({ productsPage, cartPage, checkoutPage, sharedUser }) => {
    await productsPage.open();
    await productsPage.grid.addToCart(first.name);
    await productsPage.grid.viewCart();

    await cartPage.proceedToCheckout();
    await expect(cartPage.checkoutModal).toBeHidden();
    await checkoutPage.expectLoaded();
    await expect(checkoutPage.deliveryAddress).toContainText(sharedUser.address1);
    await expect(checkoutPage.orderRows).toHaveCount(1);
  });

  test('cart of a logged-in user persists across sessions', async ({ productsPage, cartPage, browser, sharedUser }, testInfo) => {
    await productsPage.open();
    await productsPage.grid.addToCart(second.name);
    await productsPage.grid.continueShopping();

    // A brand-new browser context with the same login sees the same server-side cart.
    const other = await browser.newContext({ storageState: authFile(testInfo.project.name) });
    try {
      const otherCart = new CartPage(await other.newPage());
      await otherCart.open();
      await otherCart.expectLoggedInAs(sharedUser.name);
      expect(await otherCart.productNames()).toContain(second.name);
    } finally {
      await other.close();
    }
    await cartPage.clear();
  });
});
