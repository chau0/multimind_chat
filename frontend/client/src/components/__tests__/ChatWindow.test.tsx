import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { ChatWindow } from '../ChatWindow'
import { useChat } from '@/hooks/useChat'
import { useAgents } from '@/hooks/useAgents'
import type { Message, Agent } from '@/types'

// Mock the hooks
vi.mock('@/hooks/useChat')
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

const mockMessages: Message[] = [
  {
    id: 1,
    content: 'Hello, how can I help you?',
    isUser: false,
    agentId: 1,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    mentions: [],
  },
  {
    id: 2,
    content: 'I need help with coding',
    isUser: true,
    timestamp: new Date('2024-01-01T12:01:00Z'),
    mentions: ['Coder'],
  },
  {
    id: 3,
    content: 'Sure! I can help you with that.',
    isUser: false,
    agentId: 2,
    timestamp: new Date('2024-01-01T12:02:00Z'),
    mentions: [],
  },
]

describe('ChatWindow', () => {
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
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: true,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    expect(screen.getByText('Loading messages...')).toBeInTheDocument()
  })

  it('renders welcome message when no messages', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    expect(screen.getByText('Welcome to Multimind!')).toBeInTheDocument()
    expect(screen.getByText('@Coder')).toBeInTheDocument()
    expect(screen.getByText('@Writer')).toBeInTheDocument()
    expect(screen.getByText('@Researcher')).toBeInTheDocument()
  })

  it('renders messages correctly', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    expect(screen.getByText('Hello, how can I help you?')).toBeInTheDocument()
    expect(screen.getByText('I need help with coding')).toBeInTheDocument()
    expect(screen.getByText('Sure! I can help you with that.')).toBeInTheDocument()
  })

  it('renders typing indicator when agent is typing', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: false,
      typingAgent: mockAgents[1],
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    expect(screen.getByText('Code Expert is typing')).toBeInTheDocument()
  })

  it('associates messages with correct agents', () => {
    vi.mocked(useChat).mockReturnValue({
      messages: mockMessages,
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    // Check that agent names are displayed correctly
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('Code Expert')).toBeInTheDocument()
  })

  it('handles messages with unknown agents', () => {
    const messagesWithUnknownAgent: Message[] = [
      {
        id: 1,
        content: 'Message from unknown agent',
        isUser: false,
        agentId: 999, // Non-existent agent ID
        timestamp: new Date('2024-01-01T12:00:00Z'),
        mentions: [],
      },
    ]

    vi.mocked(useChat).mockReturnValue({
      messages: messagesWithUnknownAgent,
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)

    render(<ChatWindow />)

    expect(screen.getByText('Message from unknown agent')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })
})
