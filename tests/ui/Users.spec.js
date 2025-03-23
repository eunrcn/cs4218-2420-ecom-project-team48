import { test, expect } from "@playwright/test";

test.describe("Users Management Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  async function loginAsAdmin(page) {
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("admin@admin.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("admin");
    await page.getByRole("button", { name: "LOGIN" }).click();
  }

  async function loginAsUser(page) {
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("user@user.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("user");
    await page.getByRole("button", { name: "LOGIN" }).click();
  }

  async function goToUsersPage(page) {
    await page.getByRole("button", { name: "admin" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Users" }).click();
  }

  test("admin should be able to view users page", async ({ page }) => {
    await loginAsAdmin(page);
    await goToUsersPage(page);

    await expect(
      page.getByRole("heading", { name: "All Users" })
    ).toBeVisible();

    await expect(page.getByRole("cell", { name: "ID" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Role" })).toBeVisible();
  });

  test("users page should display user data", async ({ page }) => {
    await loginAsAdmin(page);
    await goToUsersPage(page);

    await page.waitForSelector("table tbody tr");

    await expect(
      page.getByRole("cell", { name: "admin@admin.com" })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "admin", exact: true })
    ).toBeVisible();

    await expect(
      page.getByRole("cell", { name: "user@user.com" })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "user", exact: true })
    ).toBeVisible();
  });

  test("should not allow regular user to access users page", async ({
    page,
  }) => {
    await loginAsUser(page);

    await page.goto("http://localhost:3000/dashboard/admin/users");

    await expect(
      page.getByRole("heading", { name: "LOGIN FORM" })
    ).toBeVisible();
  });
});
