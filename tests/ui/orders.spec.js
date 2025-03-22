import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});


test("should add item to cart after login and verify cart content", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.locator("h1")).toContainText(
    "Hello userYou Have 1 items in your cart"
  );
});

test("should complete payment after adding item to cart", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page.getByRole("button", { name: "LOGIN" }).click();
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
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-expirationDate"]')
    .contentFrame()
    .getByRole("textbox", { name: "Expiration Date" })
    .fill("0330");
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .click();
  await page
    .locator('iframe[name="braintree-hosted-field-cvv"]')
    .contentFrame()
    .getByRole("textbox", { name: "CVV" })
    .fill("737");
  await page.getByRole("button", { name: "Make Payment" }).click();
  await expect(page.locator("h1")).toContainText("All Orders");
});


test("admin should be able to update order status", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("admin@admin.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("admin");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "admin" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Orders" }).click();

  await page.getByText("Not Process").click();
  await page
    .locator("div")
    .filter({ hasText: "Not ProcessProcessingNot" })
    .nth(1)
    .click();
});

test("admin should be able to view orders", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("admin@admin.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("admin");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "admin" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Orders" }).click();

    await expect(page.getByText("All Orders#StatusBuyer")).toBeVisible();
    await expect(
      page
        .locator("div")
        .filter({
          hasText: /^NUS T-shirtPlain NUS T-shirt for salePrice : 4\.99$/,
        })
        .first()
    ).toBeVisible();
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^LaptopA powerful laptopPrice : 1499\.99$/ })
        .first()
    ).toBeVisible();
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^LaptopA powerful laptopPrice : 1499\.99$/ })
        .nth(2)
    ).toBeVisible();
});
