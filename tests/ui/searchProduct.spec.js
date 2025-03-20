import { test, expect } from '@playwright/test';


test.beforeEach(async ({ page }) => {
  await page.goto(".");
});


test('Should display products and searchbox successfully', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();

  await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
});

test('Should search for matching products and add the product to cart', async ({ page }) => {
  //Flow
  // 1) Search for book
  // 2) Check if the products are displayed after searching
  // 3) Add the first product to cart from the search page
  // 4) Go to cart page & check if the product is added to cart

  // Search for book
  await page.getByRole('searchbox', { name: 'Search' }).fill('book');
  await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('book');

  // Verify that the products are displayed after searching
  await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByText('A comprehensive textbook...')).toBeVisible();
  await expect(page.getByText('$ 79.99')).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();

  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByText('A bestselling book in')).toBeVisible();
  await expect(page.getByText('$ 54.99')).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' }).nth(1)).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();

  // Add the first product to cart from the search page
  await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

  //View the product page and verify that textbook details are displayed
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.getByText('Textbook', { exact: true })).toBeVisible();
  await expect(page.getByText('A comprehensive textbook')).toBeVisible();
});

test('Should search for matching products and add the product', async ({ page }) => {
  //Flow
  // 1) Search for book
  // 2) Check if the products are displayed after searching
  // 3) View more details of the product in the product page
  // 4) Add the current viewed product to cart from the product page
  // 5) Go to cart page & check if the product is added to cart


  // Search for book
  await page.getByRole('searchbox', { name: 'Search' }).fill('book');
  await page.getByRole('searchbox', { name: 'Search' }).press('Enter');
  await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('book');

  // Verify that the products are displayed after searching
  await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByText('A comprehensive textbook...')).toBeVisible();
  await expect(page.getByText('$ 79.99')).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();

  await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
  await expect(page.getByText('A bestselling book in')).toBeVisible();
  await expect(page.getByText('$ 54.99')).toBeVisible();
  await expect(page.getByRole('button', { name: 'More Details' }).nth(1)).toBeVisible();
  await expect(page.getByRole('button', { name: 'ADD TO CART' }).nth(1)).toBeVisible();

  //View the product page and verify that textbook details are displayed
  await page.getByRole('button', { name: 'More Details' }).first().click();
  await expect(page.getByRole('heading', { name: 'Name : Textbook' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Description : A comprehensive' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Category : Book' })).toBeVisible();


  // Add the first product to cart from product page
  await expect(page.getByRole('button', { name: 'ADD TO CART' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'ADD TO CART' }).first().click();

  // Go to cart page and verify that textbook is added to cart
  await page.getByRole('link', { name: 'Cart' }).click();
  await expect(page.getByText('Textbook', { exact: true })).toBeVisible();
  await expect(page.getByText('A comprehensive textbook')).toBeVisible();
});
