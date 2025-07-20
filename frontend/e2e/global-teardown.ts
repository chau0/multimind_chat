import { chromium, FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  // Clean up test data
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:8001/api/v1/test/reset', {
      waitUntil: 'networkidle'
    });

    await browser.close();
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Could not clean up test data:', error);
  }

  console.log('✅ E2E test teardown complete');
}

export default globalTeardown;
