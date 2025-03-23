import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("."); // Go to the home page
});

test.afterEach(async () => {});

test("verifies that all header components are shown", async ({ page }) => {
    await expect(page.getByRole('link', { name: '🛒 Virtual Vault' })).toBeVisible();
    await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  test("verifies that the '🛒 Virtual Vault' logo links to the homepage", async ({ page }) => {
    await page.getByRole('link', { name: '🛒 Virtual Vault' }).click();
    expect(page.url()).toContain('/');
  });

  test("verifies that the 'Home' link navigates to the homepage", async ({ page }) => {
    await page.getByRole('link', { name: 'Home' }).click();
    expect(page.url()).toContain('/');
  });

  test("verifies that 'Register' and 'Login' links are shown when user is not logged in", async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  });

  test("verifies that 'Dashboard' and 'Logout' options are shown when user is logged in", async ({ page }) => {
    // login
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@user.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('user');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page.getByRole('button', { name: 'user' }).click();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  });

  test("checks that clicking on 'Logout' clears authentication data", async ({ page }) => {
    // login
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@user.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('user');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await expect(page.getByRole('button', { name: 'user' })).toBeVisible();
    await page.getByRole('button', { name: 'user' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
  });

  test("verifies clicking 'All Categories' navigates to '/categories'", async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'All Categories' }).click();
      
    // Verify URL
    expect(page.url()).toContain('/categories');
    await expect(page).toHaveURL(/categories/);
  });

  test("checks the 'Cart' link navigates to /cart and displays empty badge count", async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
    await expect(page.locator('.ant-badge-count')).toHaveText('0');

    // Verify link
    await page.click('text=Cart');
    await expect(page).toHaveURL(/cart/);
  });

  test("should show category list in dropdown", async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await page.getByRole('link', { name: 'Categories' }).click();
    await expect(page.getByRole('link', { name: 'All Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Electronics' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Book' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Clothing' })).toBeVisible();
  });

  test("should show correct cart badge count", async ({ page }) => {
    await page.locator('.card-name-price > button:nth-child(2)').first().click();
    await expect(page.getByTitle('1')).toBeVisible();
    await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button:nth-child(2)').click();
    await expect(page.getByTitle('2')).toBeVisible();
  });
  