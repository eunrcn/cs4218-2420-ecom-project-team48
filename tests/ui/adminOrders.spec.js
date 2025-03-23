import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("admin should be able to update order status to not processed", async ({ page }) => {
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

  const statuses = ["Shipped", "Not Process", "Processing", "Delivered", "Cancelled"];

  for (const status of statuses) {
    if (await page.getByText(status).isVisible()) {
      await page
        .getByTestId("status-67a21938cf4efddf1e5358d1")
        .getByText(status)
        .click();
        await page
          .getByTestId("status-67a21938cf4efddf1e5358d1")
          .getByTitle("Not Process")
          .click();
        await page
          .getByRole("cell", { name: "Not Process Not Process" })
          .click();
      break;
    }
  }
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

test("admin should be able to add and remove items from cart", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("admin@admin.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("admin");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page
    .locator(
      "div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page.getByRole("link", { name: "Cart" }).click();
  await page
    .getByRole("heading", { name: "Hello admin You Have 2 items" })
    .click();
  await page.getByRole("button", { name: "Remove" }).nth(1).click();
  await page
    .getByRole("heading", { name: "Hello admin You Have 1 items" })
    .click();
  await page.getByRole("button", { name: "Remove" }).click();
  await page
    .getByRole("heading", { name: "Hello admin Your Cart Is Empty" })
    .click();
});
