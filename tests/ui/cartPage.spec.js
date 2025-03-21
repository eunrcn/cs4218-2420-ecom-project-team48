import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("cart is empty when no items are added", async ({ page }) => {
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.locator("h1")).toContainText(
    "Hello Guest Your Cart Is Empty"
  );
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart updates correctly when adding and removing a single item", async ({
  page,
}) => {
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByRole("main")).toContainText(
    "Plain NUS T-shirt for sale"
  );
  await expect(page.getByRole("main")).toContainText("Total : $4.99");
  await expect(page.getByRole("main")).toContainText("Remove");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart total updates correctly when adding and removing multiple quantities", async ({
  page,
}) => {
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $24.95");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $9.98");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart total updates correctly after removing an expensive item", async ({
  page,
}) => {
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page
    .locator(
      "div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page
    .locator(
      "div:nth-child(3) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $1,059.97");
  await page
    .locator("div")
    .filter({
      hasText: /^SmartphoneA high-end smartphonePrice : 999\.99Remove$/,
    })
    .getByRole("button")
    .click();
  await expect(page.getByRole("main")).toContainText("Total : $59.98");
});