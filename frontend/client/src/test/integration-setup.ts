import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

// Backend server setup for integration tests
let backendProcess: any = null
const BACKEND_URL = 'http://localhost:8001'
const FRONTEND_TEST_PORT = 3001

export const integrationTestSetup = {
  backendUrl: BACKEND_URL,
  frontendPort: FRONTEND_TEST_PORT,
}

// Create a fresh QueryClient for each test
export const createIntegrationQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
})

// Helper to wait for backend to be ready
export const waitForBackend = async (maxAttempts = 30, interval = 1000) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/health`)
      if (response.ok) {
        console.log('✅ Backend is ready for integration tests')
        return true
      }
    } catch (error) {
      // Backend not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  throw new Error('❌ Backend failed to start within timeout period')
}

// Helper to start backend for integration tests
export const startBackendForTests = async () => {
  const { spawn } = await import('child_process')
  const path = await import('path')
  
  console.log('🚀 Starting backend for integration tests...')
  
  // Start backend process
  backendProcess = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8001'], {
    cwd: path.resolve(process.cwd(), '../backend'),
    stdio: 'pipe',
    env: {
      ...process.env,
      ENVIRONMENT: 'test',
      DATABASE_URL: 'sqlite:///./test_multimind.db',
    }
  })

  backendProcess.stdout?.on('data', (data: Buffer) => {
    const output = data.toString()
    if (output.includes('Uvicorn running')) {
      console.log('✅ Backend server started successfully')
    }
  })

  backendProcess.stderr?.on('data', (data: Buffer) => {
    console.error('Backend error:', data.toString())
  })

  // Wait for backend to be ready
  await waitForBackend()
}

// Helper to stop backend
export const stopBackendForTests = async () => {
  if (backendProcess) {
    console.log('🛑 Stopping backend server...')
    backendProcess.kill('SIGTERM')
    
    // Wait for graceful shutdown
    await new Promise(resolve => {
      backendProcess.on('exit', resolve)
      setTimeout(() => {
        backendProcess.kill('SIGKILL')
        resolve(undefined)
      }, 5000)
    })
    
    backendProcess = null
    console.log('✅ Backend server stopped')
  }
}

// Setup and teardown for integration test suites
export const setupIntegrationTests = () => {
  beforeAll(async () => {
    await startBackendForTests()
  }, 60000) // 60 second timeout for backend startup

  afterAll(async () => {
    await stopBackendForTests()
  }, 10000) // 10 second timeout for shutdown
}

// Helper to reset database state between tests
export const resetTestData = async () => {
  try {
    // Clear any test data
    await fetch(`${BACKEND_URL}/api/v1/test/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.warn('Could not reset test data:', error)
  }
}

// Helper to seed test data
export const seedTestData = async () => {
  try {
    await fetch(`${BACKEND_URL}/api/v1/test/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.warn('Could not seed test data:', error)
  }
}