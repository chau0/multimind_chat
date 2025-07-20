import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@/test/test-utils'
import { useMentionParser } from '../useMentionParser'
import type { Agent } from '@/types'

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
  {
    id: 3,
    name: 'Writer',
    displayName: 'Content Writer',
    description: 'Writing specialist',
    color: 'from-purple-500 to-pink-600',
    avatar: 'CW',
    isActive: true,
  },
]

describe('useMentionParser', () => {
  it('parses mentions correctly', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const mentions = result.current.parseMentions('Hello @Coder and @Writer, can you help?')

    expect(mentions).toEqual(['Coder', 'Writer'])
  })

  it('handles case insensitive mentions', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const mentions = result.current.parseMentions('Hello @coder and @WRITER')

    expect(mentions).toEqual(['Coder', 'Writer'])
  })

  it('ignores invalid mentions', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const mentions = result.current.parseMentions('Hello @InvalidAgent and @Coder')

    expect(mentions).toEqual(['Coder'])
  })

  it('removes duplicate mentions', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const mentions = result.current.parseMentions('Hello @Coder and @Coder again')

    expect(mentions).toEqual(['Coder'])
  })

  it('finds mention matches with positions', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const matches = result.current.findMentionMatches('Hello @Coder and @Writer')

    expect(matches).toEqual([
      { start: 6, end: 12, agent: 'Coder' },
      { start: 17, end: 24, agent: 'Writer' },
    ])
  })

  it('filters agents by query', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const filtered = result.current.getFilteredAgents('cod')

    expect(filtered).toEqual([mockAgents[1]]) // Only Coder
  })

  it('filters agents by display name', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const filtered = result.current.getFilteredAgents('expert')

    expect(filtered).toEqual([mockAgents[1]]) // Code Expert
  })

  it('returns all agents when query is empty', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const filtered = result.current.getFilteredAgents('')

    expect(filtered).toEqual(mockAgents)
  })

  it('handles input change and shows suggestions', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    act(() => {
      result.current.handleInputChange('Hello @', 7)
    })

    expect(result.current.showMentionSuggestions).toBe(true)
    expect(result.current.mentionQuery).toBe('')
  })

  it('handles input change with partial mention', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    act(() => {
      result.current.handleInputChange('Hello @Cod', 10)
    })

    expect(result.current.showMentionSuggestions).toBe(true)
    expect(result.current.mentionQuery).toBe('Cod')
  })

  it('hides suggestions when not in mention context', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    act(() => {
      result.current.handleInputChange('Hello world', 11)
    })

    expect(result.current.showMentionSuggestions).toBe(false)
    expect(result.current.mentionQuery).toBe('')
  })

  it('hides suggestions when space is typed after @', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    act(() => {
      result.current.handleInputChange('Hello @ world', 13)
    })

    expect(result.current.showMentionSuggestions).toBe(false)
  })

  it('inserts mention correctly', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const { newValue, newCursorPosition } = result.current.insertMention(
      'Hello @Cod',
      10,
      'Coder'
    )

    expect(newValue).toBe('Hello @Coder ')
    expect(newCursorPosition).toBe(13)
  })

  it('handles insertion when no @ is found', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const { newValue, newCursorPosition } = result.current.insertMention(
      'Hello world',
      11,
      'Coder'
    )

    expect(newValue).toBe('Hello world')
    expect(newCursorPosition).toBe(11)
  })

  it('inserts mention in middle of text', () => {
    const { result } = renderHook(() => useMentionParser(mockAgents))

    const { newValue, newCursorPosition } = result.current.insertMention(
      'Hello @Cod, how are you?',
      10,
      'Coder'
    )

    expect(newValue).toBe('Hello @Coder , how are you?')
    expect(newCursorPosition).toBe(13)
  })
})
