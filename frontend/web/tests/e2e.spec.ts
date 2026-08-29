import { test, expect } from '@playwright/test';

test.describe('Eventra E2E Flow', () => {
  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
  };

  test('User Registration, Login, Create Event, and RSVP', async ({ page }) => {
    // 1. Register
    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder="Full Name"]', testUser.name);
    await page.fill('input[placeholder="Email Address"]', testUser.email);
    await page.fill('input[placeholder="Password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await expect(page).toHaveURL(/.*\/login/);

    // 2. Login
    await page.fill('input[placeholder="Email Address"]', testUser.email);
    await page.fill('input[placeholder="Password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('http://localhost:5173/');
    await expect(page.locator('h1', { hasText: 'My Events' })).toBeVisible();

    // 3. Create Event
    await page.goto('http://localhost:5173/events/create');
    
    // Step 1: Basic Info
    await page.fill('input[placeholder="E.g., Tech Startup Mixer"]', 'Playwright Test Event');
    await page.fill('textarea[placeholder="What is this event about?"]', 'This is an end to end test event.');
    await page.click('button:has-text("Next")');
    
    // Step 2: Date & Location
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateString);
    await page.fill('input[placeholder="Full address or meeting link"]', 'Virtual');
    await page.click('button:has-text("Next")');

    // Step 3: Settings
    await page.click('button:has-text("Create Event")');

    // Wait for redirect to event details
    await expect(page).toHaveURL(/.*\/events\/.+/);
    await expect(page.locator('h1', { hasText: 'Playwright Test Event' })).toBeVisible();

    // 4. RSVP Flow (Host is auto-RSVPed as attending, we'll verify it)
    await expect(page.locator('button', { hasText: 'ATTENDING' })).toBeVisible();
    
    // Switch to MAYBE
    await page.click('button:has-text("MAYBE")');
    // Verify toast or active state if applicable
    await expect(page.locator('button', { hasText: 'MAYBE' }).first()).toHaveCSS('background-color', 'rgb(234, 179, 8)'); // yellow-500
  });
});
