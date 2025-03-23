import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
    await page.goto("."); // Go to the home page
});

test.afterEach(async () => {});

test.describe('user register', () => {
    test('user register successfully', async ({ page }) => {
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
    });
  
    test('should show error message when email is already registered', async ({ page }) => {
        // register user
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

        // register again with same details
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

        // should show error
        await expect(page.getByText('Already registered please').first()).toBeVisible();
    });

    test("should show an error for empty name field", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
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

        // Check if the name field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Name' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty email field", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
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

        // Check if the email field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Email' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty password field", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('99912345');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
        await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Check if the password field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Password' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty phone field", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('textbox', { name: 'Enter Your Address' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('singapore');
        await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
        await page.getByRole('button', { name: 'REGISTER' }).click();

        // Check if the phone field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Phone' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty Address field", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test-user@example.com');
        await page.getByRole('textbox', { name: 'Enter Your Password' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('password123');
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('99912345');
        await page.getByPlaceholder('Enter Your DOB').fill('2000-01-01');
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
        await page.getByRole('button', { name: 'REGISTER' }).click();
       
        // Check if the Address field is invalid
        const field = await page.getByRole('textbox', { name: 'Enter Your Address' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
    });

    test("should show an error for empty DOB field", async ({ page }) => {
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
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).click();
        await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('running');
        await page.getByRole('button', { name: 'REGISTER' }).click();
        
        // Check if the DOB field is invalid
        const field = await page.getByPlaceholder('Enter Your DOB');
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);

    });

    test("should show an error for empty favourite sport field", async ({ page }) => {
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
        await page.getByRole('button', { name: 'REGISTER' }).click();
        
        // Check if the favourite sport field is invalid
        const field = await page.getByRole('textbox', { name: 'What is Your Favorite sports' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);
        
    });

    test("should show an error for empty form submission", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('button', { name: 'REGISTER' }).click();

        const field = await page.getByRole('textbox', { name: 'Enter Your Name' });
        const isValid = await field.evaluate(input => input.validity.valueMissing);
        expect(isValid).toBe(true);

    });

    test("should show an error for email with no '@' symbol", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');
        
        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-userexample.com');

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

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with no domain", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');

        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@.com');

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

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with multiple '@' symbols", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');

        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@@example.com');

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

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with invalid domain", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');

        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user@example..com');

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

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });

    test("should show an error for email with space", async ({ page }) => {
        await page.getByRole('link', { name: 'Register' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).click();
        await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('test user');

        // Invalid email format
        await page.getByRole('textbox', { name: 'Enter Your Email' }).click();
        const emailField = await page.getByRole('textbox', { name: 'Enter Your Email' });
        await emailField.fill('test-user @example.com');

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

        // Check if the email field is invalid
        const isInvalid = await emailField.evaluate(input => input.validity.typeMismatch);
        expect(isInvalid).toBe(true);
    });
    
});