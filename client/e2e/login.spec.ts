import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Studora/);
});

test('can navigate to auth page', async ({ page }) => {
  await page.goto('/');
  // Find the login button and click
  await page.click('button:has-text("Log In")');
  await expect(page).toHaveURL(/\/auth/);
  await expect(page.locator('h2')).toContainText(/Welcome back|Create your account/);
});

test('login form validation', async ({ page }) => {
  await page.goto('/auth');
  await page.click('button[type="submit"]');
  // Check for HTML5 validation or application error toast
  const emailInput = page.locator('input[type="email"]');
  const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.checkValidity());
  expect(isInvalid).toBeTruthy();
});
