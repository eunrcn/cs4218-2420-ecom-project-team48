import { test, expect } from '@playwright/test';

test.describe('Product Details Page', () => {
  // Navigate to Textbook product page before each test
  test.beforeEach(async ({ page }) => {
    // Go to homepage
    await page.goto('.');
    
    // Find Textbook product card and click More Details button
    const textbookCard = page.locator('.card').filter({ has: page.getByText('Textbook', { exact: true }) });
    await textbookCard.getByRole('button', { name: 'More Details' }).click();
    
    // Check correct product details page
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Name : Textbook' })).toBeVisible();
  });
  
  test('Should display product information correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Name : Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : A comprehensive textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price : $79.99' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category : Book' })).toBeVisible();
    
    await expect(page.getByRole('img', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
  });
  
  test('Should be able to add product to cart', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).first().click();
    await expect(page.getByText('Item added to cart')).toBeVisible();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Textbook', { exact: true })).toBeVisible();
  });
  
  test('Should display similar products section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Similar Products ➡️' })).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();
  });

  test('Should display no similar products if not available', async ({ page }) => {
    // Go back to homepage
    await page.goto('.');

    // Click on T-shirt product card
    const tshirtCard = page.locator('.card').filter({ has: page.getByText('NUS T-shirt', { exact: true }) });
    await tshirtCard.getByRole('button', { name: 'More Details' }).click();
    
    await expect(page.getByText('No Similar Products found')).toBeVisible();
  });
  
  test('Should be able to navigate to a similar product', async ({ page }) => {
    await page.getByRole('button', { name: 'More Details' }).first().click();

    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Name : Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : A bestselling' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price : $' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category : Book' })).toBeVisible();

    await expect(page.getByRole('img', { name: 'Novel' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
  });
  
  test('Should be able to add similar product to cart', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).nth(1).click();
    await expect(page.getByText('Item added to cart')).toBeVisible();

    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Novel', { exact: true })).toBeVisible();
  });
  
  test('Should handle direct navigation to non-existent product', async ({ page }) => {
    await page.goto('/product/non-existent-jeans');
    
    await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
    await expect(page.getByText('The requested product does')).toBeVisible();
  });
});
