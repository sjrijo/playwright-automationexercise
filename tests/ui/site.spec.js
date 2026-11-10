const path = require('path');
const { test, expect } = require('../../fixtures/baseTest');
const contact = require('../../test-data/contact.json');
const { uniqueEmail } = require('../../utils/dataFactory');
const { isInvalid } = require('../../utils/formValidation');

test.describe('Home page & navigation', () => {
  test('home page loads @smoke', async ({ homePage }) => {
    await homePage.open();
    await expect(homePage.featuresHeading).toBeVisible();
    await expect(homePage.products.cards.first()).toBeVisible();
    await expect(homePage.sidebar.categoryHeading).toBeVisible();
    await expect(homePage.sidebar.brandsHeading).toBeVisible();
  });

  test('header navigation links open the right pages', async ({ homePage, page }) => {
    const targets = [
      ['products', /\/products$/],
      ['cart', /\/view_cart$/],
      ['signupLogin', /\/login$/],
      ['testCases', /\/test_cases$/],
      ['apiTesting', /\/api_list$/],
      ['contactUs', /\/contact_us$/],
      ['home', /\/$/],
    ];
    await homePage.open();
    for (const [link, url] of targets) {
      await test.step(link, async () => {
        await homePage.nav[link].click();
        await expect(page).toHaveURL(url);
      });
    }
  });

  test('TC7: verify Test Cases page', async ({ homePage, testCasesPage }) => {
    await homePage.open();
    await homePage.nav.testCases.click();
    await testCasesPage.expectTestCasesLoaded();
    await expect(testCasesPage.testCaseTitles).toHaveCount(26);
  });

  test('API list page lists all practice APIs', async ({ homePage, testCasesPage }) => {
    await homePage.open();
    await homePage.nav.apiTesting.click();
    await testCasesPage.expectApiListLoaded();
    await expect(testCasesPage.apiTitles).toHaveCount(14);
  });

  test('TC10: verify subscription in home page', async ({ homePage }) => {
    await homePage.open();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeVisible();
    await homePage.subscribe(uniqueEmail('sub'));
    await expect(homePage.subscriptionSuccess).toBeVisible();
  });

  test('TC11: verify subscription in cart page', async ({ homePage, cartPage }) => {
    await homePage.open();
    await homePage.nav.cart.click();
    await expect(cartPage.breadcrumb).toBeVisible();
    await cartPage.scrollToBottom();
    await expect(cartPage.subscriptionHeading).toBeVisible();
    await cartPage.subscribe(uniqueEmail('sub'));
    await expect(cartPage.subscriptionSuccess).toBeVisible();
  });

  test('TC25: scroll up using the arrow button', async ({ homePage }) => {
    await homePage.open();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeInViewport();

    await homePage.scrollUpArrow.click();
    await expect(homePage.heroHeading).toBeInViewport();
  });

  test('TC26: scroll up without the arrow button', async ({ homePage }) => {
    await homePage.open();
    await homePage.scrollToBottom();
    await expect(homePage.subscriptionHeading).toBeInViewport();

    await homePage.scrollToTop();
    await expect(homePage.heroHeading).toBeInViewport();
  });
});

test.describe('Contact us', () => {
  test('TC6: contact us form with file upload', async ({ homePage, contactUsPage }) => {
    await homePage.open();
    await homePage.nav.contactUs.click();
    await contactUsPage.expectLoaded();

    await contactUsPage.fillForm({
      ...contact.valid,
      email: uniqueEmail('contact'),
      file: path.resolve(__dirname, '../..', contact.uploadFile),
    });
    await contactUsPage.submit();
    await expect(contactUsPage.successMessage).toHaveText(contact.successMessage);

    await contactUsPage.homeButton.click();
    await homePage.expectLoaded();
  });

  test('contact form rejects an invalid email', async ({ contactUsPage, page }) => {
    await contactUsPage.open();
    await contactUsPage.fillForm({ ...contact.valid, email: 'not-an-email' });
    await contactUsPage.submitButton.click();

    expect(await isInvalid(contactUsPage.email)).toBe(true);
    await expect(contactUsPage.successMessage).toBeHidden();
    await expect(page).toHaveURL(/\/contact_us$/);
  });
});
