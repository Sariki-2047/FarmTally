/**
 * Jest Global Setup
 * Runs once before all tests
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up FarmTally Pipeline Tests...');
  
  // Create test directories
  const testDirs = [
    'tests/temp',
    'tests/coverage',
    'tests/reports'
  ];
  
  testDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Set global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.CI = 'true';
  process.env.JEST_WORKER_ID = '1';
  
  // Create test configuration file
  const testConfig = {
    startTime: new Date().toISOString(),
    testEnvironment: 'node',
    coverage: true,
    parallel: true
  };
  
  fs.writeFileSync('tests/temp/test-config.json', JSON.stringify(testConfig, null, 2));
  
  console.log('✅ Global setup completed');
};