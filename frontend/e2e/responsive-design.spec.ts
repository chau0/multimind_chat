import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Should show full layout
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
    
    // Should have proper spacing
    const chatContainer = page.locator('[class*="chat"], [class*="container"]').first();
    const boundingBox = await chatContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(800);
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Should still show all elements
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
    
    // Agent selector should be accessible
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should show mobile-optimized layout
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
    
    // Input should be properly sized
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const inputBox = await messageInput.boundingBox();
    expect(inputBox?.width).toBeLessThan(350); // Should fit in mobile width
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Touch interactions should work
    await messageInput.tap();
    await messageInput.fill('Mobile test message');
    await sendButton.tap();
    
    // Should see the message
    await expect(page.locator('text=Mobile test message')).toBeVisible();
  });

  test('should show proper keyboard behavior on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    
    // Focus input (would trigger virtual keyboard on real device)
    await messageInput.focus();
    
    // Should be able to type
    await messageInput.fill('Testing mobile keyboard');
    await expect(messageInput).toHaveValue('Testing mobile keyboard');
  });

  test('should handle agent dropdown on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();
    
    // Tap to open dropdown
    await agentButton.tap();
    
    // Should show dropdown that fits screen
    await expect(page.locator('text=Available Agents')).toBeVisible();
    
    // Dropdown should not overflow
    const dropdown = page.locator('text=Available Agents').locator('..').locator('..');
    const dropdownBox = await dropdown.boundingBox();
    expect(dropdownBox?.width).toBeLessThan(375);
  });

  test('should handle mention suggestions on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    
    // Type mention trigger
    await messageInput.fill('Hello @');
    
    // Should show mention suggestions
    await expect(page.locator('text=Mention Agent')).toBeVisible();
    
    // Suggestions should fit screen
    const suggestions = page.locator('text=Mention Agent').locator('..').locator('..');
    const suggestionsBox = await suggestions.boundingBox();
    expect(suggestionsBox?.width).toBeLessThan(375);
  });

  test('should handle long messages on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Type long message
    const longMessage = 'This is a very long message that should wrap properly on mobile devices and not cause horizontal scrolling or layout issues.';
    await messageInput.fill(longMessage);
    await sendButton.tap();
    
    // Should see the message wrapped properly
    await expect(page.locator(`text=${longMessage}`)).toBeVisible();
    
    // Should not cause horizontal scroll
    const pageWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(pageWidth).toBeLessThanOrEqual(375);
  });

  test('should maintain functionality across viewport changes', async ({ page }) => {
    // Start with desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Send a message on desktop
    await messageInput.fill('Desktop message');
    await sendButton.click();
    await expect(page.locator('text=Desktop message')).toBeVisible();
    
    // Switch to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Should still see the message
    await expect(page.locator('text=Desktop message')).toBeVisible();
    
    // Should be able to send another message
    await messageInput.fill('Mobile message');
    await sendButton.tap();
    await expect(page.locator('text=Mobile message')).toBeVisible();
    
    // Both messages should be visible
    await expect(page.locator('text=Desktop message')).toBeVisible();
    await expect(page.locator('text=Mobile message')).toBeVisible();
  });

  test('should handle orientation changes', async ({ page }) => {
    // Portrait mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    await messageInput.fill('Portrait message');
    
    // Landscape mobile
    await page.setViewportSize({ width: 667, height: 375 });
    
    // Should still work in landscape
    await expect(messageInput).toHaveValue('Portrait message');
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
  });
});