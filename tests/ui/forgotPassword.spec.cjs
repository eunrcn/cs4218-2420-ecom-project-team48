const { test, expect } = require('@playwright/test');

test.describe('Forgot Password Page', () => {
  test('should navigate to forgot password page from login page', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.getByRole('button', { name: 'Forgot Password' }).click();

    await expect(page.getByRole('heading', { name: 'RESET PASSWORD' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter Your Security Answer' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Enter New Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RESET PASSWORD' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');
    
    // Submit form without filling any fields
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    
    // Validation message should appear
    const emailIsInvalid = await page.evaluate(() => {
      const email = document.getElementById('email');
      return !email.validity.valid;
    });
    expect(emailIsInvalid).toBeTruthy();
    
    // Fill only email and check other validations appear
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('test@example.com');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    const answerIsInvalid = await page.evaluate(() => {
      const answer = document.getElementById('answer');
      return !answer.validity.valid;
    });
    expect(answerIsInvalid).toBeTruthy();
    
    // Fill email and answer, check that password validation appears
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('test answer');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
    
    const passwordIsInvalid = await page.evaluate(() => {
      const password = document.getElementById('newPassword');
      return !password.validity.valid;
    });
    expect(passwordIsInvalid).toBeTruthy();
  });

  test('should navigate back to login page', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');

    await page.getByRole('button', { name: 'Back to Login' }).click();
    
    await expect(page).toHaveURL('http://localhost:3000/login');
    await expect(page.getByRole('heading', { name: 'LOGIN FORM' })).toBeVisible();
  });

  test('should show error message for wrong credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');

    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('mj@nj.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('bread');
    await page.getByRole('textbox', { name: 'Enter New Password' }).fill('newpassword123');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page.locator('div').filter({ hasText: /^Something went wrong\. Please try again\.$/ }).nth(2)).toBeVisible();
  });

  test('should successfully reset password', async ({ page }) => {
    await page.goto('http://localhost:3000/forgot-password');

    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@user.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('user');
    await page.getByRole('textbox', { name: 'Enter New Password' }).fill('newpassword123');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page.getByText('✅Password Reset Successfully')).toBeVisible();

    await expect(page).toHaveURL('http://localhost:3000/login', {timeout: 5000});

    // Reset password back to original
    await page.goto('http://localhost:3000/forgot-password');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('user@user.com');
    await page.getByRole('textbox', { name: 'Enter Your Security Answer' }).fill('user');
    await page.getByRole('textbox', { name: 'Enter New Password' }).fill('user');
    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();
  });
}); 