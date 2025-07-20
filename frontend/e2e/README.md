# End-to-End Testing with Playwright

This directory contains comprehensive end-to-end tests for the Multimind chat application using Playwright.

## Test Structure

### Core Test Suites

1. **`chat-basic-flow.spec.ts`** (184 lines)
   - Basic chat functionality
   - Message sending and receiving
   - Input validation and keyboard shortcuts
   - Character counting and agent display

2. **`agent-interactions.spec.ts`** (201 lines)
   - Agent selection and switching
   - @mention functionality
   - Agent-specific responses
   - Dropdown interactions

3. **`responsive-design.spec.ts`** (175 lines)
   - Desktop, tablet, and mobile viewports
   - Touch interactions
   - Responsive layout validation
   - Orientation changes

4. **`accessibility.spec.ts`** (254 lines)
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader compatibility
   - Focus management

5. **`error-scenarios.spec.ts`** (267 lines)
   - Network failures
   - Invalid inputs
   - Server errors
   - Recovery mechanisms

### Enhanced Test Suites

6. **`performance.spec.ts`** (NEW)
   - Core Web Vitals measurement
   - Load time testing
   - Large conversation handling
   - Network delay simulation

7. **`visual-regression.spec.ts`** (NEW)
   - Screenshot comparisons
   - Layout consistency
   - Theme variations
   - Error state visuals

8. **`cross-browser.spec.ts`** (NEW)
   - Browser compatibility testing
   - JavaScript feature support
   - CSS feature validation
   - Consistent behavior verification

9. **`advanced-flows.spec.ts`** (NEW)
   - Complex multi-agent conversations
   - Session persistence
   - Concurrent interactions
   - Navigation testing

## Running Tests

### Prerequisites
```bash
# Install Playwright browsers
npm run test:e2e:install
```

### Test Commands

```bash
# Run all e2e tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Specific Test Suites

```bash
# Run only performance tests
npx playwright test performance

# Run only visual regression tests
npx playwright test visual-regression

# Run only cross-browser tests
npx playwright test cross-browser

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Configuration

The tests are configured in `playwright.config.ts` with:

- **Multi-browser support**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: Pixel 5, iPhone 12
- **Parallel execution**: Faster test runs
- **Automatic screenshots/videos**: On failure
- **Trace collection**: For debugging
- **Global setup/teardown**: Test data management

## Test Data Management

- **Global Setup**: Ensures backend is ready and seeds test data
- **Before Each**: Resets and reseeds data for consistent test state
- **Global Teardown**: Cleans up test data after all tests

## Visual Regression Testing

Visual tests capture screenshots and compare them against baselines:

```bash
# Update visual baselines
npx playwright test visual-regression --update-snapshots

# Run visual tests only
npx playwright test visual-regression
```

Screenshots are stored in `test-results/` and `playwright-report/`.

## Performance Testing

Performance tests measure:
- **Core Web Vitals**: FCP, LCP, CLS
- **Load times**: Page and component loading
- **Response times**: Message sending and receiving
- **Memory usage**: Large conversation handling

## Cross-Browser Testing

Tests verify consistent behavior across:
- **Desktop browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: Mobile Chrome, Mobile Safari
- **JavaScript features**: Modern ES6+ support
- **CSS features**: Grid, Flexbox, Custom Properties

## Best Practices

### Writing Tests
1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before assertions
3. **Use explicit waits** instead of fixed timeouts
4. **Test user workflows** not just individual features
5. **Keep tests independent** and idempotent

### Debugging
1. **Use headed mode** to see what's happening
2. **Add screenshots** at key points
3. **Use trace viewer** for detailed debugging
4. **Check network requests** in browser dev tools
5. **Verify test data** is properly seeded

### Maintenance
1. **Update baselines** when UI changes intentionally
2. **Review flaky tests** and improve selectors
3. **Monitor test performance** and optimize slow tests
4. **Keep tests up to date** with application changes

## CI/CD Integration

For continuous integration:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout in `playwright.config.ts`
   - Check if backend is running properly
   - Verify network connectivity

2. **Element not found**
   - Check if selectors are correct
   - Ensure page is fully loaded
   - Verify test data is seeded

3. **Visual tests failing**
   - Check if UI changes are intentional
   - Update baselines if needed
   - Verify consistent test environment

4. **Flaky tests**
   - Add proper waits for dynamic content
   - Use more specific selectors
   - Check for race conditions

### Getting Help

- Check Playwright documentation: https://playwright.dev/
- Review test logs in `playwright-report/`
- Use trace viewer for detailed debugging
- Check browser console for JavaScript errors
