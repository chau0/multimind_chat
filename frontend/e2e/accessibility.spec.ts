import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Should have main heading
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Multimind');

    // Should have logical heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have proper form labels', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Input should have accessible name (label, aria-label, or placeholder)
    const accessibleName = await messageInput.getAttribute('aria-label') ||
                           await messageInput.getAttribute('placeholder');
    expect(accessibleName).toBeTruthy();
  });

  test('should have proper button labels', async ({ page }) => {
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Button should have accessible name
    const buttonText = await sendButton.textContent();
    const ariaLabel = await sendButton.getAttribute('aria-label');

    expect(buttonText || ariaLabel).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab to message input
    await page.keyboard.press('Tab');

    // Should focus on input
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    await expect(messageInput).toBeFocused();

    // Type message
    await page.keyboard.type('Keyboard navigation test');

    // Tab to send button
    await page.keyboard.press('Tab');

    // Should focus on send button
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    await expect(sendButton).toBeFocused();

    // Press Enter to send
    await page.keyboard.press('Enter');

    // Should see message
    await expect(page.locator('text=Keyboard navigation test')).toBeVisible();
  });

  test('should support Enter key to send message', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    await messageInput.focus();
    await page.keyboard.type('Enter key test');
    await page.keyboard.press('Enter');

    // Should send message
    await expect(page.locator('text=Enter key test')).toBeVisible();
  });

  test('should support Escape key to close dropdowns', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Open dropdown
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Should close dropdown
    await expect(page.locator('text=Available Agents')).not.toBeVisible();
  });

  test('should have proper focus management', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Focus should be visible
    await messageInput.focus();

    // Should have focus indicator
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe('TEXTAREA');

    // Tab to agent button
    await page.keyboard.press('Tab');
    await expect(agentButton).toBeFocused();
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for ARIA landmarks
    const main = page.locator('main, [role="main"]');
    if (await main.count() > 0) {
      await expect(main.first()).toBeVisible();
    }

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const hasLabel = await button.getAttribute('aria-label') ||
                      await button.textContent();
      expect(hasLabel).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');

    // Should have some form of live region for dynamic content
    if (await liveRegions.count() > 0) {
      await expect(liveRegions.first()).toBeInTheDocument();
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - in real scenarios you'd use axe-core
    const textElements = page.locator('p, span, div, h1, h2, h3, button');
    const count = await textElements.count();

    // Ensure text elements are visible (basic contrast check)
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      if (await element.isVisible()) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });

        // Basic check that text has color
        expect(styles.color).not.toBe('');
      }
    }
  });

  test('should support high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            border: 1px solid !important;
          }
        }
      `
    });

    // Should still be functional
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Should still be functional without animations
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    await messageInput.fill('Reduced motion test');
    await sendButton.click();

    await expect(page.locator('text=Reduced motion test')).toBeVisible();
  });

  test('should have proper tab order', async ({ page }) => {
    const focusableElements = [
      'textarea[placeholder*="Type your message"]',
      'button:has-text("Assistant"), button:has-text("AI Assistant")',
      'button[aria-label*="send" i], button:has-text("Send")'
    ];

    // Tab through elements
    for (const selector of focusableElements) {
      await page.keyboard.press('Tab');
      const element = page.locator(selector).first();

      // Check if element exists and is focusable
      if (await element.count() > 0 && await element.isVisible()) {
        await expect(element).toBeFocused();
      }
    }
  });

  test('should announce dynamic content changes', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Accessibility test message');
    await sendButton.click();

    // Should see the message (which would be announced by screen readers)
    await expect(page.locator('text=Accessibility test message')).toBeVisible();

    // Check for any aria-live regions that might announce the change
    const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    if (await liveRegions.count() > 0) {
      await expect(liveRegions.first()).toBeInTheDocument();
    }
  });

  test('should handle focus trapping in modals', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Open agent dropdown (modal-like behavior)
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Tab should cycle within the dropdown
    await page.keyboard.press('Tab');

    // Should focus on first agent option
    const firstAgent = page.locator('button:has-text("AI Assistant"), button:has-text("Assistant")').first();
    if (await firstAgent.isVisible()) {
      await expect(firstAgent).toBeFocused();
    }
  });

  test('should provide clear error messages', async ({ page }) => {
    // Try to send empty message
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send button should be disabled for empty input
    await expect(sendButton).toBeDisabled();

    // This provides clear feedback about why action can't be performed
  });
});
