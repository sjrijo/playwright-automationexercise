/**
 * Thin wrapper around https://automationexercise.com/api_list.
 *
 * Note: the API always answers HTTP 200 (as text/html) and puts the real status
 * in the JSON body's `responseCode`, so every method returns the parsed body.
 */
class ApiClient {
  /** @param {import('@playwright/test').APIRequestContext} request */
  constructor(request) {
    this.request = request;
  }

  async #json(responsePromise) {
    const response = await responsePromise;
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Expected JSON from ${response.url()} but got: ${text.slice(0, 200)}`);
    }
  }

  getProducts() { return this.#json(this.request.get('/api/productsList')); }
  postProducts() { return this.#json(this.request.post('/api/productsList')); }
  getBrands() { return this.#json(this.request.get('/api/brandsList')); }
  putBrands() { return this.#json(this.request.put('/api/brandsList')); }

  searchProduct(term) {
    const options = term === undefined ? {} : { form: { search_product: term } };
    return this.#json(this.request.post('/api/searchProduct', options));
  }

  /** Pass only the fields you want sent (lets tests omit parameters). */
  verifyLogin(form) { return this.#json(this.request.post('/api/verifyLogin', { form })); }
  deleteVerifyLogin() { return this.#json(this.request.delete('/api/verifyLogin')); }

  createAccount(user) { return this.#json(this.request.post('/api/createAccount', { form: toApiForm(user) })); }
  updateAccount(user) { return this.#json(this.request.put('/api/updateAccount', { form: toApiForm(user) })); }
  deleteAccount({ email, password }) {
    return this.#json(this.request.delete('/api/deleteAccount', { form: { email, password } }));
  }
  getUserByEmail(email) {
    return this.#json(this.request.get('/api/getUserDetailByEmail', { params: { email } }));
  }

  /** Creates the account and fails loudly if the API refuses. */
  async createAccountOrThrow(user) {
    const body = await this.createAccount(user);
    if (body.responseCode !== 201) throw new Error(`createAccount failed: ${JSON.stringify(body)}`);
    return body;
  }
}

/** Maps a randomUser() profile to the API's form parameter names. */
function toApiForm(u) {
  return {
    name: u.name,
    email: u.email,
    password: u.password,
    title: u.title,
    birth_date: u.birthDay,
    birth_month: u.birthMonth,
    birth_year: u.birthYear,
    firstname: u.firstName,
    lastname: u.lastName,
    company: u.company,
    address1: u.address1,
    address2: u.address2,
    country: u.country,
    zipcode: u.zipcode,
    state: u.state,
    city: u.city,
    mobile_number: u.mobileNumber,
  };
}

module.exports = { ApiClient, toApiForm };
