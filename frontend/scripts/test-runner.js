#!/usr/bin/env node

/**
 * Enhanced Playwright Test Runner
 * Provides additional utilities for running and managing e2e tests
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function log(message, color = 'reset') {
  console.log(colorize(message, color));
}

function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');

  try {
    // Check if Playwright is installed
    await runCommand('npx', ['playwright', '--version'], { stdio: 'pipe' });
    log('✅ Playwright is installed', 'green');
  } catch {
    log('❌ Playwright not found. Installing...', 'red');
    await runCommand('npm', ['install', '@playwright/test']);
    await runCommand('npx', ['playwright', 'install']);
  }

  // Check if backend is running
  try {
    const response = await fetch('http://localhost:8001/api/v1/health');
    if (response.ok) {
      log('✅ Backend is running', 'green');
    } else {
      log('⚠️  Backend health check failed', 'yellow');
    }
  } catch {
    log('⚠️  Backend not accessible at localhost:8001', 'yellow');
    log('   Make sure to start the backend before running e2e tests', 'yellow');
  }
}

async function runTestSuite(suite, options = {}) {
  const { headed = false, debug = false, ui = false, updateSnapshots = false } = options;

  log(`🧪 Running ${suite} tests...`, 'cyan');

  const args = ['playwright', 'test'];

  if (suite !== 'all') {
    args.push(suite);
  }

  if (headed) args.push('--headed');
  if (debug) args.push('--debug');
  if (ui) args.push('--ui');
  if (updateSnapshots) args.push('--update-snapshots');

  try {
    await runCommand('npx', args);
    log(`✅ ${suite} tests completed successfully`, 'green');
  } catch (error) {
    log(`❌ ${suite} tests failed`, 'red');
    throw error;
  }
}

async function generateReport() {
  log('📊 Generating test report...', 'blue');

  try {
    await runCommand('npx', ['playwright', 'show-report']);
  } catch (error) {
    log('❌ Failed to generate report', 'red');
    throw error;
  }
}

async function listTests() {
  log('📋 Available test suites:', 'blue');

  const testDir = path.join(__dirname, '..', 'e2e');
  const files = fs.readdirSync(testDir).filter(file => file.endsWith('.spec.ts'));

  files.forEach(file => {
    const suiteName = file.replace('.spec.ts', '');
    log(`  • ${suiteName}`, 'cyan');
  });

  log('\n🎯 Usage examples:', 'blue');
  log('  npm run test:e2e                    # Run all tests', 'cyan');
  log('  npm run test:e2e:ui                 # Run with UI', 'cyan');
  log('  npm run test:e2e:headed             # Run headed', 'cyan');
  log('  npm run test:e2e:debug              # Debug mode', 'cyan');
  log('  npx playwright test performance     # Specific suite', 'cyan');
  log('  npx playwright test --project=chrome # Specific browser', 'cyan');
}

async function cleanupReports() {
  log('🧹 Cleaning up old test reports...', 'blue');

  const dirs = ['test-results', 'playwright-report'];

  for (const dir of dirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      log(`  Removed ${dir}`, 'yellow');
    }
  }

  log('✅ Cleanup completed', 'green');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'check':
        await checkPrerequisites();
        break;

      case 'list':
        await listTests();
        break;

      case 'clean':
        await cleanupReports();
        break;

      case 'report':
        await generateReport();
        break;

      case 'run':
        const suite = args[1] || 'all';
        const options = {
          headed: args.includes('--headed'),
          debug: args.includes('--debug'),
          ui: args.includes('--ui'),
          updateSnapshots: args.includes('--update-snapshots')
        };

        await checkPrerequisites();
        await runTestSuite(suite, options);
        break;

      case 'visual':
        await checkPrerequisites();
        await runTestSuite('visual-regression', {
          updateSnapshots: args.includes('--update')
        });
        break;

      case 'performance':
        await checkPrerequisites();
        await runTestSuite('performance');
        break;

      case 'cross-browser':
        await checkPrerequisites();
        await runTestSuite('cross-browser');
        break;

      default:
        log('🤖 Playwright Test Runner', 'bright');
        log('');
        log('Available commands:', 'blue');
        log('  check          Check prerequisites', 'cyan');
        log('  list           List available test suites', 'cyan');
        log('  clean          Clean up old reports', 'cyan');
        log('  report         Show test report', 'cyan');
        log('  run [suite]    Run tests (default: all)', 'cyan');
        log('  visual         Run visual regression tests', 'cyan');
        log('  performance    Run performance tests', 'cyan');
        log('  cross-browser  Run cross-browser tests', 'cyan');
        log('');
        log('Options:', 'blue');
        log('  --headed       Run in headed mode', 'cyan');
        log('  --debug        Run in debug mode', 'cyan');
        log('  --ui           Run with UI', 'cyan');
        log('  --update       Update visual baselines', 'cyan');
        log('');
        log('Examples:', 'blue');
        log('  node scripts/test-runner.js check', 'cyan');
        log('  node scripts/test-runner.js run performance --headed', 'cyan');
        log('  node scripts/test-runner.js visual --update', 'cyan');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkPrerequisites,
  runTestSuite,
  generateReport,
  listTests,
  cleanupReports
};
