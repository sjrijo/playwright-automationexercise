const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /login – holds both the "Login to your account" and "New User Signup!" forms. */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.loginHeading = page.getByRole('heading', { name: 'Login to your account' });
    this.loginEmail = page.getByTestId('login-email');
    this.loginPassword = page.getByTestId('login-password');
    this.loginButton = page.getByTestId('login-button');
    this.loginError = page.getByText('Your email or password is incorrect!');

    this.signupHeading = page.getByRole('heading', { name: 'New User Signup!' });
    this.signupName = page.getByTestId('signup-name');
    this.signupEmail = page.getByTestId('signup-email');
    this.signupButton = page.getByTestId('signup-button');
    this.signupError = page.getByText('Email Address already exist!');
  }

  async open() {
    await this.goto('/login');
    await this.expectLoaded();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/login$/);
    await expect(this.loginHeading).toBeVisible();
    await expect(this.signupHeading).toBeVisible();
  }

  async login(email, password) {
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
  }

  async startSignup(name, email) {
    await this.signupName.fill(name);
    await this.signupEmail.fill(email);
    await this.signupButton.click();
  }
}

module.exports = { LoginPage };
