import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useChat } from '../useChat'
import { chatService } from '@/services/chatService'
import type { Message, Agent, SendMessageResponse } from '@/types'
import React from 'react'

// Mock the chat service
vi.mock('@/services/chatService')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

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
]

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

const mockSendMessageResponse: SendMessageResponse = {
  userMessage: {
    id: 3,
    content: 'Test message',
    isUser: true,
    timestamp: new Date('2024-01-01T12:02:00Z'),
    mentions: [],
  },
  responses: [
    {
      id: 4,
      content: 'Test response',
      isUser: false,
      agentId: 1,
      timestamp: new Date('2024-01-01T12:02:30Z'),
      mentions: [],
    },
  ],
}

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches messages on mount', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages)
    
    const { result } = renderHook(() => useChat('test-session'), { wrapper: createWrapper() })
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    expect(result.current.messages).toEqual(mockMessages)
    expect(chatService.getMessages).toHaveBeenCalledWith('test-session')
  })

  it('uses default session id when not provided', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue([])
    
    renderHook(() => useChat(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(chatService.getMessages).toHaveBeenCalledWith('default')
    })
  })

  it('sends message successfully', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages)
    vi.mocked(chatService.sendMessage).mockResolvedValue(mockSendMessageResponse)
    
    const { result } = renderHook(() => useChat('test-session'), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.sendMessage('Test message', [])
    })
    
    expect(chatService.sendMessage).toHaveBeenCalledWith({
      content: 'Test message',
      isUser: true,
      mentions: [],
      sessionId: 'test-session',
    })
  })

  it('handles optimistic updates', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages)
    vi.mocked(chatService.sendMessage).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockSendMessageResponse), 100))
    )
    
    const { result } = renderHook(() => useChat('test-session'), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    const initialMessageCount = result.current.messages.length
    
    act(() => {
      result.current.sendMessage('Test message', [])
    })
    
    // Should immediately show optimistic message
    expect(result.current.messages.length).toBe(initialMessageCount + 1)
    expect(result.current.messages[result.current.messages.length - 1].content).toBe('Test message')
    expect(result.current.isSending).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isSending).toBe(false)
    })
  })

  it('sets typing agent when mentions are present', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages)
    vi.mocked(chatService.sendMessage).mockResolvedValue(mockSendMessageResponse)
    
    const { result } = renderHook(() => useChat('test-session'), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.sendMessage('Hello @Coder', ['Coder'])
    })
    
    // Typing agent should be cleared after response
    expect(result.current.typingAgent).toBe(null)
  })

  it('handles send message error', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue(mockMessages)
    vi.mocked(chatService.sendMessage).mockRejectedValue(new Error('Send failed'))
    
    const { result } = renderHook(() => useChat('test-session'), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      try {
        await result.current.sendMessage('Test message', [])
      } catch (error) {
        // Expected to throw
      }
    })
    
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.typingAgent).toBe(null)
  })

  it('does not send empty messages', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue([])
    
    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.sendMessage('   ', [])
    })
    
    expect(chatService.sendMessage).not.toHaveBeenCalled()
  })

  it('trims message content before sending', async () => {
    vi.mocked(chatService.getMessages).mockResolvedValue([])
    vi.mocked(chatService.sendMessage).mockResolvedValue(mockSendMessageResponse)
    
    const { result } = renderHook(() => useChat(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    
    await act(async () => {
      await result.current.sendMessage('  Test message  ', [])
    })
    
    expect(chatService.sendMessage).toHaveBeenCalledWith({
      content: 'Test message',
      isUser: true,
      mentions: [],
      sessionId: 'default',
    })
  })
})