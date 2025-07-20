import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiRequest } from '../queryClient'

// Mock fetch
global.fetch = vi.fn()

describe('queryClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('apiRequest', () => {
    it('makes GET request correctly', async () => {
      const mockResponse = { data: 'test' }
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await apiRequest('GET', '/test')

      expect(fetch).toHaveBeenCalledWith('/test', {
        method: 'GET',
        body: undefined,
        credentials: 'include',
        headers: {},
      })

      const data = await result.json()
      expect(data).toEqual(mockResponse)
    })

    it('makes POST request with body correctly', async () => {
      const mockResponse = { success: true }
      const requestBody = { message: 'test' }

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response)

      const result = await apiRequest('POST', '/test', requestBody)

      expect(fetch).toHaveBeenCalledWith('/test', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await result.json()
      expect(data).toEqual(mockResponse)
    })

    it('handles fetch errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      await expect(apiRequest('GET', '/test')).rejects.toThrow('Network error')
    })

    it('handles non-ok responses', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response)

      await expect(apiRequest('GET', '/test')).rejects.toThrow()
    })
  })
})
