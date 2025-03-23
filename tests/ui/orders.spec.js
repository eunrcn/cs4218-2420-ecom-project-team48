import { test, expect } from "@playwright/test";

async function login(page, email, password) {
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill(password);
  await page.getByRole("button", { name: "LOGIN" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("should add item to cart after login and verify cart content", async ({
  page,
}) => {
  await login(page, "user@user.com", "user");
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.locator("h1")).toContainText(
    "Hello userYou Have 1 items in your cart"
  );
});

test("should be able to complete payment and navigate to orders page", async ({
  page,
}) => {
  await login(page, "user@user.com", "user");
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page.getByRole("button", { name: "Paying with Card" }).click();

  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .fill("5555444433331111");

  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill("0330");

  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("737");

  await page.getByRole("button", { name: "Make Payment" }).click();
  await expect(page.locator("h1")).toContainText("All Orders");
});

test("should not accept invalid credit card details", async ({ page }) => {
  await login(page, "user@user.com", "user");
  await page.locator(".card-name-price > button:nth-child(2)").first().click();

  await page
    .locator(
      "div:nth-child(3) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page
    .locator(
      "div:nth-child(5) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page
    .locator(
      "div:nth-child(6) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();

  await page.getByRole("link", { name: "Cart" }).click();
  await page.getByRole("button", { name: "Paying with Card" }).click();

  await page
    .locator('iframe[name="braintree-hosted-field-number"]')
    .contentFrame()
    .getByRole("textbox", { name: "Credit Card Number" })
    .fill("1234123412341234");

  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill("1111");

  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("111");

  await page.getByText("This card number is not valid.").click();
  await page.getByText("This expiration date is not").click();
  await page.getByText("This security code is not").click();
});
