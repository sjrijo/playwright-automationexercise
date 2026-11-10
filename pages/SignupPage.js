const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

/** /signup – "Enter Account Information" form shown after the initial name + email step. */
class SignupPage extends BasePage {
  constructor(page) {
    super(page);
    this.accountInfoHeading = page.getByRole('heading', { name: 'Enter Account Information' });
    this.addressInfoHeading = page.getByRole('heading', { name: 'Address Information' });

    this.titleMr = page.getByRole('radio', { name: 'Mr.' });
    this.titleMrs = page.getByRole('radio', { name: 'Mrs.' });
    this.name = page.getByTestId('name');
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.days = page.getByTestId('days');
    this.months = page.getByTestId('months');
    this.years = page.getByTestId('years');
    this.newsletter = page.getByRole('checkbox', { name: 'Sign up for our newsletter!' });
    this.optin = page.getByRole('checkbox', { name: 'Receive special offers from our partners!' });

    this.firstName = page.getByTestId('first_name');
    this.lastName = page.getByTestId('last_name');
    this.company = page.getByTestId('company');
    this.address1 = page.getByTestId('address');
    this.address2 = page.getByTestId('address2');
    this.country = page.getByTestId('country');
    this.state = page.getByTestId('state');
    this.city = page.getByTestId('city');
    this.zipcode = page.getByTestId('zipcode');
    this.mobileNumber = page.getByTestId('mobile_number');
    this.createAccountButton = page.getByTestId('create-account');
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/signup$/);
    await expect(this.accountInfoHeading).toBeVisible();
  }

  async fillAccountDetails(user) {
    await (user.title === 'Mrs' ? this.titleMrs : this.titleMr).check();
    await this.password.fill(user.password);
    await this.days.selectOption(user.birthDay);
    await this.months.selectOption(user.birthMonth);
    await this.years.selectOption(user.birthYear);
    if (user.newsletter) await this.newsletter.check();
    if (user.optin) await this.optin.check();

    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.company.fill(user.company);
    await this.address1.fill(user.address1);
    await this.address2.fill(user.address2);
    await this.country.selectOption(user.country);
    await this.state.fill(user.state);
    await this.city.fill(user.city);
    await this.zipcode.fill(user.zipcode);
    await this.mobileNumber.fill(user.mobileNumber);
  }

  async createAccount(user) {
    await this.fillAccountDetails(user);
    await this.createAccountButton.click();
  }
}

module.exports = { SignupPage };
