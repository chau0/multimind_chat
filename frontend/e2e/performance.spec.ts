import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
  });

  test('should load chat page within performance budget', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};

          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });

          // Also get navigation timing
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
          vitals.loadComplete = navigation.loadEventEnd - navigation.navigationStart;

          resolve(vitals);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });

        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    // Performance assertions
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(2000); // FCP should be under 2s
    }
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(4000); // LCP should be under 4s
    }
    if (metrics.cls !== undefined) {
      expect(metrics.cls).toBeLessThan(0.1); // CLS should be under 0.1
    }
    if (metrics.domContentLoaded) {
      expect(metrics.domContentLoaded).toBeLessThan(3000); // DOM ready under 3s
    }
  });

  test('should handle multiple rapid messages efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Measure time to send 5 rapid messages
    const startTime = Date.now();

    for (let i = 1; i <= 5; i++) {
      await messageInput.fill(`Rapid message ${i}`);
      await sendButton.click();
      await expect(page.locator(`text=Rapid message ${i}`)).toBeVisible();
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Should handle 5 messages in under 10 seconds
    expect(totalTime).toBeLessThan(10000);

    // All messages should be visible
    for (let i = 1; i <= 5; i++) {
      await expect(page.locator(`text=Rapid message ${i}`)).toBeVisible();
    }
  });

  test('should maintain performance with large conversation history', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send 20 messages to create history
    for (let i = 1; i <= 20; i++) {
      await messageInput.fill(`History message ${i}`);
      await sendButton.click();
      await expect(page.locator(`text=History message ${i}`)).toBeVisible();
    }

    // Measure scroll performance
    const scrollStartTime = Date.now();
    await page.locator('body').press('Home'); // Scroll to top
    await page.locator('body').press('End');  // Scroll to bottom
    const scrollEndTime = Date.now();

    // Scrolling should be smooth (under 1 second)
    expect(scrollEndTime - scrollStartTime).toBeLessThan(1000);

    // New message should still be fast
    const newMessageStartTime = Date.now();
    await messageInput.fill('New message after history');
    await sendButton.click();
    await expect(page.locator('text=New message after history')).toBeVisible();
    const newMessageEndTime = Date.now();

    // New message should be fast even with history
    expect(newMessageEndTime - newMessageStartTime).toBeLessThan(3000);
  });

  test('should load agents efficiently', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');

    // Wait for agents to load
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('*');
      for (let el of loadingElements) {
        if (el.textContent?.includes('Loading...')) return false;
      }
      return true;
    });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Agents should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);

    // Should show agent selector
    await expect(page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first()).toBeVisible();
  });

  test('should handle agent switching efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Measure agent switching time
    const startTime = Date.now();

    // Open dropdown
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Select different agent
    await page.locator('text=Code Expert, text=Coder').first().click();

    // Wait for selection to complete
    await expect(page.locator('button:has-text("Coder"), button:has-text("Code Expert")').first()).toBeVisible();

    const endTime = Date.now();
    const switchTime = endTime - startTime;

    // Agent switching should be fast (under 2 seconds)
    expect(switchTime).toBeLessThan(2000);
  });

  test('should handle network delays gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/api/v1/chat/messages', async (route) => {
      // Add 2 second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send message with simulated delay
    await messageInput.fill('Test message with delay');
    await sendButton.click();

    // Should show loading/typing indicator
    await expect(page.locator('text=typing, text=is typing').first()).toBeVisible({ timeout: 1000 });

    // Should eventually show response (with extended timeout)
    await expect(page.locator('text=Test message with delay')).toBeVisible();

    // Typing indicator should disappear
    await expect(page.locator('text=typing, text=is typing').first()).not.toBeVisible({ timeout: 10000 });
  });
});
