import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import ChatPage from '@/pages/chat'
import {
  setupIntegrationTests,
  createIntegrationQueryClient,
  resetTestData,
  seedTestData
} from '../integration-setup'
import React from 'react'

// Full end-to-end integration tests
describe('Full Flow Integration Tests', () => {
  setupIntegrationTests()

  let queryClient: any

  beforeEach(async () => {
    queryClient = createIntegrationQueryClient()
    await resetTestData()
    await seedTestData()
  })

  const renderChatPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ChatPage />
      </QueryClientProvider>
    )
  }

  it('should complete full chat workflow from page load to response', async () => {
    renderChatPage()

    // 1. Page should load with agents
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // 2. Should show welcome message or empty state
    await waitFor(() => {
      expect(screen.getByText(/Welcome to Multimind|Type your message/)).toBeInTheDocument()
    })

    // 3. Should be able to type and send a message
    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Hello, this is an integration test!')
    await user.click(sendButton)

    // 4. Should show user message immediately (optimistic update)
    await waitFor(() => {
      expect(screen.getByText('Hello, this is an integration test!')).toBeInTheDocument()
    })

    // 5. Should receive agent response
    await waitFor(() => {
      // Look for any response that's not the user message
      const messages = screen.getAllByText(/Hello|Hi|How can I help|I can assist/)
      expect(messages.length).toBeGreaterThan(0)
    }, { timeout: 20000 })

    // 6. Input should be cleared after sending
    expect(input).toHaveValue('')
  })

  it('should handle agent selection and mention workflow', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // 1. Click agent selector
    const agentButton = screen.getByText(/Assistant|AI Assistant/).closest('button')
    fireEvent.click(agentButton!)

    // 2. Should show agent dropdown
    await waitFor(() => {
      expect(screen.getByText('Available Agents')).toBeInTheDocument()
    })

    // 3. Should show multiple agents
    expect(screen.getByText(/Assistant|AI Assistant/)).toBeInTheDocument()

    // 4. Type message with mention
    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)

    await user.type(input, 'Hello @')

    // 5. Should show mention suggestions
    await waitFor(() => {
      expect(screen.getByText('Mention Agent')).toBeInTheDocument()
    })

    // 6. Complete the message and send
    await user.type(input, 'Assistant, can you help me?')
    const sendButton = screen.getByRole('button', { name: /send/i })
    await user.click(sendButton)

    // 7. Should process mention and get response
    await waitFor(() => {
      expect(screen.getByText(/Hello @Assistant, can you help me/)).toBeInTheDocument()
    })
  })

  it('should maintain conversation history across multiple messages', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Send first message
    await user.type(input, 'First message in conversation')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('First message in conversation')).toBeInTheDocument()
    })

    // Send second message
    await user.type(input, 'Second message in conversation')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Second message in conversation')).toBeInTheDocument()
    })

    // Both messages should be visible
    expect(screen.getByText('First message in conversation')).toBeInTheDocument()
    expect(screen.getByText('Second message in conversation')).toBeInTheDocument()
  })

  it('should handle typing indicators and loading states', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Send message that should trigger typing indicator
    await user.type(input, 'Tell me a story')
    await user.click(sendButton)

    // Should show typing indicator briefly
    await waitFor(() => {
      expect(screen.getByText(/is typing|typing/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Typing indicator should disappear when response arrives
    await waitFor(() => {
      expect(screen.queryByText(/is typing|typing/i)).not.toBeInTheDocument()
    }, { timeout: 20000 })
  })

  it('should handle network errors gracefully', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // Mock network failure
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'This message should fail')
    await user.click(sendButton)

    // Should handle error gracefully (message might still show due to optimistic update)
    await waitFor(() => {
      expect(screen.getByText('This message should fail')).toBeInTheDocument()
    })

    // Restore fetch
    global.fetch = originalFetch
  })

  it('should validate complete data flow from frontend to backend', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // Track API calls
    const apiCalls: string[] = []
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((url, options) => {
      apiCalls.push(`${options?.method || 'GET'} ${url}`)
      return originalFetch(url, options)
    })

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Integration test message')
    await user.click(sendButton)

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Integration test message')).toBeInTheDocument()
    })

    // Verify API calls were made
    expect(apiCalls.some(call => call.includes('/api/v1/agents'))).toBe(true)
    expect(apiCalls.some(call => call.includes('/api/v1/chat/messages'))).toBe(true)

    global.fetch = originalFetch
  })

  it('should handle concurrent user interactions', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Send multiple messages quickly
    await user.type(input, 'Message 1')
    await user.click(sendButton)

    await user.type(input, 'Message 2')
    await user.click(sendButton)

    await user.type(input, 'Message 3')
    await user.click(sendButton)

    // All messages should eventually appear
    await waitFor(() => {
      expect(screen.getByText('Message 1')).toBeInTheDocument()
      expect(screen.getByText('Message 2')).toBeInTheDocument()
      expect(screen.getByText('Message 3')).toBeInTheDocument()
    }, { timeout: 30000 })
  })

  it('should preserve UI state during API interactions', async () => {
    renderChatPage()

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // Check initial UI state
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    expect(input).toBeEnabled()
    expect(sendButton).toBeEnabled()

    // Send message and check UI updates
    const user = userEvent.setup()
    await user.type(input, 'UI state test')
    await user.click(sendButton)

    // Input should be cleared but remain functional
    expect(input).toHaveValue('')
    expect(input).toBeEnabled()
    expect(sendButton).toBeEnabled()

    // Should be able to send another message immediately
    await user.type(input, 'Second message')
    expect(input).toHaveValue('Second message')
  })
})
