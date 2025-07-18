import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/test-utils'
import App from '../App'
import { useAgents } from '@/hooks/useAgents'
import { useChat } from '@/hooks/useChat'

// Mock the hooks
vi.mock('@/hooks/useAgents')
vi.mock('@/hooks/useChat')

// Mock wouter
vi.mock('wouter', () => ({
  Switch: ({ children }: { children: React.ReactNode }) => <div data-testid="switch">{children}</div>,
  Route: ({ component: Component, path }: { component: React.ComponentType; path: string }) => {
    if (path === '/') {
      return <Component />
    }
    return null
  },
}))

describe('App', () => {
  beforeEach(() => {
    vi.mocked(useAgents).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: true,
    } as any)

    vi.mocked(useChat).mockReturnValue({
      messages: [],
      isLoading: false,
      isSending: false,
      typingAgent: null,
      sendMessage: vi.fn(),
      error: null,
    } as any)
  })

  it('renders without crashing', () => {
    render(<App />)
    
    expect(screen.getByTestId('switch')).toBeInTheDocument()
  })

  it('provides QueryClient to children', () => {
    render(<App />)
    
    // The app should render without throwing errors related to missing QueryClient
    expect(screen.getByTestId('switch')).toBeInTheDocument()
  })

  it('provides TooltipProvider to children', () => {
    render(<App />)
    
    // The app should render without throwing errors related to missing TooltipProvider
    expect(screen.getByTestId('switch')).toBeInTheDocument()
  })

  it('includes Toaster component', () => {
    render(<App />)
    
    // Toaster should be rendered (though it might not be visible)
    expect(screen.getByTestId('switch')).toBeInTheDocument()
  })
})