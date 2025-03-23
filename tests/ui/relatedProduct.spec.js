import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto(".");
});


test('Should display products successfully', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
  
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });
  
  test('Should display related products and add the product to cart', async ({ page }) => {
    //Flow
    // 1) Go to the product page
    // 2) Check if the related products are displayed
    // 3) Add the first related product to cart
    // 4) Go to cart page & check if the product is added to cart

    // Go to the product page

    const lawBookCard = page.getByRole('main').locator('div').filter({ hasText: 'The Law of Contract in Singapore$54.99A bestselling book in Singapore...More' }).nth(3);
    await lawBookCard.getByRole('button', { name: 'More Details' }).click();
    
    // Verify that related products are displayed
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByText('A comprehensive textbook...')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$79.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByText('A bestselling novel...')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$14.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(2)).toBeVisible();

    // Add the first related product to cart
    await page.getByRole('button', { name: 'ADD TO CART' }).nth(1).click();
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.getByText('Textbook').first()).toBeVisible();
    await expect(page.getByText('A comprehensive textbook').first()).toBeVisible();
  });


  test('Should display related products and view more details', async ({ page }) => {
    //Flow
    // 1) Go to the product page
    // 2) Check if the related products are displayed
    // 3) Go to product page and see product details of the related product

    // Go to the product page
    const lawBookCard = page.getByRole('main').locator('div').filter({ hasText: 'The Law of Contract in Singapore$54.99A bestselling book in Singapore...More' }).nth(3);
    await lawBookCard.getByRole('button', { name: 'More Details' }).click();
    
    // Verify that related products are displayed
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByText('A comprehensive textbook...')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$79.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByText('A bestselling novel...')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$14.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(2)).toBeVisible();

    // View the product page of the first related product
    await page.getByRole('button', { name: 'More Details' }).first().click();

    // Verify that the new product details are displayed
    await expect(page.getByRole('heading', { name: 'Name : Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : A comprehensive' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category : Book' })).toBeVisible();

    // Verify that the related products are updated
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await expect(page.getByText('A bestselling novel...')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$14.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();
    
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByText('A bestselling book in')).toBeVisible();
    await expect(page.getByRole('heading', { name: '$54.99' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'More Details' }).nth(1)).toBeVisible();
    await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(2)).toBeVisible();
  });