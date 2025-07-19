import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      const result = cn('bg-red-500', 'text-white')
      expect(result).toBe('bg-red-500 text-white')
    })

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('handles undefined and null values', () => {
      const result = cn('base-class', undefined, null, 'another-class')
      expect(result).toBe('base-class another-class')
    })

    it('handles empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('handles Tailwind class conflicts', () => {
      // This tests the tailwind-merge functionality
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500') // Later class should override
    })

    it('handles complex class combinations', () => {
      const result = cn(
        'flex items-center',
        'px-4 py-2',
        'bg-blue-500 hover:bg-blue-600',
        'text-white font-medium'
      )
      expect(result).toContain('flex')
      expect(result).toContain('items-center')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('hover:bg-blue-600')
      expect(result).toContain('text-white')
      expect(result).toContain('font-medium')
    })
  })
})