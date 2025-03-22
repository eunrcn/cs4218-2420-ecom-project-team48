import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});


test("should be able to change username and update", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .press("Enter");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "user" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill("user1");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Profile Updated Successfully$/ })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "user1" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("heading", { name: "user1" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("textbox", { name: "Enter Your Name" }).fill("user");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await page
    .locator("div")
    .filter({ hasText: /^Profile Updated Successfully$/ })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "user" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("heading", { name: "user" }).first().click();
});

test("should be able to change number and update", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "user" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("textbox", { name: "Enter Your Phone" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Phone" })
    .fill("23456789");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await page.getByText("Profile Updated Successfully").click();
});

test("should be able to change address and update", async ({ page }) => {
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("user@user.com");
  await page.getByRole("textbox", { name: "Enter Your Password" }).click();
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill("user");
  await page.getByRole("button", { name: "LOGIN" }).click();
  await page.getByRole("button", { name: "user" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("link", { name: "Profile" }).click();
  await page.getByRole("textbox", { name: "Enter Your Address" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Address" })
    .fill("qwerty");
  await page.getByRole("button", { name: "UPDATE" }).click();
  await page.getByText("Profile Updated Successfully").click();
  await page.getByRole("button", { name: "user" }).click();
  await page.getByRole("link", { name: "Dashboard" }).click();
  await expect(
    page.getByRole("heading", { name: "qwerty", exact: true })
  ).toBeVisible();
});

