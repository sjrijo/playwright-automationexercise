const { test, expect } = require('../../fixtures/baseTest');
const products = require('../../test-data/products.json');

/**
 * APIs 1-6 from https://automationexercise.com/api_list.
 * The API always answers HTTP 200; the real status is the body's `responseCode`.
 */
test.describe('Products & brands API', () => {
  test('API 1: GET all products list @smoke', async ({ apiClient }) => {
    const body = await apiClient.getProducts();

    expect(body.responseCode).toBe(200);
    expect(body.products).toHaveLength(products.totalProducts);
    for (const p of body.products) {
      expect(p).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          price: expect.stringMatching(/^Rs\. \d+$/),
          brand: expect.any(String),
          category: expect.objectContaining({ category: expect.any(String) }),
        }),
      );
    }
  });

  test('API 1: products list contains the known reference products', async ({ apiClient }) => {
    const body = await apiClient.getProducts();
    for (const expected of products.productDetails) {
      const actual = body.products.find((p) => p.id === expected.id);
      expect(actual, `product ${expected.id}`).toBeDefined();
      expect(actual.name).toBe(expected.name);
      expect(actual.price).toBe(expected.price);
      expect(actual.brand).toBe(expected.brand);
    }
  });

  test('API 2: POST to products list is not supported', async ({ apiClient }) => {
    const body = await apiClient.postProducts();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  test('API 3: GET all brands list', async ({ apiClient }) => {
    const body = await apiClient.getBrands();

    expect(body.responseCode).toBe(200);
    expect(body.brands).toHaveLength(products.totalProducts);
    const counts = {};
    for (const b of body.brands) counts[b.brand] = (counts[b.brand] || 0) + 1;
    for (const { name, count } of products.brands) {
      expect(counts[name], `products of brand ${name}`).toBe(count);
    }
  });

  test('API 4: PUT to brands list is not supported', async ({ apiClient }) => {
    const body = await apiClient.putBrands();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  for (const { term, expected } of products.searches) {
    test(`API 5: search product "${term}"`, async ({ apiClient }) => {
      const body = await apiClient.searchProduct(term);
      expect(body.responseCode).toBe(200);
      expect(body.products.map((p) => p.name)).toEqual(expect.arrayContaining(expected));
    });
  }

  test('API 5: search with no matches returns an empty list', async ({ apiClient }) => {
    const body = await apiClient.searchProduct(products.noResultsTerm);
    expect(body.responseCode).toBe(200);
    expect(body.products).toEqual([]);
  });

  test('API 6: search without search_product parameter', async ({ apiClient }) => {
    const body = await apiClient.searchProduct();
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe('Bad request, search_product parameter is missing in POST request.');
  });
});
