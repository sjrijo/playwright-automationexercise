/**
 * The site relies on native HTML5 validation (required / type="email"), which shows a
 * browser tooltip instead of DOM text. Read the field's validity state instead.
 * @param {import('@playwright/test').Locator} field
 */
async function validationMessage(field) {
  return field.evaluate((el) => el.validationMessage);
}

/** @param {import('@playwright/test').Locator} field */
async function isInvalid(field) {
  return field.evaluate((el) => !el.checkValidity());
}

module.exports = { validationMessage, isInvalid };
