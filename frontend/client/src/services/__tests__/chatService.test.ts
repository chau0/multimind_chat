import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService } from '../chatService'
import { apiRequest } from '@/lib/queryClient'
import type { Agent, Message, SendMessageRequest } from '@/types'

// Mock the apiRequest function
vi.mock('@/lib/queryClient')

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
]

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAgents', () => {
    it('fetches agents successfully', async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockAgents),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const result = await chatService.getAgents()

      expect(apiRequest).toHaveBeenCalledWith('GET', '/api/v1/agents')
      expect(result).toEqual(mockAgents)
    })

    it('handles fetch error', async () => {
      const error = new Error('Network error')
      vi.mocked(apiRequest).mockRejectedValue(error)

      await expect(chatService.getAgents()).rejects.toThrow('Network error')
    })
  })

  describe('getMessages', () => {
    it('fetches messages with default session', async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockMessages),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const result = await chatService.getMessages()

      expect(apiRequest).toHaveBeenCalledWith('GET', '/api/v1/chat/sessions/default/messages')
      expect(result).toEqual(mockMessages)
    })

    it('fetches messages with custom session', async () => {
      const mockResponse = {
        json: vi.fn().mockResolvedValue(mockMessages),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const result = await chatService.getMessages('custom-session')

      expect(apiRequest).toHaveBeenCalledWith('GET', '/api/v1/chat/sessions/custom-session/messages')
      expect(result).toEqual(mockMessages)
    })

    it('handles fetch error', async () => {
      const error = new Error('Network error')
      vi.mocked(apiRequest).mockRejectedValue(error)

      await expect(chatService.getMessages()).rejects.toThrow('Network error')
    })
  })

  describe('sendMessage', () => {
    it('sends message successfully', async () => {
      const backendResponse = {
        id: 3,
        content: 'Test response',
        agent_id: 1,
      }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(backendResponse),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const messageData: SendMessageRequest = {
        content: 'Test message',
        isUser: true,
        mentions: ['Coder'],
        sessionId: 'test-session',
      }

      const result = await chatService.sendMessage(messageData)

      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/v1/chat/messages', {
        content: 'Test message',
        session_id: 'test-session',
      })

      expect(result.userMessage).toEqual({
        id: expect.any(Number),
        content: 'Test message',
        isUser: true,
        timestamp: expect.any(Date),
        mentions: ['Coder'],
      })

      expect(result.responses).toEqual([{
        id: 4,
        content: 'Test response',
        isUser: false,
        agentId: 1,
        timestamp: expect.any(Date),
        mentions: [],
      }])
    })

    it('uses default session when not provided', async () => {
      const backendResponse = {
        id: 3,
        content: 'Test response',
        agent_id: 1,
      }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(backendResponse),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const messageData: SendMessageRequest = {
        content: 'Test message',
        isUser: true,
        mentions: [],
      }

      await chatService.sendMessage(messageData)

      expect(apiRequest).toHaveBeenCalledWith('POST', '/api/v1/chat/messages', {
        content: 'Test message',
        session_id: 'default',
      })
    })

    it('handles send error', async () => {
      const error = new Error('Send failed')
      vi.mocked(apiRequest).mockRejectedValue(error)

      const messageData: SendMessageRequest = {
        content: 'Test message',
        isUser: true,
        mentions: [],
        sessionId: 'test-session',
      }

      await expect(chatService.sendMessage(messageData)).rejects.toThrow('Send failed')
    })

    it('transforms backend response correctly', async () => {
      const backendResponse = {
        id: 100,
        content: 'Backend response',
        agent_id: 2,
      }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(backendResponse),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const messageData: SendMessageRequest = {
        content: 'User message',
        isUser: true,
        mentions: ['Assistant'],
        sessionId: 'test',
      }

      const result = await chatService.sendMessage(messageData)

      expect(result.userMessage.content).toBe('User message')
      expect(result.userMessage.isUser).toBe(true)
      expect(result.userMessage.mentions).toEqual(['Assistant'])

      expect(result.responses[0].content).toBe('Backend response')
      expect(result.responses[0].isUser).toBe(false)
      expect(result.responses[0].agentId).toBe(2)
      expect(result.responses[0].id).toBe(101) // id + 1
    })

    it('handles missing backend response fields', async () => {
      const backendResponse = {
        content: 'Response without id',
        // Missing id and agent_id
      }
      const mockResponse = {
        json: vi.fn().mockResolvedValue(backendResponse),
      }
      vi.mocked(apiRequest).mockResolvedValue(mockResponse as any)

      const messageData: SendMessageRequest = {
        content: 'Test message',
        isUser: true,
        mentions: [],
      }

      const result = await chatService.sendMessage(messageData)

      expect(result.userMessage.id).toEqual(expect.any(Number))
      expect(result.responses[0].id).toEqual(expect.any(Number))
      expect(result.responses[0].agentId).toBeUndefined()
    })
  })
})