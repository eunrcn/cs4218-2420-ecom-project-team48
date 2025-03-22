import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard Page", () => {
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

  const loginAsUser = async (page) => {
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("user@user.com");
    await page.getByRole("textbox", { name: "Enter Your Email" }).press("Tab");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("user");
    await page.getByRole("button", { name: "LOGIN" }).click();
  };

  // Function to check the visibility of admin menu items
  const expectAdminMenu = async (page) => {
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Category" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Product" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Products" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orders" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
  };

  test("should display admin dashboard to users with admin access", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: "admin" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await expectAdminMenu(page);

    await expect(
      page.getByRole("heading", { name: "Admin Name" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Email" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Contact" })
    ).toBeVisible();
  });

  test("admin navigation menu should direct to correct pages", async ({
    page,
  }) => {
    const links = [
      "Create Category",
      "Create Product",
      "Products",
      "Orders",
      "Users",
    ];
    await loginAsAdmin(page);
    await page.getByRole("button", { name: "admin" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();

    for (const linkText of links) {
      const sluggedLink = linkText.replace(/\s+/g, "-");
      await page.getByRole("link", { name: linkText }).click();
      await expectAdminMenu(page);
      await expect(page).toHaveURL(new RegExp(sluggedLink.toLowerCase()));
      await expect(page.getByRole("link", { name: linkText })).toHaveClass(
        /active/
      );
    }
  });

  test("should not allow non-admin to access admin dashboard", async ({
    page,
  }) => {
    await loginAsUser(page);

    await page.goto("http://localhost:3000/dashboard/admin");
    await expect(
      page.getByRole("heading", { name: "LOGIN FORM" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Name" })
    ).not.toBeVisible();
  });
});
