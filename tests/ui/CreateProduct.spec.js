import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Create Product Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("");
  });

  const product = {
    category: "Clothing",
    name: "A New T-Shirt",
    description: "This is a test product description",
    price: "99.99",
    quantity: "10",
    shipping: "Yes",
    photoPath: "./tests/ui//sample_pictures/shirt.jpg",
  };

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

  async function goToCreateProductPage(page, admin = true) {
    if (admin) {
      await page.getByRole("button", { name: "admin" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
      await page.getByRole("link", { name: "Create Product" }).click();
    } else {
      await page.getByRole("button", { name: "user" }).click();
      await page.getByRole("link", { name: "Dashboard" }).click();
    }
  }

  async function fillProductForm(page) {
    await page.locator("#rc_select_0").click(); // select category
    await page.getByTitle(product.category).locator("div").click();

    await page.getByText("Upload Photo").click();
    await page.locator("input[name=photo]").setInputFiles(product.photoPath);

    await page.getByPlaceholder("write a name").fill(product.name);

    await page
      .getByPlaceholder("write a description")
      .fill(product.description);

    await page.getByPlaceholder("write a price").fill(product.price);

    await page.getByPlaceholder("write a quantity").fill(product.quantity);

    await page.locator("#rc_select_1").click(); // select shipping
    await page.getByText(product.shipping).click();
  }

  async function createProduct(page, product = {}) {
    await fillProductForm(page, product);
    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
  }

  test("admin should be able to view create product page", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await expect(
      page.getByRole("heading", { name: "Create Product" })
    ).toBeVisible();
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^Select a category$/ })
        .first()
    ).toBeVisible();
    await expect(page.getByText("Upload Photo")).toBeVisible();
    await expect(page.getByPlaceholder("write a name")).toBeVisible();
    await expect(page.getByPlaceholder("write a description")).toBeVisible();
    await expect(page.getByPlaceholder("write a price")).toBeVisible();
    await expect(page.getByPlaceholder("write a quantity")).toBeVisible();

    await expect(
      page.getByRole("button", { name: "CREATE PRODUCT" })
    ).toBeVisible();
  });

  test("should create new product successfully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await createProduct(page);

    // verify redirect to products page
    await expect(page).toHaveURL(/.*\/dashboard\/admin\/products/);
    await expect(page.getByText("Product Created Successfully")).toBeVisible();
    await expect(page.getByText(product.name)).toBeVisible();
  });

  test("should show preview of uploaded image after upload", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.getByText("Upload Photo").click();
    await page.locator("input[name=photo]").setInputFiles(product.photoPath);

    await expect(
      page.getByRole("img", { name: "product_photo" })
    ).toBeVisible();
    await expect(
      page.getByText(path.basename(product.photoPath))
    ).toBeVisible();
  });

  test("should show error if required fields are empty", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

    await expect(page.getByText("Please check all fields")).toBeVisible();
  });

  test("should show error when creating product without category", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.getByText("Upload Photo").click();
    await page.locator("input[name=photo]").setInputFiles(product.photoPath);

    await page.getByPlaceholder("write a name").fill(product.name);

    await page
      .getByPlaceholder("write a description")
      .fill(product.description);

    await page.getByPlaceholder("write a price").fill(product.price);
    await page.getByPlaceholder("write a quantity").fill(product.quantity);
    await page.locator("#rc_select_1").click(); // select shipping
    await page.getByText(product.shipping).click();

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("should show error when creating product without name", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.locator("#rc_select_0").click(); // select category
    await page.getByTitle(product.category).locator("div").click();

    await page.getByText("Upload Photo").click();
    await page.locator("input[name=photo]").setInputFiles(product.photoPath);

    await page
      .getByPlaceholder("write a description")
      .fill(product.description);

    await page.getByPlaceholder("write a price").fill(product.price);
    await page.getByPlaceholder("write a quantity").fill(product.quantity);
    await page.locator("#rc_select_1").click(); // select shipping
    await page.getByText(product.shipping).click();

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("should show error when creating product without price", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.locator("#rc_select_0").click(); // select category
    await page.getByTitle(product.category).locator("div").click();

    await page.getByText("Upload Photo").click();
    await page.locator("input[name=photo]").setInputFiles(product.photoPath);

    await page.getByPlaceholder("write a name").fill(product.name);

    await page
      .getByPlaceholder("write a description")
      .fill(product.description);

    await page.getByPlaceholder("write a quantity").fill(product.quantity);
    await page.locator("#rc_select_1").click(); // select shipping
    await page.getByText(product.shipping).click();

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("should show error when creating product without photo", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.locator("#rc_select_0").click(); // select category
    await page.getByTitle(product.category).locator("div").click();
    await page.getByPlaceholder("write a name").fill(product.name);

    await page
      .getByPlaceholder("write a description")
      .fill(product.description);

    await page.getByPlaceholder("write a price").fill(product.price);
    await page.getByPlaceholder("write a quantity").fill(product.quantity);
    await page.locator("#rc_select_1").click(); // select shipping
    await page.getByText(product.shipping).click();

    await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

    await expect(
      page.getByText("Please check all fields including photo")
    ).toBeVisible();
  });

  test("should handle API errors gracefully", async ({ page }) => {
    await loginAsAdmin(page);
    await goToCreateProductPage(page);

    await page.route("**/api/v1/product/create-product", (route) => {
      return route.fulfill({
        status: 500,
        body: JSON.stringify({ success: false, message: "Server error" }),
      });
    });

    await createProduct(page);

    await expect(page.getByText("Something went wrong")).toBeVisible();
  });

  test("should not allow regular user to access create product page", async ({
    page,
  }) => {
    await loginAsUser(page);
    await goToCreateProductPage(page, false);

    await expect(
      page.getByRole("heading", { name: "Admin Panel" })
    ).not.toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create Product" })
    ).not.toBeVisible();

    await page.goto("http://localhost:3000/dashboard/admin/create-product");

    await expect(
      page.getByRole("heading", { name: "LOGIN FORM" })
    ).toBeVisible();
  });
});
