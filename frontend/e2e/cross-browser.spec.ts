import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should work consistently across browsers', async ({ page, browserName }) => {
    // Test basic functionality across all browsers
    console.log(`Testing on ${browserName}`);

    // Should load main interface
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();

    // Should be able to send message
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    await messageInput.fill(`Test message from ${browserName}`);
    await sendButton.click();

    await expect(page.locator(`text=Test message from ${browserName}`)).toBeVisible();
  });

  test('should handle JavaScript features consistently', async ({ page, browserName }) => {
    console.log(`Testing JavaScript features on ${browserName}`);

    // Test modern JavaScript features
    const jsFeatures = await page.evaluate(() => {
      const features = {
        asyncAwait: typeof (async () => {}) === 'function',
        arrow: typeof (() => {}) === 'function',
        destructuring: true,
        modules: typeof import !== 'undefined',
        fetch: typeof fetch !== 'undefined',
        promises: typeof Promise !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        sessionStorage: typeof sessionStorage !== 'undefined'
      };

      try {
        const [a, b] = [1, 2]; // Test destructuring
        features.destructuring = a === 1 && b === 2;
      } catch {
        features.destructuring = false;
      }

      return features;
    });

    // All modern browsers should support these features
    expect(jsFeatures.asyncAwait).toBe(true);
    expect(jsFeatures.arrow).toBe(true);
    expect(jsFeatures.destructuring).toBe(true);
    expect(jsFeatures.fetch).toBe(true);
    expect(jsFeatures.promises).toBe(true);
    expect(jsFeatures.localStorage).toBe(true);
    expect(jsFeatures.sessionStorage).toBe(true);
  });

  test('should handle CSS features consistently', async ({ page, browserName }) => {
    console.log(`Testing CSS features on ${browserName}`);

    // Test CSS Grid and Flexbox support
    const cssSupport = await page.evaluate(() => {
      const testEl = document.createElement('div');
      document.body.appendChild(testEl);

      const features = {
        grid: CSS.supports('display', 'grid'),
        flexbox: CSS.supports('display', 'flex'),
        customProperties: CSS.supports('--custom-property', 'value'),
        transforms: CSS.supports('transform', 'translateX(10px)'),
        transitions: CSS.supports('transition', 'all 0.3s ease')
      };

      document.body.removeChild(testEl);
      return features;
    });

    // Modern browsers should support these CSS features
    expect(cssSupport.grid).toBe(true);
    expect(cssSupport.flexbox).toBe(true);
    expect(cssSupport.customProperties).toBe(true);
    expect(cssSupport.transforms).toBe(true);
    expect(cssSupport.transitions).toBe(true);
  });

  test('should handle form interactions consistently', async ({ page, browserName }) => {
    console.log(`Testing form interactions on ${browserName}`);

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Test various input methods
    await messageInput.fill('');
    await messageInput.type('Typed message');
    await expect(messageInput).toHaveValue('Typed message');

    // Test keyboard shortcuts
    await messageInput.press('Control+a');
    await messageInput.type('Selected and replaced');
    await expect(messageInput).toHaveValue('Selected and replaced');

    // Test Enter key behavior
    await messageInput.fill('Enter key test');
    await messageInput.press('Enter');
    await expect(page.locator('text=Enter key test')).toBeVisible();
  });

  test('should handle agent interactions consistently', async ({ page, browserName }) => {
    console.log(`Testing agent interactions on ${browserName}`);

    // Wait for agents to load
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('*');
      for (let el of loadingElements) {
        if (el.textContent?.includes('Loading...')) return false;
      }
      return true;
    });

    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Test dropdown interaction
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Test agent selection
    await page.locator('text=Code Expert, text=Coder').first().click();
    await expect(page.locator('button:has-text("Coder"), button:has-text("Code Expert")').first()).toBeVisible();

    // Test mention functionality
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    await messageInput.fill('Hello @');

    // Should show mention suggestions
    await expect(page.locator('text=Mention Agent')).toBeVisible();
  });

  test('should handle responsive design consistently', async ({ page, browserName }) => {
    console.log(`Testing responsive design on ${browserName}`);

    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Wait for layout to settle

      // Should maintain functionality at all sizes
      await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
      await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();

      // Input should be properly sized
      const inputBox = await page.locator('textarea[placeholder*="Type your message"]').boundingBox();
      expect(inputBox?.width).toBeGreaterThan(100);
      expect(inputBox?.width).toBeLessThan(viewport.width);
    }
  });

  test('should handle network conditions consistently', async ({ page, browserName }) => {
    console.log(`Testing network handling on ${browserName}`);

    // Test with simulated slow network
    await page.route('**/api/v1/chat/messages', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    await messageInput.fill('Slow network test');
    await sendButton.click();

    // Should show loading state
    await expect(page.locator('text=typing, text=is typing').first()).toBeVisible();

    // Should eventually complete
    await expect(page.locator('text=Slow network test')).toBeVisible();
    await expect(page.locator('text=typing, text=is typing').first()).not.toBeVisible({ timeout: 10000 });
  });
});
