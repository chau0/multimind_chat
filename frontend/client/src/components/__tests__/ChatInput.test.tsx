import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ChatInput } from '../ChatInput'
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

describe('ChatInput', () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAgents).mockReturnValue({
      data: mockAgents,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any)
  })

  it('renders input field with placeholder', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('sends message when send button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'Hello world')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', [])
  })

  it('sends message when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    
    await user.type(input, 'Hello world{Enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world', [])
  })

  it('does not send message when Shift+Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    
    await user.type(input, 'Hello world{Shift>}{Enter}{/Shift}')
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
    expect(input).toHaveValue('Hello world\n')
  })

  it('shows mention suggestions when typing @', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    
    await user.type(input, 'Hello @')
    
    await waitFor(() => {
      expect(screen.getByText('Mention Agent')).toBeInTheDocument()
      expect(screen.getByText('@Assistant')).toBeInTheDocument()
      expect(screen.getByText('@Coder')).toBeInTheDocument()
    })
  })

  it('filters mention suggestions based on query', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    
    await user.type(input, 'Hello @Cod')
    
    await waitFor(() => {
      expect(screen.getByText('Mention Agent')).toBeInTheDocument()
      expect(screen.getByText('@Coder')).toBeInTheDocument()
      expect(screen.queryByText('@Assistant')).not.toBeInTheDocument()
    })
  })

  it('inserts mention when suggestion is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    
    await user.type(input, 'Hello @')
    
    await waitFor(() => {
      const coderMention = screen.getByText('@Coder')
      fireEvent.click(coderMention)
    })
    
    expect(input).toHaveValue('Hello @Coder ')
  })

  it('parses mentions correctly when sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'Hello @Coder and @Assistant')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello @Coder and @Assistant', ['Coder', 'Assistant'])
  })

  it('disables input when disabled prop is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} disabled />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('shows character count', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByText('0/2000')).toBeInTheDocument()
  })

  it('shows agent count', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    expect(screen.getByText('2 agents available')).toBeInTheDocument()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSendMessage={mockOnSendMessage} />)
    
    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.type(input, 'Hello world')
    await user.click(sendButton)
    
    expect(input).toHaveValue('')
  })
})