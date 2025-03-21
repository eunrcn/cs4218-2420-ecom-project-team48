import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("."); // Go to the home page
});

test.afterEach(async () => {});

test('check homepage show 6 products', async ({ page }) => {
    // check that default products are visible
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    const productHeadings = await page.locator('div.card h5.card-title:not(.card-price)'); 
    const productCount = await productHeadings.count();
    await expect(productCount).toBe(6);
});

test('filter by product category', async ({ page }) => {
    // filter by 1 category
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await page.waitForTimeout(2000);  // Wait for the filtering action to complete
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(2);
});

test('multi filter by product category', async ({ page }) => {
    // select 2 category
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await expect(page.getByRole('main')).toContainText('Textbook');
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await page.waitForTimeout(2000);  
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(5);
});

test('filter by product price', async ({ page }) => {
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('NUS T-shirt');
    await page.waitForTimeout(2000);  
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(2);
});

test('allow a user to browse, filter, add to cart, and reset filters', async ({ page }) => {

    // check that default products are visible
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();

    // Get the count of "More Details" buttons (should be the number of products)
    let moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    let productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(6);

    // filter by 1 category
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await page.waitForTimeout(2000);  // Wait for the filtering action to complete
    moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(2);

    // Multi-Select
    await page.getByRole('checkbox', { name: 'Book' }).check();
    await expect(page.getByRole('main')).toContainText('Textbook');
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await page.waitForTimeout(2000);  
    moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(5);

    // filter by price
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByRole('main')).toContainText('Novel');
    await page.waitForTimeout(2000);  
    moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(1);

    // add to cart
    await page.locator('button:has-text("ADD TO CART")').first().click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();

    // check cart badge is updated
    await expect(page.getByTitle('1')).toBeVisible();

    // reset filter
    await page.getByRole('button', { name: 'RESET FILTERS' }).click();

    // check that default products are visible
    await expect(page.getByRole('heading', { name: 'NUS T-shirt' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Smartphone' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Textbook' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Novel' })).toBeVisible();
    await page.waitForTimeout(2000);  
    moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(6);
  });