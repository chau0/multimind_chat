# Frontend Unit Tests

This document describes the comprehensive unit test suite created for the Multimind frontend application.

## Test Setup

### Testing Framework
- **Vitest**: Modern testing framework with Vite integration
- **React Testing Library**: For component testing
- **jsdom**: Browser environment simulation
- **@testing-library/jest-dom**: Additional matchers

### Configuration Files
- `vitest.config.ts`: Vitest configuration with jsdom environment
- `client/src/test/setup.ts`: Global test setup and mocks
- `client/src/test/test-utils.tsx`: Custom render function with providers

## Test Coverage

### Components (`client/src/components/__tests__/`)

#### MessageBubble.test.tsx
- ✅ Renders user messages correctly
- ✅ Renders agent messages correctly
- ✅ Handles missing agent data
- ✅ Displays multiline content with proper formatting
- ✅ Shows agent description badges

#### AgentSelector.test.tsx
- ✅ Shows loading state
- ✅ Renders default agent selection
- ✅ Renders selected agent
- ✅ Opens/closes dropdown menu
- ✅ Handles agent selection callbacks
- ✅ Closes dropdown on backdrop click

#### ChatInput.test.tsx
- ✅ Renders input field and send button
- ✅ Sends messages on button click
- ✅ Sends messages on Enter key
- ✅ Handles Shift+Enter for new lines
- ✅ Shows mention suggestions when typing @
- ✅ Filters mention suggestions
- ✅ Inserts mentions when selected
- ✅ Parses mentions correctly
- ✅ Handles disabled state
- ✅ Shows character count and agent count
- ✅ Clears input after sending

#### ChatWindow.test.tsx
- ✅ Shows loading state
- ✅ Displays welcome message when no messages
- ✅ Renders message list correctly
- ✅ Shows typing indicator
- ✅ Associates messages with correct agents
- ✅ Handles unknown agents gracefully

### Hooks (`client/src/hooks/__tests__/`)

#### useAgents.test.ts
- ✅ Fetches agents successfully
- ✅ Handles fetch errors
- ✅ Uses correct query key for caching
- ✅ Respects stale time configuration

#### useChat.test.ts
- ✅ Fetches messages on mount
- ✅ Uses default session ID
- ✅ Sends messages successfully
- ✅ Handles optimistic updates
- ✅ Sets typing agent for mentions
- ✅ Handles send errors
- ✅ Prevents sending empty messages
- ✅ Trims message content

#### useMentionParser.test.ts
- ✅ Parses mentions correctly
- ✅ Handles case insensitive mentions
- ✅ Ignores invalid mentions
- ✅ Removes duplicate mentions
- ✅ Finds mention positions
- ✅ Filters agents by query
- ✅ Filters by display name
- ✅ Shows/hides suggestions based on input
- ✅ Inserts mentions correctly

### Services (`client/src/services/__tests__/`)

#### chatService.test.ts
- ✅ Fetches agents successfully
- ✅ Fetches messages with session management
- ✅ Sends messages with proper payload transformation
- ✅ Handles API errors
- ✅ Transforms backend responses correctly

### Pages (`client/src/pages/__tests__/`)

#### chat.test.tsx
- ✅ Renders complete chat interface
- ✅ Displays agent selector
- ✅ Allows sending messages
- ✅ Handles agent selection
- ✅ Shows loading states
- ✅ Displays typing indicators
- ✅ Handles disabled states

### Utilities (`client/src/lib/__tests__/`)

#### utils.test.ts
- ✅ Merges class names correctly
- ✅ Handles conditional classes
- ✅ Handles undefined/null values
- ✅ Resolves Tailwind conflicts

#### queryClient.test.ts
- ✅ Makes GET requests correctly
- ✅ Makes POST requests with body
- ✅ Handles fetch errors
- ✅ Handles non-ok responses

### App (`client/src/__tests__/`)

#### App.test.tsx
- ✅ Renders without crashing
- ✅ Provides QueryClient context
- ✅ Provides TooltipProvider context
- ✅ Includes Toaster component

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Patterns

### Mocking
- Services are mocked using `vi.mock()`
- React Query hooks require QueryClientProvider wrapper
- DOM APIs are mocked in setup.ts

### Async Testing
- Uses `waitFor()` for async operations
- Uses `act()` for state updates
- Proper cleanup in `beforeEach()`

### Component Testing
- Uses custom render function with providers
- Tests user interactions with `userEvent`
- Verifies accessibility and semantic HTML

### Hook Testing
- Uses `renderHook()` with proper wrappers
- Tests both success and error scenarios
- Verifies side effects and state changes

## Key Features Tested

1. **Message Handling**: Sending, receiving, and displaying messages
2. **Agent System**: Selection, mentions, and responses
3. **Real-time Features**: Typing indicators and optimistic updates
4. **Error Handling**: Network errors and edge cases
5. **User Interactions**: Keyboard shortcuts, dropdowns, suggestions
6. **Accessibility**: Proper ARIA labels and semantic structure

The test suite provides comprehensive coverage of the frontend functionality, ensuring reliability and maintainability of the Multimind chat application.
