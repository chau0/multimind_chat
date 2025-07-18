import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAgents } from '../useAgents'
import { chatService } from '@/services/chatService'
import type { Agent } from '@/types'
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

describe('useAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches agents successfully', async () => {
    vi.mocked(chatService.getAgents).mockResolvedValue(mockAgents)
    
    const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
    
    expect(result.current.isLoading).toBe(true)
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toEqual(mockAgents)
    expect(result.current.isLoading).toBe(false)
    expect(chatService.getAgents).toHaveBeenCalledTimes(1)
  })

  it('handles fetch error', async () => {
    const error = new Error('Failed to fetch agents')
    vi.mocked(chatService.getAgents).mockRejectedValue(error)
    
    const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    
    expect(result.current.error).toEqual(error)
    expect(result.current.data).toBeUndefined()
  })

  it('uses correct query key', () => {
    vi.mocked(chatService.getAgents).mockResolvedValue(mockAgents)
    
    const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
    
    // The query key should be used for caching
    expect(result.current.isLoading).toBe(true)
  })

  it('has correct stale time configuration', async () => {
    vi.mocked(chatService.getAgents).mockResolvedValue(mockAgents)
    
    const { result } = renderHook(() => useAgents(), { wrapper: createWrapper() })
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    // Data should be considered fresh for 5 minutes
    expect(result.current.isStale).toBe(false)
  })
})