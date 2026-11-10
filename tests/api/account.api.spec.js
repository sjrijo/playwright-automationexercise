const { test, expect } = require('../../fixtures/baseTest');
const { randomUser } = require('../../utils/dataFactory');
const users = require('../../test-data/users.json');

/** APIs 7-14 from https://automationexercise.com/api_list. */
test.describe('Login API', () => {
  test('API 7: verify login with valid details @smoke', async ({ apiClient, registeredUser }) => {
    const body = await apiClient.verifyLogin({ email: registeredUser.email, password: registeredUser.password });
    expect(body.responseCode).toBe(200);
    expect(body.message).toBe('User exists!');
  });

  test('API 8: verify login without email parameter', async ({ apiClient }) => {
    const body = await apiClient.verifyLogin({ password: 'whatever' });
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe('Bad request, email or password parameter is missing in POST request.');
  });

  test('API 9: DELETE to verify login is not supported', async ({ apiClient }) => {
    const body = await apiClient.deleteVerifyLogin();
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  for (const { case: name, email, password } of users.invalidLogins) {
    test(`API 10: verify login with invalid details (${name})`, async ({ apiClient }) => {
      const body = await apiClient.verifyLogin({ email, password });
      expect(body.responseCode).toBe(404);
      expect(body.message).toBe('User not found!');
    });
  }

  test('API 10: verify login with a wrong password', async ({ apiClient, registeredUser }) => {
    const body = await apiClient.verifyLogin({ email: registeredUser.email, password: 'not-the-password' });
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe('User not found!');
  });
});

test.describe('Account API', () => {
  test('API 11-14: full account lifecycle (create, read, update, delete) @smoke', async ({ apiClient }) => {
    const user = randomUser();

    await test.step('API 11: create account', async () => {
      const body = await apiClient.createAccount(user);
      expect(body.responseCode).toBe(201);
      expect(body.message).toBe('User created!');
    });

    try {
      await test.step('API 14: get user detail by email', async () => {
        const body = await apiClient.getUserByEmail(user.email);
        expect(body.responseCode).toBe(200);
        expect(body.user).toEqual(
          expect.objectContaining({
            name: user.name,
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            company: user.company,
            address1: user.address1,
            country: user.country,
            state: user.state,
            city: user.city,
            zipcode: user.zipcode,
          }),
        );
      });

      await test.step('API 13: update account', async () => {
        const updated = { ...user, city: 'Vancouver', state: 'British Columbia', company: 'Updated QA Labs' };
        const body = await apiClient.updateAccount(updated);
        expect(body.responseCode).toBe(200);
        expect(body.message).toBe('User updated!');

        const after = await apiClient.getUserByEmail(user.email);
        expect(after.user).toEqual(
          expect.objectContaining({ city: 'Vancouver', state: 'British Columbia', company: 'Updated QA Labs' }),
        );
      });
    } finally {
      await test.step('API 12: delete account', async () => {
        const body = await apiClient.deleteAccount(user);
        expect(body.responseCode).toBe(200);
        expect(body.message).toBe('Account deleted!');
      });
    }

    await test.step('deleted account can no longer log in', async () => {
      const body = await apiClient.verifyLogin({ email: user.email, password: user.password });
      expect(body.responseCode).toBe(404);
    });
  });

  test('API 11: creating an account with an existing email is rejected', async ({ apiClient, registeredUser }) => {
    const body = await apiClient.createAccount(randomUser({ email: registeredUser.email }));
    expect(body.responseCode).toBe(400);
    expect(body.message).toBe('Email already exists!');
  });

  test('API 14: unknown email returns 404', async ({ apiClient }) => {
    const body = await apiClient.getUserByEmail(randomUser().email);
    expect(body.responseCode).toBe(404);
  });
});
