import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
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

});

test.afterEach(async () => {});

test.describe('user register', () => {
    test('user login successfully', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();
    });

    test('user login with wrong email', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('wrong@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await expect(page.getByText('Something went wrong')).toBeVisible();
    });

    test('user login with wrong password', async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('wrongpassword');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        await expect(page.getByText('Invalid Password')).toBeVisible();
    });

    test("should show an error for empty email field", async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Email' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty password field", async ({ page }) => {
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the password field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Password' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty form submission", async ({ page }) => {
        await page.getByRole('button', { name: 'LOGIN' }).click();

        const field = await page.getByRole('textbox', { name: 'Enter Your Email' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);

    });

    test('navigate to forgot password page', async ({ page }) => {
        await page.getByRole('button', { name: 'Forgot Password' }).click();
        await expect(page.getByRole('heading', { name: 'RESET PASSWORD' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Back to Login' })).toBeVisible();
        await page.getByRole('button', { name: 'Back to Login' }).click();
        await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
    });

    test("should show an error for email with no '@' symbol", async ({ page }) => {
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-userexample.com');

        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with no domain", async ({ page }) => {
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@.com');

        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with multiple '@' symbols", async ({ page }) => {
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@@example.com');

        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with invalid domain", async ({ page }) => {
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@example..com');

        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with space", async ({ page }) => {
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user @example.com');

        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('button', { name: 'LOGIN' }).click();

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });
  
  
});