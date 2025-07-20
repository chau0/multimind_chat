import { test, expect } from '@playwright/test';

test.describe('Error Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept and fail API requests
    await page.route('**/api/v1/chat/messages', route => {
      route.abort('failed');
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('This message should fail');
    await sendButton.click();

    // Message should still appear (optimistic update)
    await expect(page.locator('text=This message should fail')).toBeVisible();

    // Should handle error gracefully (no crash)
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();

    // Input should remain functional
    await expect(messageInput).toBeEnabled();
  });

  test('should handle slow API responses', async ({ page }) => {
    // Intercept and delay API responses
    await page.route('**/api/v1/chat/messages', async route => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
      route.continue();
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Slow response test');
    await sendButton.click();

    // Should show message immediately
    await expect(page.locator('text=Slow response test')).toBeVisible();

    // Should show typing indicator
    await expect(page.locator('text=typing, text=is typing').first()).toBeVisible({ timeout: 2000 });

    // Should eventually get response
    await expect(page.locator('text=Hello, text=Hi').first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle API server errors', async ({ page }) => {
    // Intercept and return server error
    await page.route('**/api/v1/chat/messages', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Internal server error' })
      });
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Server error test');
    await sendButton.click();

    // Should handle error gracefully
    await expect(page.locator('text=Server error test')).toBeVisible();

    // App should remain functional
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(messageInput).toBeEnabled();
  });

  test('should handle malformed API responses', async ({ page }) => {
    // Intercept and return invalid JSON
    await page.route('**/api/v1/chat/messages', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'invalid json response'
      });
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Malformed response test');
    await sendButton.click();

    // Should handle error gracefully
    await expect(page.locator('text=Malformed response test')).toBeVisible();

    // App should remain functional
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
  });

  test('should handle agent loading failures', async ({ page }) => {
    // Intercept and fail agent requests
    await page.route('**/api/v1/agents', route => {
      route.abort('failed');
    });

    // Reload page to trigger agent loading failure
    await page.reload();

    // Should show error state but not crash
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();

    // Should show some kind of error indication
    await expect(page.locator('text=Loading..., text=Error, text=Failed').first()).toBeVisible({ timeout: 10000 });
  });

  test('should handle empty API responses', async ({ page }) => {
    // Intercept and return empty response
    await page.route('**/api/v1/agents', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.reload();

    // Should handle empty agents list
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();

    // Should still show input
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
  });

  test('should handle browser refresh during conversation', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Message before refresh');
    await sendButton.click();
    await expect(page.locator('text=Message before refresh')).toBeVisible();

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should load fresh state
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();

    // Should be able to send new messages
    await messageInput.fill('Message after refresh');
    await sendButton.click();
    await expect(page.locator('text=Message after refresh')).toBeVisible();
  });

  test('should handle concurrent message sending', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send multiple messages quickly
    await messageInput.fill('Message 1');
    await sendButton.click();

    await messageInput.fill('Message 2');
    await sendButton.click();

    await messageInput.fill('Message 3');
    await sendButton.click();

    // All messages should appear
    await expect(page.locator('text=Message 1')).toBeVisible();
    await expect(page.locator('text=Message 2')).toBeVisible();
    await expect(page.locator('text=Message 3')).toBeVisible();

    // Should handle responses gracefully
    await expect(page.locator('text=Hello, text=Hi').first()).toBeVisible({ timeout: 15000 });
  });

  test('should handle very long messages', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Create very long message
    const longMessage = 'A'.repeat(1000);

    await messageInput.fill(longMessage);
    await sendButton.click();

    // Should handle long message
    await expect(page.locator(`text=${longMessage.substring(0, 50)}`)).toBeVisible();

    // Should not break layout
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
  });

  test('should handle special characters in messages', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Test various special characters
    const specialMessage = 'Test: <script>alert("xss")</script> & "quotes" & émojis 🚀 & symbols ©®™';

    await messageInput.fill(specialMessage);
    await sendButton.click();

    // Should handle special characters safely
    await expect(page.locator('text=Test:').first()).toBeVisible();

    // Should not execute scripts
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
  });

  test('should handle offline/online transitions', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send message while online
    await messageInput.fill('Online message');
    await sendButton.click();
    await expect(page.locator('text=Online message')).toBeVisible();

    // Simulate going offline
    await page.context().setOffline(true);

    // Try to send message while offline
    await messageInput.fill('Offline message');
    await sendButton.click();

    // Should handle offline gracefully
    await expect(page.locator('text=Offline message')).toBeVisible();

    // Go back online
    await page.context().setOffline(false);

    // Should work again
    await messageInput.fill('Back online message');
    await sendButton.click();
    await expect(page.locator('text=Back online message')).toBeVisible();
  });

  test('should handle rapid UI interactions', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Rapidly click agent selector
    for (let i = 0; i < 5; i++) {
      await agentButton.click();
      await page.waitForTimeout(100);
    }

    // Should still be functional
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(messageInput).toBeEnabled();

    // Should be able to type
    await messageInput.fill('Rapid interaction test');
    await expect(messageInput).toHaveValue('Rapid interaction test');
  });
});
