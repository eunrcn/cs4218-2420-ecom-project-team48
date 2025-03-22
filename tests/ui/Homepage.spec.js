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

test('uncheck filter by product category', async ({ page }) => {
    // check Electronic
    await page.getByRole('checkbox', { name: 'Electronics' }).check();
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await page.waitForTimeout(2000);
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(2);

    // uncheck Electronic, should show all products
    await page.getByRole('checkbox', { name: 'Electronics' }).uncheck();
    await expect(page.getByRole('main')).toContainText('Textbook');
    await expect(page.getByRole('main')).toContainText('Laptop');
    await expect(page.getByRole('main')).toContainText('Smartphone');
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    await expect(page.getByRole('main')).toContainText('NUS T-shirt');
});

test('filter by product price', async ({ page }) => {
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('NUS T-shirt');
    await page.waitForTimeout(4000);  
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' }); 
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(2);
});

test('filter by product price (single select only)', async ({ page }) => {
    // select first price filter
    await page.getByRole('radio', { name: '$0 to' }).check();
    await expect(page.getByRole('main')).toContainText('Novel');
    await expect(page.getByRole('main')).toContainText('NUS T-shirt');

    // select another price filter
    await page.getByRole('radio', { name: '$20 to' }).check();

    // wait for UI to update
    await page.waitForTimeout(4000);

    // ensure previous selection is not applied anymore
    await expect(page.getByRole('main')).not.toContainText('Novel');
    await expect(page.getByRole('main')).not.toContainText('NUS T-shirt');

    // Check that only new filtered products are shown
    const moreDetailsButtons = await page.locator('button', { hasText: 'More Details' });
    const productCount = await moreDetailsButtons.count();
    await expect(productCount).toBe(0); // Ensure some products are shown
});

test('add product to cart', async ({ page }) => {
    await page.locator('button:has-text("ADD TO CART")').first().click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();

    // check cart badge is updated
    await expect(page.getByTitle('1')).toBeVisible();
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

test('simulates adding, viewing, and removing a product from the cart.', async ({ page }) => {

    // add to cart
    const productName = "NUS T-shirt"; // Change this to the desired product

    // Find the product card that contains the specified product name
    const productCard = page.locator(`.card:has(h5.card-title:has-text("${productName}"))`);

    // Click the "ADD TO CART" button within that specific product card
    await productCard.locator('button.btn-dark:has-text("ADD TO CART")').click();

    await expect(page.getByText('Item Added to cart')).toBeVisible();

    // check cart badge is updated
    await expect(page.getByTitle('1')).toBeVisible();

    // view more details
    await page.locator('.card-name-price > button').first().click();
    await expect(page.getByRole('heading', { name: 'Product Details' })).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Name : NUS T-shirt');

    // navigate to cart
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page.locator('h2')).toContainText('Cart Summary');

    // check cart contain 1 product
    await expect(page.getByText('You Have 1 items in your cart')).toBeVisible();
    await expect(page.getByRole('main')).toContainText('NUS T-shirt');
    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible();
    await expect(page.getByRole('main')).toContainText('Price : 4.99');
    await expect(page.getByRole('main')).toContainText('Total : $4.99');

    // remove product from cart
    await page.getByRole('button', { name: 'Remove' }).click();
    await expect(page.locator('h1')).toContainText('Your Cart Is Empty');
    await expect(page.getByRole('main')).toContainText('Total : $0.00');

});