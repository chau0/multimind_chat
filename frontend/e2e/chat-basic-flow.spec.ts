import { test, expect } from '@playwright/test';

test.describe('Basic Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset test data before each test
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    
    // Navigate to chat page
    await page.goto('/');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load chat page with welcome message', async ({ page }) => {
    // Should show the main chat interface
    await expect(page.locator('h1')).toContainText('Multimind');
    
    // Should show welcome message or empty state
    await expect(page.locator('text=Welcome to Multimind')).toBeVisible();
    
    // Should show chat input
    await expect(page.locator('textarea[placeholder*="Type your message"]')).toBeVisible();
    
    // Should show send button
    await expect(page.locator('button[aria-label*="send" i], button:has-text("Send")').first()).toBeVisible();
  });

  test('should load and display agents', async ({ page }) => {
    // Wait for agents to load
    await page.waitForFunction(() => {
      const loadingText = document.querySelector('text=Loading...');
      return !loadingText || !loadingText.textContent?.includes('Loading');
    });
    
    // Should show agent selector
    await expect(page.locator('text=AI Assistant, text=Assistant').first()).toBeVisible();
    
    // Click agent selector to see dropdown
    await page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first().click();
    
    // Should show available agents
    await expect(page.locator('text=Available Agents')).toBeVisible();
    await expect(page.locator('text=AI Assistant, text=Assistant').first()).toBeVisible();
  });

  test('should send and receive a basic message', async ({ page }) => {
    // Wait for page to be ready
    await page.waitForSelector('textarea[placeholder*="Type your message"]');
    
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Type a message
    await messageInput.fill('Hello, this is a test message!');
    
    // Send the message
    await sendButton.click();
    
    // Should see the user message immediately (optimistic update)
    await expect(page.locator('text=Hello, this is a test message!')).toBeVisible();
    
    // Should see "You" label for user message
    await expect(page.locator('text=You')).toBeVisible();
    
    // Wait for agent response (with timeout)
    await expect(page.locator('text=Hello, text=Hi, text=How can I help').first()).toBeVisible({ timeout: 15000 });
    
    // Input should be cleared after sending
    await expect(messageInput).toHaveValue('');
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Send first message
    await messageInput.fill('First message');
    await sendButton.click();
    await expect(page.locator('text=First message')).toBeVisible();
    
    // Send second message
    await messageInput.fill('Second message');
    await sendButton.click();
    await expect(page.locator('text=Second message')).toBeVisible();
    
    // Both messages should be visible
    await expect(page.locator('text=First message')).toBeVisible();
    await expect(page.locator('text=Second message')).toBeVisible();
    
    // Should have multiple message bubbles
    const messageBubbles = page.locator('[data-testid*="message"], .message, [class*="message"]');
    await expect(messageBubbles).toHaveCount(4, { timeout: 15000 }); // 2 user + 2 agent responses
  });

  test('should show typing indicator during response', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Send a message
    await messageInput.fill('Tell me a story');
    await sendButton.click();
    
    // Should show typing indicator
    await expect(page.locator('text=typing, text=is typing').first()).toBeVisible({ timeout: 5000 });
    
    // Typing indicator should disappear when response arrives
    await expect(page.locator('text=typing, text=is typing').first()).not.toBeVisible({ timeout: 20000 });
  });

  test('should handle Enter key to send message', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    
    // Type message and press Enter
    await messageInput.fill('Message sent with Enter key');
    await messageInput.press('Enter');
    
    // Should see the message
    await expect(page.locator('text=Message sent with Enter key')).toBeVisible();
    
    // Input should be cleared
    await expect(messageInput).toHaveValue('');
  });

  test('should handle Shift+Enter for new line', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    
    // Type message and press Shift+Enter
    await messageInput.fill('Line 1');
    await messageInput.press('Shift+Enter');
    await messageInput.type('Line 2');
    
    // Should have multiline content
    await expect(messageInput).toHaveValue('Line 1\nLine 2');
    
    // Now send with Enter
    await messageInput.press('Enter');
    
    // Should see the multiline message
    await expect(page.locator('text=Line 1')).toBeVisible();
    await expect(page.locator('text=Line 2')).toBeVisible();
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    
    // Send button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
    
    // Type something
    await messageInput.fill('Test message');
    
    // Send button should be enabled
    await expect(sendButton).toBeEnabled();
    
    // Clear input
    await messageInput.fill('');
    
    // Send button should be disabled again
    await expect(sendButton).toBeDisabled();
  });

  test('should show character count', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    
    // Should show initial character count
    await expect(page.locator('text=0/2000')).toBeVisible();
    
    // Type some text
    await messageInput.fill('Hello world');
    
    // Should update character count
    await expect(page.locator('text=11/2000')).toBeVisible();
  });

  test('should show agent count', async ({ page }) => {
    // Should show number of available agents
    await expect(page.locator('text=agents available').first()).toBeVisible();
    
    // Should show at least 1 agent
    await expect(page.locator('text=1 agents available, text=2 agents available, text=3 agents available, text=4 agents available').first()).toBeVisible();
  });
});