import { test, expect } from "@playwright/test";

async function login(page) {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("admin@admin.com");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("admin");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "admin" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
}

async function updateOrderStatus(page, targetStatus) {
  await page.getByRole("link", { name: "Orders" }).click();

  const statuses = [
    "Shipped",
    "Not Process",
    "Processing",
    "Delivered",
    "Cancelled",
  ];

  for (const status of statuses) {
    if (await page.getByText(status).isVisible()) {
      await page
        .getByTestId("status-67a21938cf4efddf1e5358d1")
        .getByText(status)
        .click();

      const targetStatusElement = page
        .getByTestId("status-67a21938cf4efddf1e5358d1")
        .getByTitle(targetStatus);

      await targetStatusElement.waitFor({ state: "visible", timeout: 60000 });

      const isVisible = await targetStatusElement.isVisible();
      if (!isVisible) {
        console.log(`Status "${targetStatus}" is not visible.`);
      }

      await targetStatusElement.hover();

      await targetStatusElement.click();

      await page
        .getByRole("cell", { name: `${targetStatus} ${targetStatus}` })
        .click();

      break;
    }
  }
}
test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("admin should be able to update order status to not processed", async ({
  page,
}) => {
  await login(page);
  await updateOrderStatus(page, "Not Process");
});

test("admin should be able to update order status to processing", async ({
  page,
}) => {
  await login(page);
  await updateOrderStatus(page, "Processing");
});

test("admin should be able to update order status to shipped", async ({
  page,
}) => {
  await login(page);
  await updateOrderStatus(page, "Shipped");
});

test("admin should be able to update order status to delivered", async ({
  page,
}) => {
  await login(page);
  await updateOrderStatus(page, "Delivered");
});

test("admin should be able to update order status to cancelled", async ({
  page,
}) => {
  await login(page);
  await updateOrderStatus(page, "Cancelled");
});

test("admin should be able to view orders", async ({ page }) => {
  await login(page);

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

test("admin should be able to add and remove items from cart", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("link", { name: "🛒 Virtual Vault" }).click();
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
