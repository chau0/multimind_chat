import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import ChatPage from '../chat'
import { useAgents } from '@/hooks/useAgents'
import { useChat } from '@/hooks/useChat'
import type { Agent, Message } from '@/types'

// Mock the hooks
vi.mock('@/hooks/useAgents')
vi.mock('@/hooks/useChat')

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

const mockMessages: Message[] = [
  {
    id: 1,
    content: 'Hello, how can I help you?',
    isUser: false,
    agentId: 1,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    mentions: [],
  },
]

describe('ChatPage', () => {
  const mockSendMessage = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useAgents).mockReturnValue({
      data: mockAgents,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any)

    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: mockSendMessage,
      error: null,
    } as any)
  })

  it('renders chat interface', () => {
    render(<ChatPage />)

    expect(screen.getByText('Multimind')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Type your message/)).toBeInTheDocument()
    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument()
  })

  it('displays agent selector', () => {
    render(<ChatPage />)

    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  it('allows sending messages', async () => {
    const user = userEvent.setup()
    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(input, 'Hello world')
    await user.click(sendButton)

    expect(mockSendMessage).toHaveBeenCalledWith('Hello world', [])
  })

  it('handles agent selection', async () => {
    render(<ChatPage />)

    const agentButton = screen.getByText('AI Assistant').closest('button')
    fireEvent.click(agentButton!)

    await waitFor(() => {
      expect(screen.getByText('Available Agents')).toBeInTheDocument()
    })
  })

  it('displays loading state when chat is loading', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: true,
      isSending: false,
      typingAgent: null,
      sendMessage: mockSendMessage,
      error: null,
    } as any)

    render(<ChatPage />)

    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('shows typing indicator when agent is typing', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: false,
      typingAgent: mockAgents[1],
      sendMessage: mockSendMessage,
      error: null,
    } as any)

    render(<ChatPage />)

    expect(screen.getByText('Code Expert is typing')).toBeInTheDocument()
  })

  it('disables input when sending message', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: true,
      typingAgent: null,
      sendMessage: mockSendMessage,
      error: null,
    } as any)

    render(<ChatPage />)

    const input = screen.getByPlaceholderText(/Type your message/)
    const sendButton = screen.getByRole('button', { name: /send/i })

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })
})
