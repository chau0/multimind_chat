import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { MessageBubble } from '../MessageBubble'
import type { Message, Agent } from '@/types'

const mockAgent: Agent = {
  id: 1,
  name: 'TestAgent',
  displayName: 'Test Agent',
  description: 'A test agent',
  color: 'from-blue-500 to-purple-600',
  avatar: 'TA',
  isActive: true,
}

const mockUserMessage: Message = {
  id: 1,
  content: 'Hello, this is a user message',
  isUser: true,
  timestamp: new Date('2024-01-01T12:00:00Z'),
  mentions: [],
}

const mockAgentMessage: Message = {
  id: 2,
  content: 'Hello, this is an agent response',
  isUser: false,
  agentId: 1,
  timestamp: new Date('2024-01-01T12:01:00Z'),
  mentions: [],
}

describe('MessageBubble', () => {
  it('renders user message correctly', () => {
    render(<MessageBubble message={mockUserMessage} />)

    expect(screen.getByText('Hello, this is a user message')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
    expect(screen.getByText('12:00 PM')).toBeInTheDocument()
  })

  it('renders agent message correctly', () => {
    render(<MessageBubble message={mockAgentMessage} agent={mockAgent} />)

    expect(screen.getByText('Hello, this is an agent response')).toBeInTheDocument()
    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText('12:01 PM')).toBeInTheDocument()
    expect(screen.getByText('TA')).toBeInTheDocument() // Avatar
  })

  it('renders agent message without agent data', () => {
    render(<MessageBubble message={mockAgentMessage} />)

    expect(screen.getByText('Hello, this is an agent response')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument() // Default avatar
  })

  it('handles multiline content correctly', () => {
    const multilineMessage: Message = {
      ...mockUserMessage,
      content: 'Line 1\nLine 2\nLine 3',
    }

    render(<MessageBubble message={multilineMessage} />)

    // Check that the content is rendered with whitespace-pre-wrap class
    const messageElement = screen.getByText(/Line 1/)
    expect(messageElement).toBeInTheDocument()
    expect(messageElement).toHaveClass('whitespace-pre-wrap')
  })

  it('displays agent description badge when available', () => {
    render(<MessageBubble message={mockAgentMessage} agent={mockAgent} />)

    expect(screen.getByText('A')).toBeInTheDocument() // First word of description
  })
})
