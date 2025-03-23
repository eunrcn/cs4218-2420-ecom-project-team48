import { test, expect } from "@playwright/test";

test.describe("Create Category Page", () => {
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

  const goToCategoryPage = async (page, admin = true) => {
    if (admin) {
      await page.getByRole("button", { name: "admin" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
      await page.getByRole("link", { name: "Create Category" }).click();
    } else {
      await page.getByRole("button", { name: "user" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
    }
  };

  const createCategory = async (page, category) => {
    await page.getByRole("textbox", { name: "Enter new category" }).click();
    await page
      .getByRole("textbox", { name: "Enter new category" })
      .fill(category);
    await page.getByRole("button", { name: "Submit" }).click();
  };

  test("admin should be able to view create category page", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCategoryPage(page);

    await expect(
      page.getByRole("heading", { name: "Manage Category" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("Enter new category")).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

    await expect(
      page.getByRole("columnheader", { name: "Name" })
    ).toBeVisible();
    await expect(
      page.getByRole("columnheader", { name: "Actions" })
    ).toBeVisible();

    await expect(page.getByRole("cell", { name: "Electronics" })).toBeVisible();

    await expect(page.getByRole("cell", { name: "Book" })).toBeVisible();

    await expect(page.getByRole("cell", { name: "Clothing" })).toBeVisible();
  });

  test("should create new category successfully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCategoryPage(page);
    await createCategory(page, "New Category");

    await expect(
      page.getByRole("cell", { name: "New Category" })
    ).toBeVisible();
  });

  test("should update new category successfully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCategoryPage(page);

    await expect(page.getByRole("cell", { name: "Electronics" })).toBeVisible();

    await page.getByRole("button", { name: "Edit" }).first().click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: "Enter new category" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("textbox", { name: "Enter new category" })
      .fill("New Category");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Submit" })
      .click();

    await expect(
      page.getByRole("cell", { name: "New Category" })
    ).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Electronics" })
    ).not.toBeVisible();
  });

  test("should delete category successfully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCategoryPage(page);

    await expect(page.getByRole("cell", { name: "Electronics" })).toBeVisible();

    await page.getByRole("button", { name: "Delete" }).first().click();

    await expect(
      page.getByRole("cell", { name: "Electronics" })
    ).not.toBeVisible();
  });

  test("should display new category in dropdown and allow browsing of new category page", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: "admin" }).click();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Create Category" }).click();
    await page.getByRole("textbox", { name: "Enter new category" }).click();
    await createCategory(page, "New Category");
    await page.getByRole("link", { name: "Home" }).click();
    await page.getByRole("link", { name: "Categories" }).click();
    await page.getByRole("link", { name: "New Category" }).click();

    await expect(
      page.getByRole("heading", { name: "Category - New Category" })
    ).toBeVisible();
  });

  test("should not allow regular user to access create category page", async ({
    page,
  }) => {
    await loginAsUser(page);
    await goToCategoryPage(page, false);

    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Category" })
    ).not.toBeVisible();

    await page.goto("http://localhost:3000/dashboard/admin/create-category");
    await expect(
      page.getByRole("heading", { name: "LOGIN FORM" })
    ).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCategoryPage(page);

    await page.route("**/api/v1/category/create-category", (route) => {
      return route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, message: "Server error" }),
      });
    });

    await createCategory(page, "Error Test Category");

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  // test("should show error when creating a duplicate category", async ({
  //   page,
  // }) => {
  //   await loginAsAdmin(page);
  //   await goToCategoryPage(page);

  //   await createCategory(page, "Electronics");

  //   await expect(page.getByText("Category already exists")).toBeVisible();
  // });
});
