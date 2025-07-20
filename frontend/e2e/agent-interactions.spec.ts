import { test, expect } from '@playwright/test';

test.describe('Agent Interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Reset and seed test data
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');

    // Navigate to chat page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open and close agent selector dropdown', async ({ page }) => {
    // Wait for agents to load
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('*');
      for (let el of loadingElements) {
        if (el.textContent?.includes('Loading...')) return false;
      }
      return true;
    });

    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Click to open dropdown
    await agentButton.click();

    // Should show dropdown
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Should show multiple agents
    await expect(page.locator('text=AI Assistant, text=Assistant').first()).toBeVisible();
    await expect(page.locator('text=Code Expert, text=Coder').first()).toBeVisible();

    // Click backdrop to close
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Dropdown should be hidden
    await expect(page.locator('text=Available Agents')).not.toBeVisible();
  });

  test('should select different agents', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Open dropdown
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Select Coder agent
    await page.locator('text=Code Expert, text=Coder').first().click();

    // Should show selected agent
    await expect(page.locator('text=Code Expert, text=Coder').first()).toBeVisible();

    // Dropdown should close
    await expect(page.locator('text=Available Agents')).not.toBeVisible();
  });

  test('should show agent avatars and colors', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Open dropdown
    await agentButton.click();

    // Should show agent avatars
    await expect(page.locator('text=AI')).toBeVisible(); // Assistant avatar
    await expect(page.locator('text=CE')).toBeVisible(); // Coder avatar

    // Should show agent descriptions
    await expect(page.locator('text=General purpose, text=assistant').first()).toBeVisible();
    await expect(page.locator('text=Programming, text=specialist').first()).toBeVisible();
  });

  test('should handle mention suggestions', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Type @ to trigger mentions
    await messageInput.fill('Hello @');

    // Should show mention suggestions
    await expect(page.locator('text=Mention Agent')).toBeVisible();
    await expect(page.locator('text=@Assistant')).toBeVisible();
    await expect(page.locator('text=@Coder')).toBeVisible();
  });

  test('should filter mention suggestions', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Type partial mention
    await messageInput.fill('Hello @Cod');

    // Should show filtered suggestions
    await expect(page.locator('text=Mention Agent')).toBeVisible();
    await expect(page.locator('text=@Coder')).toBeVisible();

    // Should not show other agents
    await expect(page.locator('text=@Assistant')).not.toBeVisible();
  });

  test('should insert mention when clicked', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');

    // Type @ to show suggestions
    await messageInput.fill('Hello @');

    // Click on Coder suggestion
    await page.locator('text=@Coder').click();

    // Should insert the mention
    await expect(messageInput).toHaveValue('Hello @Coder ');

    // Suggestions should disappear
    await expect(page.locator('text=Mention Agent')).not.toBeVisible();
  });

  test('should send message with mentions', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Type message with mention
    await messageInput.fill('Hello @Assistant, can you help me?');
    await sendButton.click();

    // Should see the message with mention
    await expect(page.locator('text=Hello @Assistant, can you help me?')).toBeVisible();

    // Should get response from mentioned agent
    await expect(page.locator('text=Hello, text=Hi, text=How can I help').first()).toBeVisible({ timeout: 15000 });
  });

  test('should handle multiple mentions in one message', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Type message with multiple mentions
    await messageInput.fill('Hello @Assistant and @Coder, can you both help?');
    await sendButton.click();

    // Should see the message
    await expect(page.locator('text=Hello @Assistant and @Coder, can you both help?')).toBeVisible();

    // Should get response
    await expect(page.locator('text=Hello, text=Hi, text=How can I help').first()).toBeVisible({ timeout: 15000 });
  });

  test('should show agent information in responses', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Hello there!');
    await sendButton.click();

    // Wait for response
    await expect(page.locator('text=Hello, text=Hi').first()).toBeVisible({ timeout: 15000 });

    // Should show agent name in response
    await expect(page.locator('text=AI Assistant, text=Assistant').first()).toBeVisible();

    // Should show agent avatar
    await expect(page.locator('text=AI')).toBeVisible();
  });

  test('should handle agent switching during conversation', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send first message
    await messageInput.fill('First message');
    await sendButton.click();
    await expect(page.locator('text=First message')).toBeVisible();

    // Switch to different agent
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();
    await agentButton.click();
    await page.locator('text=Code Expert, text=Coder').first().click();

    // Send second message
    await messageInput.fill('Second message to different agent');
    await sendButton.click();
    await expect(page.locator('text=Second message to different agent')).toBeVisible();

    // Both messages should be visible
    await expect(page.locator('text=First message')).toBeVisible();
    await expect(page.locator('text=Second message to different agent')).toBeVisible();
  });

  test('should show loading state while agents load', async ({ page }) => {
    // Navigate to page and immediately check for loading
    await page.goto('/');

    // Should show loading state initially
    await expect(page.locator('text=Loading...')).toBeVisible();

    // Loading should disappear
    await expect(page.locator('text=Loading...')).not.toBeVisible({ timeout: 15000 });

    // Should show agents
    await expect(page.locator('text=AI Assistant, text=Assistant').first()).toBeVisible();
  });
});
