# Playwright tests – automationexercise.com

End-to-end UI and API test suite for <https://automationexercise.com>, built with
[Playwright Test](https://playwright.dev) in JavaScript. It covers all 26 of the site's published
UI test cases and all 14 of its practice APIs, plus extra negative and data-driven cases.

## Quick start

```bash
npm install
npx playwright install          # browsers (once)
cp .env.example .env            # Windows: copy .env.example .env
npm test                        # everything: API + UI on the browsers in BROWSERS
```

Requires Node 18+. Allure reports also need Java 8+ on the PATH.

## Scripts

| Command | What it does |
| --- | --- |
| `npm test` | Full suite (API + UI) |
| `npm run test:api` | API tests only (no browser) |
| `npm run test:ui` | UI tests only |
| `npm run test:smoke` | Tests tagged `@smoke` |
| `npm run test:headed` | UI visible, one worker |
| `npm run test:debug` | Playwright inspector |
| `npm run test:dev` / `test:qa` / `test:staging` | Load `.env.<env>` on top of `.env` |
| `npm run report` | Open the Playwright HTML report |
| `npm run allure:generate` / `allure:open` / `allure:serve` | Build / open the Allure report |

Extra Playwright arguments go after `--`, e.g. `npm test -- tests/ui/cart.spec.js --headed`.

## Configuration

All settings come from `.env` (gitignored; see `.env.example`). Real environment variables win.

| Variable | Default | Purpose |
| --- | --- | --- |
| `BASE_URL` | `https://automationexercise.com` | Site under test |
| `BROWSERS` | `chromium` | Comma-separated: `chromium,firefox,webkit`. One project per browser |
| `USER_EMAIL` / `USER_PASSWORD` | empty | Reuse an existing account for shared-login tests instead of creating one per run |
| `TEST_ENV` | – | Also load `.env.<TEST_ENV>` (used by `test:dev` etc.) |

## Project layout

```
fixtures/
  baseTest.js        custom `test`: page-object fixtures, ad blocking, Allure labels, user fixtures
  auth.setup.js      creates one shared user per browser and saves its login (storageState)
  auth.teardown.js   deletes the shared users afterwards
pages/               Page Object Model (one class per page; components/ for shared widgets)
tests/
  api/               API 1-14 (products, brands, search, login, account CRUD)
  ui/                auth, products, cart, checkout, site (navigation, subscription, contact)
test-data/           JSON test data (users, products, payment, contact) + upload file
utils/               API client, env loader, data factory, ad blocker, form-validation helpers
scripts/with-env.js  cross-platform TEST_ENV runner
```

### How tests get users

- **`registeredUser`**: created through the API before the test and deleted after it.
- **`freshUser`**: a unique profile the test registers through the UI. It's also deleted through the API afterwards in case the test fails midway.
- **`test.use({ useSharedLogin: true })`**: starts the test already logged in as the shared per-browser user from `auth.setup.js`, with no UI login. That account's cart is stored on the server, so tests that change it run `serial`.

All emails use the reserved `example.com` domain, so nothing is ever delivered.

### Test case map

| Site test case | Spec |
| --- | --- |
| TC1–5 register / login / logout / existing email | `tests/ui/auth.spec.js` |
| TC6 contact us, TC7 test cases page, TC10–11 subscription, TC25–26 scroll | `tests/ui/site.spec.js` |
| TC8–9 products & search, TC18 categories, TC19 brands, TC21 review | `tests/ui/products.spec.js` |
| TC12–13 add to cart / quantity, TC17 remove, TC20 cart after login, TC22 recommended | `tests/ui/cart.spec.js` |
| TC14–16 place order, TC23 addresses, TC24 invoice | `tests/ui/checkout.spec.js` |
| API 1–6 | `tests/api/products.api.spec.js` |
| API 7–14 | `tests/api/account.api.spec.js` |

## Notes on the site

- Google ads and full-screen interstitials are blocked in every context (`utils/blockAds.js`); they otherwise intercept clicks.
- The API always replies HTTP 200; the real status is the JSON body's `responseCode`.
- The public site sometimes returns *"This website is under heavy load (queue full)"*. Tests retry once locally and twice on CI to absorb this. If many tests fail this way, lower `--workers`.

## CI

`.github/workflows/playwright.yml` runs on push, pull request, weekday nights and manual dispatch
(choose browsers and a `--grep` filter). It uploads the Playwright HTML report and the Allure report,
plus traces, screenshots and videos when a test fails. Set `BASE_URL` as a repository variable and
`USER_EMAIL` / `USER_PASSWORD` as secrets if needed.
