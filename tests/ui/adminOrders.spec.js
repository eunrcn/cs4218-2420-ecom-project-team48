import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
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



// 2 more 