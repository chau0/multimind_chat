# 🔗 Frontend-Backend Integration Tests

## 📋 **Overview**

Comprehensive integration tests that verify the complete data flow between the Multimind frontend and backend systems. These tests ensure that the frontend components work correctly with real API endpoints.

## 🏗️ **Test Architecture**

### **Test Setup**
- **Backend Server**: Automatically started/stopped for each test suite
- **Test Database**: Isolated SQLite database for testing
- **Real API Calls**: No mocking - tests use actual HTTP requests
- **Test Environment**: Controlled environment with test-specific endpoints

### **Test Categories**

#### 1. **Agents Integration** (`agents.integration.test.tsx`)
- ✅ Real API agent fetching
- ✅ Agent data structure validation
- ✅ AgentSelector component integration
- ✅ Error handling and recovery
- ✅ Caching behavior verification

#### 2. **Chat Integration** (`chat.integration.test.tsx`)
- ✅ End-to-end message sending/receiving
- ✅ Session management
- ✅ Mention processing
- ✅ Real-time chat flow
- ✅ Message data validation

#### 3. **Full Flow Integration** (`full-flow.integration.test.tsx`)
- ✅ Complete user workflows
- ✅ Page load to response cycles
- ✅ Agent selection + messaging
- ✅ Conversation history
- ✅ Typing indicators
- ✅ Concurrent interactions

#### 4. **Error Handling** (`error-handling.integration.test.tsx`)
- ✅ Network failures
- ✅ API timeouts
- ✅ HTTP error codes
- ✅ Malformed responses
- ✅ Recovery scenarios

## 🚀 **Running Integration Tests**

### **Prerequisites**
```bash
# Ensure backend dependencies are installed
cd backend && pip install -r requirements/dev.txt

# Ensure frontend dependencies are installed  
cd frontend && npm install
```

### **Test Commands**
```bash
# Run all integration tests
npm run test:integration

# Run integration tests with UI
npm run test:integration:ui

# Run specific integration test file
npm run test:integration -- agents.integration.test.tsx

# Run with verbose output
npm run test:integration -- --reporter=verbose
```

### **Environment Setup**
Integration tests automatically:
1. Start backend server on port 8001
2. Set `ENVIRONMENT=test`
3. Use test database (`test_multimind.db`)
4. Seed default test data
5. Clean up after tests complete

## 🔧 **Test Infrastructure**

### **Backend Test Endpoints**
Special endpoints available only in test environment:

- `POST /api/v1/test/reset` - Clear all test data
- `POST /api/v1/test/seed` - Seed default agents
- `GET /api/v1/test/status` - Test environment status
- `GET /api/v1/test/agents/count` - Agent count verification
- `GET /api/v1/test/messages/count` - Message count verification

### **Test Utilities**
- **`integration-setup.ts`**: Backend lifecycle management
- **`createIntegrationQueryClient()`**: Fresh QueryClient per test
- **`waitForBackend()`**: Backend readiness verification
- **`resetTestData()`**: Clean state between tests
- **`seedTestData()`**: Default test data setup

## 📊 **Test Coverage**

### **API Endpoints Tested**
- ✅ `GET /api/v1/health` - Health check
- ✅ `GET /api/v1/agents` - Agent listing
- ✅ `GET /api/v1/chat/sessions/{id}/messages` - Message history
- ✅ `POST /api/v1/chat/messages` - Send messages

### **Frontend Components Tested**
- ✅ **ChatPage**: Complete page integration
- ✅ **AgentSelector**: Real agent data integration
- ✅ **ChatInput**: Message sending integration
- ✅ **ChatWindow**: Message display integration
- ✅ **useAgents**: API fetching hook
- ✅ **useChat**: Chat management hook

### **User Workflows Tested**
- ✅ Page load → Agent selection → Message sending → Response
- ✅ Mention typing → Suggestion display → Agent response
- ✅ Multiple message conversation flow
- ✅ Error scenarios and recovery
- ✅ Concurrent user interactions

## 🎯 **Key Test Scenarios**

### **Happy Path**
1. User loads chat page
2. Agents load from real API
3. User types and sends message
4. Backend processes and responds
5. Frontend displays conversation

### **Error Scenarios**
1. Backend server unavailable
2. Network timeouts
3. Invalid API responses
4. HTTP error codes
5. Concurrent request failures

### **Edge Cases**
1. Empty agent list
2. Malformed message data
3. Session persistence
4. Rapid message sending
5. Long conversation history

## 🔍 **Test Quality Metrics**

### **Reliability**
- ✅ Isolated test environment
- ✅ Automatic cleanup between tests
- ✅ Deterministic test data
- ✅ Proper async handling

### **Performance**
- ✅ 30-second test timeout
- ✅ 60-second setup timeout
- ✅ Sequential test execution
- ✅ Efficient backend lifecycle

### **Maintainability**
- ✅ Reusable test utilities
- ✅ Clear test organization
- ✅ Comprehensive error handling
- ✅ Good test documentation

## 🚨 **Troubleshooting**

### **Common Issues**

#### Backend Won't Start
```bash
# Check Python environment
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001

# Check dependencies
pip install -r requirements/dev.txt
```

#### Tests Timeout
```bash
# Increase timeout in vitest.integration.config.ts
testTimeout: 60000  # 60 seconds
```

#### Port Conflicts
```bash
# Check if port 8001 is in use
lsof -i :8001

# Kill existing process
kill -9 <PID>
```

### **Debug Mode**
```bash
# Run with debug output
DEBUG=1 npm run test:integration

# Run single test with logs
npm run test:integration -- --reporter=verbose agents.integration.test.tsx
```

## 🎉 **Success Criteria**

Integration tests are successful when:
- ✅ All API endpoints respond correctly
- ✅ Frontend components integrate seamlessly
- ✅ Error scenarios are handled gracefully
- ✅ User workflows complete end-to-end
- ✅ Data flows correctly between systems

## 🔄 **CI/CD Integration**

For continuous integration:
```yaml
# .github/workflows/integration-tests.yml
- name: Run Integration Tests
  run: |
    cd backend && pip install -r requirements/dev.txt &
    cd frontend && npm install
    npm run test:integration
```

## 📈 **Future Enhancements**

Potential improvements:
- 🔄 **Performance testing** integration
- 🔄 **Visual regression** testing
- 🔄 **Load testing** scenarios
- 🔄 **Cross-browser** testing
- 🔄 **Mobile responsiveness** testing

---

The integration test suite provides confidence that the Multimind frontend and backend work together seamlessly, ensuring a reliable user experience in production.