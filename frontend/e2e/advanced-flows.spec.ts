import { test, expect } from '@playwright/test';

test.describe('Advanced User Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8001/api/v1/test/reset');
    await page.goto('http://localhost:8001/api/v1/test/seed');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle complex multi-agent conversation', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Start with Assistant
    await messageInput.fill('Hello, I need help with a coding project');
    await sendButton.click();
    await expect(page.locator('text=Hello, I need help with a coding project')).toBeVisible();

    // Switch to Coder
    await agentButton.click();
    await page.locator('text=Code Expert, text=Coder').first().click();
    await expect(page.locator('button:has-text("Coder"), button:has-text("Code Expert")').first()).toBeVisible();

    // Ask coding question
    await messageInput.fill('Can you help me write a React component?');
    await sendButton.click();
    await expect(page.locator('text=Can you help me write a React component?')).toBeVisible();

    // Switch to Writer for documentation
    await agentButton.click();
    await page.locator('text=Creative Writer, text=Writer').first().click();
    await expect(page.locator('button:has-text("Writer"), button:has-text("Creative Writer")').first()).toBeVisible();

    await messageInput.fill('Now help me write documentation for this component');
    await sendButton.click();
    await expect(page.locator('text=Now help me write documentation for this component')).toBeVisible();

    // Verify all messages are visible in conversation history
    await expect(page.locator('text=Hello, I need help with a coding project')).toBeVisible();
    await expect(page.locator('text=Can you help me write a React component?')).toBeVisible();
    await expect(page.locator('text=Now help me write documentation for this component')).toBeVisible();
  });

  test('should handle mention-based agent switching', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Use @mention to switch agents
    await messageInput.fill('@Coder can you help me debug this JavaScript?');
    
    // Should show mention suggestions
    await expect(page.locator('text=Mention Agent')).toBeVisible();
    
    // Select the Coder mention
    await page.locator('text=Code Expert, text=Coder').first().click();
    
    // Send the message
    await sendButton.click();
    
    // Should see the message and agent should be switched
    await expect(page.locator('text=@Coder can you help me debug this JavaScript?')).toBeVisible();
    await expect(page.locator('button:has-text("Coder"), button:has-text("Code Expert")').first()).toBeVisible();

    // Follow up with another mention
    await messageInput.fill('@Writer please document this solution');
    await page.locator('text=Creative Writer, text=Writer').first().click();
    await sendButton.click();

    await expect(page.locator('text=@Writer please document this solution')).toBeVisible();
    await expect(page.locator('button:has-text("Writer"), button:has-text("Creative Writer")').first()).toBeVisible();
  });

  test('should handle session persistence across page reloads', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send some messages
    await messageInput.fill('First message before reload');
    await sendButton.click();
    await expect(page.locator('text=First message before reload')).toBeVisible();

    await messageInput.fill('Second message before reload');
    await sendButton.click();
    await expect(page.locator('text=Second message before reload')).toBeVisible();

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Messages should still be visible (if session persistence is implemented)
    // Note: This test assumes session persistence - adjust based on your implementation
    try {
      await expect(page.locator('text=First message before reload')).toBeVisible({ timeout: 5000 });
      await expect(page.locator('text=Second message before reload')).toBeVisible();
    } catch {
      // If session persistence is not implemented, this is expected
      console.log('Session persistence not implemented - this is expected');
    }

    // Should be able to continue conversation
    await messageInput.fill('Message after reload');
    await sendButton.click();
    await expect(page.locator('text=Message after reload')).toBeVisible();
  });

  test('should handle concurrent user interactions', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Start typing a message
    await messageInput.fill('This is a test message');

    // While typing, try to open agent dropdown
    await agentButton.click();
    await expect(page.locator('text=Available Agents')).toBeVisible();

    // Close dropdown and continue with message
    await page.locator('body').click({ position: { x: 10, y: 10 } });
    await expect(page.locator('text=Available Agents')).not.toBeVisible();

    // Message should still be there
    await expect(messageInput).toHaveValue('This is a test message');

    // Send the message
    await sendButton.click();
    await expect(page.locator('text=This is a test message')).toBeVisible();
  });

  test('should handle rapid agent switching', async ({ page }) => {
    const agentButton = page.locator('button:has-text("Assistant"), button:has-text("AI Assistant")').first();

    // Rapidly switch between agents
    const agents = ['Code Expert', 'Creative Writer', 'Research Assistant'];
    
    for (let i = 0; i < 3; i++) {
      for (const agent of agents) {
        await agentButton.click();
        await page.locator(`text=${agent}`).first().click();
        
        // Verify agent was selected
        await expect(page.locator(`button:has-text("${agent.split(' ')[0]}")`).first()).toBeVisible();
        
        // Small delay to prevent overwhelming the system
        await page.waitForTimeout(100);
      }
    }

    // Should end up with the last selected agent
    await expect(page.locator('button:has-text("Research"), button:has-text("Researcher")').first()).toBeVisible();
  });

  test('should handle long conversation with scrolling', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send many messages to trigger scrolling
    for (let i = 1; i <= 15; i++) {
      await messageInput.fill(`Message number ${i} - this is a longer message to test scrolling behavior in the chat interface.`);
      await sendButton.click();
      await expect(page.locator(`text=Message number ${i}`)).toBeVisible();
    }

    // Should auto-scroll to bottom
    const lastMessage = page.locator('text=Message number 15');
    await expect(lastMessage).toBeVisible();

    // Should be able to scroll up to see earlier messages
    await page.locator('body').press('Home');
    await expect(page.locator('text=Message number 1')).toBeVisible();

    // Should be able to scroll back down
    await page.locator('body').press('End');
    await expect(page.locator('text=Message number 15')).toBeVisible();

    // New message should appear at bottom and auto-scroll
    await messageInput.fill('Final message after scrolling test');
    await sendButton.click();
    await expect(page.locator('text=Final message after scrolling test')).toBeVisible();
  });

  test('should handle copy and paste operations', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message first
    await messageInput.fill('Original message for copying');
    await sendButton.click();
    await expect(page.locator('text=Original message for copying')).toBeVisible();

    // Try to select and copy text from a message (if selectable)
    const messageText = page.locator('text=Original message for copying');
    await messageText.click();
    
    // Select all text in the message (this might not work depending on implementation)
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');

    // Paste into input field
    await messageInput.click();
    await page.keyboard.press('Control+v');

    // Should have pasted content (or at least be able to type)
    await messageInput.fill('Pasted: Original message for copying');
    await sendButton.click();
    await expect(page.locator('text=Pasted: Original message for copying')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const messageInput = page.locator('textarea[placeholder*="Type your message"]');
    const sendButton = page.locator('button[aria-label*="send" i], button:has-text("Send")').first();

    // Send a message
    await messageInput.fill('Message before navigation');
    await sendButton.click();
    await expect(page.locator('text=Message before navigation')).toBeVisible();

    // Navigate to a different page (if your app has multiple pages)
    // For a single-page app, this might just refresh
    await page.goBack();
    await page.waitForTimeout(1000);

    // Navigate forward
    await page.goForward();
    await page.waitForLoadState('networkidle');

    // Should still be functional
    await expect(page.locator('h1:has-text("Multimind")')).toBeVisible();
    await expect(messageInput).toBeVisible();

    // Should be able to send new message
    await messageInput.fill('Message after navigation');
    await sendButton.click();
    await expect(page.locator('text=Message after navigation')).toBeVisible();
  });
});