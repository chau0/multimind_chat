import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Wait for backend to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();

  let retries = 30;
  while (retries > 0) {
    try {
      const response = await page.goto('http://localhost:8001/api/v1/health');
      if (response?.ok()) {
        console.log('✅ Backend is ready for E2E tests');
        break;
      }
    } catch (error) {
      // Backend not ready yet
    }

    retries--;
    if (retries === 0) {
      throw new Error('❌ Backend failed to start within timeout');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Seed test data
  try {
    await page.goto('http://localhost:8001/api/v1/test/reset', {
      waitUntil: 'networkidle'
    });
    await page.goto('http://localhost:8001/api/v1/test/seed', {
      waitUntil: 'networkidle'
    });
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    console.warn('⚠️ Could not seed test data:', error);
  }

  await browser.close();
  console.log('✅ E2E test setup complete');
}

export default globalSetup;
