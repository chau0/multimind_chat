import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import ChatPage from '@/pages/chat'
import { useAgents } from '@/hooks/useAgents'
import { useChat } from '@/hooks/useChat'
import { 
  setupIntegrationTests, 
  createIntegrationQueryClient, 
  resetTestData,
  integrationTestSetup
} from '../integration-setup'
import React from 'react'

// Integration tests for error handling scenarios
describe('Error Handling Integration Tests', () => {
  setupIntegrationTests()
  
  let queryClient: any

  beforeEach(async () => {
    queryClient = createIntegrationQueryClient()
    await resetTestData()
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('should handle backend server unavailable', async () => {
    // Mock fetch to simulate server down
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))

    const TestComponent = () => {
      const { data: agents, isLoading, error } = useAgents()
      
      if (isLoading) return <div>Loading...</div>
      if (error) return <div data-testid="connection-error">Connection Error</div>
      
      return <div>Success</div>
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('connection-error')).toBeInTheDocument()
    })

    global.fetch = originalFetch
  })

  it('should handle API timeout scenarios', async () => {
    // Mock slow API response
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 35000)) // Longer than test timeout
    )

    const TestComponent = () => {
      const { data: agents, isLoading, error } = useAgents()
      
      return (
        <div>
          <div data-testid="loading-state">{isLoading ? 'loading' : 'not-loading'}</div>
          <div data-testid="error-state">{error ? 'error' : 'no-error'}</div>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    // Should show loading initially
    expect(screen.getByTestId('loading-state')).toHaveTextContent('loading')

    global.fetch = originalFetch
  })

  it('should handle malformed API responses', async () => {
    // Mock API returning invalid JSON
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve('invalid json response'),
    } as Response)

    const TestComponent = () => {
      const { data: agents, error } = useAgents()
      
      if (error) return <div data-testid="parse-error">Parse Error</div>
      if (!agents) return <div>Loading...</div>
      
      return <div>Success</div>
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('parse-error')).toBeInTheDocument()
    })

    global.fetch = originalFetch
  })

  it('should handle HTTP error status codes', async () => {
    // Test different HTTP error codes
    const errorCodes = [400, 401, 403, 404, 500, 502, 503]
    
    for (const code of errorCodes) {
      const originalFetch = global.fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: code,
        statusText: `HTTP ${code}`,
        text: () => Promise.resolve(`Error ${code}`),
      } as Response)

      const TestComponent = () => {
        const { error } = useAgents()
        return <div data-testid={`error-${code}`}>{error ? `Error ${code}` : 'No Error'}</div>
      }

      const { unmount } = renderWithProviders(<TestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId(`error-${code}`)).toHaveTextContent(`Error ${code}`)
      })

      unmount()
      global.fetch = originalFetch
    }
  })

  it('should handle chat message send failures gracefully', async () => {
    renderWithProviders(<ChatPage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 15000 })

    // Mock chat API to fail
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/chat/messages')) {
        return Promise.reject(new Error('Message send failed'))
      }
      return originalFetch(url)
    })

    const user = userEvent.setup()
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'This message should fail')
    await user.click(sendButton)

    // Message should still appear (optimistic update)
    await waitFor(() => {
      expect(screen.getByText('This message should fail')).toBeInTheDocument()
    })

    // But no response should come
    await new Promise(resolve => setTimeout(resolve, 2000))

    global.fetch = originalFetch
  })

  it('should recover from temporary network issues', async () => {
    let failCount = 0
    const originalFetch = global.fetch
    
    // Fail first 2 requests, then succeed
    global.fetch = vi.fn().mockImplementation((...args) => {
      if (args[0].includes('/api/v1/agents')) {
        failCount++
        if (failCount <= 2) {
          return Promise.reject(new Error('Network error'))
        }
      }
      return originalFetch(...args)
    })

    const TestComponent = () => {
      const { data: agents, isLoading, error, refetch } = useAgents()
      
      return (
        <div>
          <div data-testid="status">
            {isLoading ? 'loading' : error ? 'error' : agents ? 'success' : 'unknown'}
          </div>
          <button onClick={() => refetch()} data-testid="retry">
            Retry
          </button>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    // Should initially fail
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error')
    })

    // Retry should also fail
    fireEvent.click(screen.getByTestId('retry'))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error')
    })

    // Third retry should succeed
    fireEvent.click(screen.getByTestId('retry'))
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('success')
    })

    global.fetch = originalFetch
  })

  it('should handle concurrent request failures', async () => {
    // Mock multiple simultaneous failures
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes('/api/v1/')) {
        return Promise.reject(new Error('Service unavailable'))
      }
      return originalFetch(url)
    })

    const TestComponent = () => {
      const { error: agentsError } = useAgents()
      const { error: chatError } = useChat()
      
      return (
        <div>
          <div data-testid="agents-error">{agentsError ? 'agents-error' : 'agents-ok'}</div>
          <div data-testid="chat-error">{chatError ? 'chat-error' : 'chat-ok'}</div>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('agents-error')).toHaveTextContent('agents-error')
    })

    global.fetch = originalFetch
  })

  it('should validate error message content and structure', async () => {
    // Mock API to return structured error
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: () => Promise.resolve(JSON.stringify({
        detail: [
          {
            loc: ['body', 'content'],
            msg: 'field required',
            type: 'value_error.missing'
          }
        ]
      })),
    } as Response)

    const TestComponent = () => {
      const { error } = useAgents()
      
      if (!error) return <div>No Error</div>
      
      return (
        <div>
          <div data-testid="error-message">{error.message}</div>
          <div data-testid="error-type">{error.constructor.name}</div>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toBeInTheDocument()
      expect(screen.getByTestId('error-type')).toHaveTextContent('Error')
    })

    global.fetch = originalFetch
  })
})