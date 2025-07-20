import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import { AgentSelector } from '../AgentSelector'
import { useAgents } from '@/hooks/useAgents'
import type { Agent } from '@/types'

// Mock the useAgents hook
vi.mock('@/hooks/useAgents')

const mockAgents: Agent[] = [
  {
    id: 1,
    name: 'Assistant',
    displayName: 'AI Assistant',
    description: 'General purpose assistant',
    color: 'from-blue-500 to-purple-600',
    avatar: 'AI',
    isActive: true,
  },
  {
    id: 2,
    name: 'Coder',
    displayName: 'Code Expert',
    description: 'Programming specialist',
    color: 'from-green-500 to-blue-600',
    avatar: 'CE',
    isActive: true,
  },
]

describe('AgentSelector', () => {
  beforeEach(() => {
    vi.mocked(useAgents).mockReturnValue({
      data: mockAgents,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any)
  })

  it('renders loading state', () => {
    vi.mocked(useAgents).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      isError: false,
      isSuccess: false,
    } as any)

    render(<AgentSelector />)

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders default agent when no agent is selected', () => {
    render(<AgentSelector />)

    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders selected agent', () => {
    render(<AgentSelector selectedAgent={mockAgents[1]} />)

    expect(screen.getByText('Code Expert')).toBeInTheDocument()
    expect(screen.getByText('CE')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    render(<AgentSelector />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Available Agents')).toBeInTheDocument()
      expect(screen.getByText('AI Assistant')).toBeInTheDocument()
      expect(screen.getByText('Code Expert')).toBeInTheDocument()
    })
  })

  it('calls onAgentSelect when agent is selected', async () => {
    const onAgentSelect = vi.fn()
    render(<AgentSelector onAgentSelect={onAgentSelect} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      const coderOption = screen.getByText('Code Expert')
      fireEvent.click(coderOption)
    })

    expect(onAgentSelect).toHaveBeenCalledWith(mockAgents[1])
  })

  it('closes dropdown when backdrop is clicked', async () => {
    render(<AgentSelector />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Available Agents')).toBeInTheDocument()
    })

    // Click backdrop
    const backdrop = document.querySelector('.fixed.inset-0')
    fireEvent.click(backdrop!)

    await waitFor(() => {
      expect(screen.queryByText('Available Agents')).not.toBeInTheDocument()
    })
  })
})
