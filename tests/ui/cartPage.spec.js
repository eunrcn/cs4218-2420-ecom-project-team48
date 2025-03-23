import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("cart is empty when no items are added", async ({ page }) => {
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.locator("h1")).toContainText(
    "Hello Guest, Your Cart Is Empty"
  );
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart updates correctly when adding and removing a single item", async ({
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
  await expect(page.getByRole("main")).toContainText("Total : $4.99");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart total updates correctly when adding and removing multiple same item", async ({
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
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.locator(".card-name-price > button:nth-child(2)").first().click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $24.95");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $19.96");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $14.97");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $9.98");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $4.99");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});

test("cart total updates correctly after removing an expensive item", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page.getByRole("button", { name: "LOGIN" }).click();
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
  await page
    .locator(
      "div:nth-child(4) > .card-body > div:nth-child(3) > button:nth-child(2)"
    )
    .click();
  await page.getByRole("link", { name: "Cart" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $1,134.97");
  await page.getByRole("button", { name: "Remove" }).first().click();
  await expect(page.getByRole("main")).toContainText("Total : $1,079.98");
  await page
    .locator("div")
    .filter({
      hasText: /^SmartphoneA high-end smartphonePrice : 999\.99Remove$/,
    })
    .getByRole("button")
    .click();
  await expect(page.getByRole("main")).toContainText("Total : $79.99");
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(page.getByRole("main")).toContainText("Total : $0.00");
});