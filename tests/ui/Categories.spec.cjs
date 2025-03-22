import { test, expect } from '@playwright/test';

test.describe('Categories and CategoryProduct Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('.');

    // Verify on homepage
    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
  });

  test('Should show at least 3 categories and navigate to each category page', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'All Categories' }).click();

    // Need this for the category buttons to show
    await page.waitForLoadState('networkidle');

    const categoryLinks = page.getByRole('link').filter({ hasText: /^(Book|Electronics|Clothing)$/ });
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);

    const categoryNames = [];
    for (let i = 0; i < count; i++) {
      categoryNames.push(await categoryLinks.nth(i).textContent());
    }

    for (let i = 0; i < count; i++) {
      const categoryName = categoryNames[i];

      if (i > 0) {
        await page.getByRole('link', { name: 'Categories' }).click();
        await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'All Categories' }).click();
      }

      await page.getByRole('link', { name: categoryName }).click();

      await expect(page.getByRole('heading', { name: new RegExp(`Category - ${categoryName}`, 'i') })).toBeVisible();
    }
  });

  test('Should display category page with correct title and results count', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Book' }).click();
    
    await expect(page.getByRole('heading', { name: /Category - Book/i })).toBeVisible();

    await expect(page.getByText(/result found/i)).toBeVisible();

    await expect(page).toHaveURL(/\/category\/book$/i);
  });
  
  test('Should display products in the selected category', async ({ page }) => {   
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Electronics' }).click();

    await expect(page.getByRole('heading', { name: /Category - Electronics/i })).toBeVisible();

    const productCards = page.locator('.card');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '$1,499.99' })).toBeVisible();
    await expect(page.getByText('A powerful laptop...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: 'Laptop' })).toBeVisible();
  });
  
  test('Should navigate to product details when clicking on More Details', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Clothing' }).click();

    const productName = await page.locator('.card-title').first().textContent();

    await page.locator('.card').first().getByRole('button', { name: 'More Details' }).click();
    
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: new RegExp(`Name : ${productName}`, 'i') })).toBeVisible();
  });
  
  test('Should display proper message when category has no products', async ({ page }) => {
    await page.goto('./category/empty-category');

    await expect(page.getByText('0 result found')).toBeVisible();
  });
  
  test('Should display category products with truncated descriptions', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Book' }).click();

    const descriptions = page.locator('.card-text');
    if (await descriptions.count() > 0) {
      const firstDescription = await descriptions.first().textContent();
      expect(firstDescription.endsWith('...')).toBeTruthy();
    }
  });
  
  test('Should display products with properly formatted prices', async ({ page }) => {
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.locator('#navbarTogglerDemo01').getByRole('link', { name: 'Electronics' }).click();

    const prices = page.locator('.card-price');
    if (await prices.count() > 0) {
      const firstPrice = await prices.first().textContent();
      expect(firstPrice.includes('$')).toBeTruthy();
    }
  });
  
  test('Should directly access category page via URL', async ({ page }) => {
    await page.goto('./category/book');
    
    await expect(page.getByRole('heading', { name: /Category - Book/i })).toBeVisible();

    const productCards = page.locator('.card');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
}); 