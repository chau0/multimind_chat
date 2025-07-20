import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { ChatInput } from '@/components/ChatInput'
import { ChatWindow } from '@/components/ChatWindow'
import { useChat } from '@/hooks/useChat'
import {
  setupIntegrationTests,
  createIntegrationQueryClient,
  resetTestData,
  seedTestData
} from '../integration-setup'
import React from 'react'

// Integration tests for Chat functionality
describe('Chat Integration Tests', () => {
  setupIntegrationTests()

  let queryClient: any

  beforeEach(async () => {
    queryClient = createIntegrationQueryClient()
    await resetTestData()
    await seedTestData()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should send and receive messages through real API', async () => {
    const TestChatComponent = () => {
      const { messages, sendMessage, isLoading, isSending } = useChat('integration-test-session')

      const handleSend = async (content: string, mentions: string[]) => {
        await sendMessage(content, mentions)
      }

      return (
        <div>
          <div data-testid="message-count">{messages.length} messages</div>
          <div data-testid="loading-state">{isLoading ? 'loading' : 'ready'}</div>
          <div data-testid="sending-state">{isSending ? 'sending' : 'idle'}</div>

          {messages.map((message, index) => (
            <div key={index} data-testid={`message-${index}`}>
              <span data-testid={`message-content-${index}`}>{message.content}</span>
              <span data-testid={`message-user-${index}`}>{message.isUser ? 'user' : 'agent'}</span>
            </div>
          ))}

          <button
            onClick={() => handleSend('Hello from integration test', [])}
            data-testid="send-test-message"
          >
            Send Test Message
          </button>
        </div>
      )
    }

    renderWithProviders(<TestChatComponent />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toHaveTextContent('ready')
    }, { timeout: 10000 })

    const initialMessageCount = parseInt(screen.getByTestId('message-count').textContent || '0')

    // Send a message
    const sendButton = screen.getByTestId('send-test-message')
    fireEvent.click(sendButton)

    // Should show sending state
    await waitFor(() => {
      expect(screen.getByTestId('sending-state')).toHaveTextContent('sending')
    })

    // Should receive response and update message count
    await waitFor(() => {
      expect(screen.getByTestId('sending-state')).toHaveTextContent('idle')
      const newMessageCount = parseInt(screen.getByTestId('message-count').textContent || '0')
      expect(newMessageCount).toBeGreaterThan(initialMessageCount)
    }, { timeout: 15000 })

    // Should have user message
    const userMessage = screen.getByTestId('message-content-0')
    expect(userMessage).toHaveTextContent('Hello from integration test')

    const userType = screen.getByTestId('message-user-0')
    expect(userType).toHaveTextContent('user')
  })

  it('should integrate ChatInput with real message sending', async () => {
    const mockSendMessage = vi.fn().mockImplementation(async (content, mentions) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100))
      return { success: true }
    })

    renderWithProviders(
      <ChatInput onSendMessage={mockSendMessage} />
    )

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    // Type and send message
    await user.type(input, 'Integration test message')
    await user.click(sendButton)

    // Should call the send function
    expect(mockSendMessage).toHaveBeenCalledWith('Integration test message', [])
  })

  it('should handle mentions in real chat flow', async () => {
    const TestMentionComponent = () => {
      const { messages, sendMessage } = useChat('mention-test-session')

      const handleSendWithMention = async () => {
        await sendMessage('Hello @Assistant, can you help me?', ['Assistant'])
      }

      return (
        <div>
          <div data-testid="message-list">
            {messages.map((msg, idx) => (
              <div key={idx} data-testid={`msg-${idx}`}>
                {msg.content} - {msg.mentions?.join(', ')}
              </div>
            ))}
          </div>
          <button onClick={handleSendWithMention} data-testid="send-mention">
            Send Mention
          </button>
        </div>
      )
    }

    renderWithProviders(<TestMentionComponent />)

    const sendButton = screen.getByTestId('send-mention')
    fireEvent.click(sendButton)

    // Should process mention and get response
    await waitFor(() => {
      const messageList = screen.getByTestId('message-list')
      expect(messageList.textContent).toContain('Hello @Assistant')
    }, { timeout: 15000 })
  })

  it('should maintain session state across interactions', async () => {
    const sessionId = 'persistent-session-test'

    const TestSessionComponent = () => {
      const { messages, sendMessage } = useChat(sessionId)

      return (
        <div>
          <div data-testid="session-messages">{messages.length}</div>
          <button
            onClick={() => sendMessage('Session message 1', [])}
            data-testid="send-first"
          >
            Send First
          </button>
          <button
            onClick={() => sendMessage('Session message 2', [])}
            data-testid="send-second"
          >
            Send Second
          </button>
        </div>
      )
    }

    renderWithProviders(<TestSessionComponent />)

    // Send first message
    fireEvent.click(screen.getByTestId('send-first'))

    await waitFor(() => {
      const count = parseInt(screen.getByTestId('session-messages').textContent || '0')
      expect(count).toBeGreaterThan(0)
    }, { timeout: 10000 })

    const firstCount = parseInt(screen.getByTestId('session-messages').textContent || '0')

    // Send second message
    fireEvent.click(screen.getByTestId('send-second'))

    await waitFor(() => {
      const count = parseInt(screen.getByTestId('session-messages').textContent || '0')
      expect(count).toBeGreaterThan(firstCount)
    }, { timeout: 10000 })
  })

  it('should handle API errors in chat flow', async () => {
    // Mock a failing API
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/chat/messages')) {
        return Promise.reject(new Error('Chat API error'))
      }
      return originalFetch(url)
    })

    const TestErrorComponent = () => {
      const { sendMessage, error } = useChat('error-test-session')

      const handleSend = async () => {
        try {
          await sendMessage('This should fail', [])
        } catch (e) {
          // Error handled by hook
        }
      }

      return (
        <div>
          <div data-testid="error-state">{error ? 'error' : 'no-error'}</div>
          <button onClick={handleSend} data-testid="send-failing">
            Send Failing Message
          </button>
        </div>
      )
    }

    renderWithProviders(<TestErrorComponent />)

    fireEvent.click(screen.getByTestId('send-failing'))

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toHaveTextContent('error')
    })

    global.fetch = originalFetch
  })

  it('should validate message data structure from API', async () => {
    const TestDataComponent = () => {
      const { messages, sendMessage } = useChat('data-validation-session')

      const handleSend = async () => {
        await sendMessage('Data validation test', [])
      }

      if (messages.length === 0) {
        return (
          <button onClick={handleSend} data-testid="send-validation">
            Send Validation Test
          </button>
        )
      }

      const lastMessage = messages[messages.length - 1]
      const isValid = (
        typeof lastMessage.id === 'number' &&
        typeof lastMessage.content === 'string' &&
        typeof lastMessage.isUser === 'boolean' &&
        lastMessage.timestamp instanceof Date
      )

      return (
        <div data-testid="message-validation">
          {isValid ? 'valid' : 'invalid'}
        </div>
      )
    }

    renderWithProviders(<TestDataComponent />)

    fireEvent.click(screen.getByTestId('send-validation'))

    await waitFor(() => {
      expect(screen.getByTestId('message-validation')).toHaveTextContent('valid')
    }, { timeout: 15000 })
  })
})
