import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AgentSelector } from '@/components/AgentSelector'
import { useAgents } from '@/hooks/useAgents'
import {
  setupIntegrationTests,
  createIntegrationQueryClient,
  resetTestData,
  seedTestData,
  integrationTestSetup
} from '../integration-setup'
import React from 'react'

// Integration tests for Agents API
describe('Agents Integration Tests', () => {
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

  it('should fetch real agents from backend API', async () => {
    const TestComponent = () => {
      const { data: agents, isLoading, error } = useAgents()

      if (isLoading) return <div>Loading agents...</div>
      if (error) return <div>Error: {error.message}</div>
      if (!agents) return <div>No agents found</div>

      return (
        <div>
          <div data-testid="agent-count">{agents.length} agents loaded</div>
          {agents.map(agent => (
            <div key={agent.id} data-testid={`agent-${agent.id}`}>
              <span data-testid={`agent-name-${agent.id}`}>{agent.name}</span>
              <span data-testid={`agent-display-${agent.id}`}>{agent.displayName}</span>
            </div>
          ))}
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    // Should show loading initially
    expect(screen.getByText('Loading agents...')).toBeInTheDocument()

    // Should load agents from real API
    await waitFor(() => {
      expect(screen.getByTestId('agent-count')).toBeInTheDocument()
    }, { timeout: 10000 })

    // Should have default agents (Assistant, Coder, Writer, Researcher)
    const agentCount = screen.getByTestId('agent-count')
    expect(agentCount.textContent).toMatch(/\d+ agents loaded/)

    // Should have at least the default agents
    await waitFor(() => {
      expect(screen.getByTestId('agent-name-1')).toBeInTheDocument()
    })
  })

  it('should integrate AgentSelector with real backend data', async () => {
    const mockOnSelect = vi.fn()

    renderWithProviders(
      <AgentSelector onAgentSelect={mockOnSelect} />
    )

    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Should load and display real agent data
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    }, { timeout: 10000 })

    // Should display an agent (likely Assistant as default)
    await waitFor(() => {
      expect(screen.getByText(/Assistant|AI Assistant/)).toBeInTheDocument()
    })
  })

  it('should handle API errors gracefully', async () => {
    // Temporarily break the API endpoint
    const originalFetch = global.fetch
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const TestComponent = () => {
      const { data: agents, isLoading, error } = useAgents()

      if (isLoading) return <div>Loading agents...</div>
      if (error) return <div data-testid="error">Error: {error.message}</div>

      return <div>Success</div>
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('error')).toBeInTheDocument()
    })

    // Restore fetch
    global.fetch = originalFetch
  })

  it('should validate agent data structure from API', async () => {
    const TestComponent = () => {
      const { data: agents, isLoading } = useAgents()

      if (isLoading) return <div>Loading...</div>
      if (!agents || agents.length === 0) return <div>No agents</div>

      const firstAgent = agents[0]

      return (
        <div>
          <div data-testid="agent-structure-valid">
            {typeof firstAgent.id === 'number' &&
             typeof firstAgent.name === 'string' &&
             typeof firstAgent.displayName === 'string' &&
             typeof firstAgent.description === 'string' &&
             typeof firstAgent.color === 'string' &&
             typeof firstAgent.avatar === 'string' &&
             typeof firstAgent.isActive === 'boolean' ? 'Valid' : 'Invalid'}
          </div>
          <div data-testid="agent-data">
            ID: {firstAgent.id}, Name: {firstAgent.name}
          </div>
        </div>
      )
    }

    renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.getByTestId('agent-structure-valid')).toHaveTextContent('Valid')
    }, { timeout: 10000 })

    const agentData = screen.getByTestId('agent-data')
    expect(agentData.textContent).toMatch(/ID: \d+, Name: \w+/)
  })

  it('should cache agents data correctly', async () => {
    let fetchCount = 0
    const originalFetch = global.fetch

    global.fetch = vi.fn().mockImplementation((...args) => {
      if (args[0].includes('/api/v1/agents')) {
        fetchCount++
      }
      return originalFetch(...args)
    })

    const TestComponent = () => {
      const { data: agents, isLoading } = useAgents()
      return (
        <div>
          {isLoading ? 'Loading...' : `${agents?.length || 0} agents`}
          <div data-testid="fetch-count">{fetchCount}</div>
        </div>
      )
    }

    // Render component twice
    const { rerender } = renderWithProviders(<TestComponent />)

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    rerender(
      <QueryClientProvider client={queryClient}>
        <TestComponent />
      </QueryClientProvider>
    )

    // Should only fetch once due to caching
    expect(screen.getByTestId('fetch-count')).toHaveTextContent('1')

    global.fetch = originalFetch
  })
})
