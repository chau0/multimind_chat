import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should match chat interface screenshot', async ({ page }) => {
    // Wait for all content to load
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('*');
      for (let el of loadingElements) {
        if (el.textContent?.includes('Loading...')) return false;
      }
      return true;
    });

    // Take screenshot of main interface
    await expect(page).toHaveScreenshot('chat-interface.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match agent selector dropdown', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();
    
    // Open dropdown
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Screenshot of dropdown
    await expect(page.locator('text=Available Agents').locator('..').locator('..')).toHaveScreenshot('agent-dropdown.png');
  });

  test('should match message bubbles layout', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a few messages to create layout
    await messageInput.fill('Hello, this is a test message!');
    await sendButton.click();
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible();

    await messageInput.fill('This is a second message to test the layout.');
    await sendButton.click();
    await expect(page.locator('text=This is a second message to test the layout.')).toBeVisible();

    // Wait for responses
    await expect(page.locator('text=Hello, text=Hi, text=How can I help').first()).toBeVisible({ timeout: 10000 });

    // Screenshot of message layout
    const chatArea = page.locator('[class*="chat"], [class*="messages"], main').first();
    await expect(chatArea).toHaveScreenshot('message-bubbles.png');
  });

  test('should match mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for mobile layout to settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('mobile-layout.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match tablet layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Wait for tablet layout to settle
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('tablet-layout.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match dark mode if available', async ({ page }) => {
    // Try to enable dark mode if toggle exists
    const darkModeToggle = page.locator('button[aria-label*="dark"], button[aria-label*="theme"], [data-testid*="theme"]');
    
    if (await darkModeToggle.count() > 0) {
      await darkModeToggle.first().click();
      await page.waitForTimeout(500); // Wait for theme transition
      
      await expect(page).toHaveScreenshot('dark-mode.png', {
        fullPage: true,
        animations: 'disabled'
      });
    } else {
      test.skip('Dark mode toggle not found');
    }
  });

  test('should match error states', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/v1/chat/messages', route => route.abort());

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    await messageInput.fill('This message will fail');
    await sendButton.click();

    // Wait for error state
    await expect(page.locator('text=error, text=failed, text=retry').first()).toBeVisible({ timeout: 5000 });

    // Screenshot of error state
    await expect(page).toHaveScreenshot('error-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match loading states', async ({ page }) => {
    // Simulate slow response
    await page.route('**/api/v1/chat/messages', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    await messageInput.fill('Loading test message');
    await sendButton.click();

    // Wait for loading state
    await expect(page.locator('text=typing, text=is typing').first()).toBeVisible();

    // Screenshot of loading state
    await expect(page).toHaveScreenshot('loading-state.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});