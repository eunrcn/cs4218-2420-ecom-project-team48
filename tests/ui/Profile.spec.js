import { test, expect } from "@playwright/test";

test.beforeEach("Login as user and navigate to the profile page", async ({ page }) => {
    await page.goto("."); // Go to the home page

    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('99912345');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
    await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
    await page.getByRole('button', { name: 'REGISTER' }).click();

    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // wait for the login success message to disappear
    await page.waitForSelector("text=Logged in successfully", {
        state: "hidden",
    });

    // ensure that user is at homepage
    // await expect(page.getByRole('heading', { name: 'Filter By Category' })).toBeVisible();

    // check that user is logged in
    await expect(page.getByRole('button', { name: 'test user' })).toBeVisible();

});


test('should display user profile details', async ({ page }) => {
    // navigate to profile
    await page.getByRole('button', { name: 'test user' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();

    // check user details
    await expect(page.getByRole('main')).toContainText('USER PROFILE');
    await expect(page.getByRole('textbox', { name: 'Enter Your Name' })).toHaveValue('test user');
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toHaveValue('test-user@example.com');
    await expect(page.getByRole('textbox', { name: 'Enter Your Phone' })).toHaveValue('99912345');
    await expect(page.getByRole('textbox', { name: 'Enter Your Address' })).toHaveValue('singapore');
});


test('should show error message for password less than 6 chars', async ({ page }) => {
    // navigate to profile
    await page.getByRole('button', { name: 'test user' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();

    // update password
    await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345');
    await page.getByRole('button', { name: 'UPDATE' }).click();
    await expect(page.getByText('Passsword is required and it must be 6 characters long')).toBeVisible();
});


test("Logout", async ({ page }) => {
    await page.getByRole('button', { name: 'test user' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.getByText('LOGIN FORM')).toBeVisible();
});

