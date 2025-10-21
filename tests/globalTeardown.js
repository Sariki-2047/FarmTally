/**
 * Jest Global Teardown
 * Runs once after all tests
 */

const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Cleaning up FarmTally Pipeline Tests...');
  
  // Read test configuration
  const configPath = 'tests/temp/test-config.json';
  let testConfig = {};
  
  if (fs.existsSync(configPath)) {
    testConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
  
  // Calculate test duration
  const endTime = new Date();
  const startTime = new Date(testConfig.startTime || endTime);
  const duration = endTime - startTime;
  
  // Generate test summary
  const summary = {
    startTime: testConfig.startTime,
    endTime: endTime.toISOString(),
    duration: `${Math.round(duration / 1000)}s`,
    environment: process.env.NODE_ENV,
    coverage: testConfig.coverage
  };
  
  fs.writeFileSync('tests/temp/test-summary.json', JSON.stringify(summary, null, 2));
  
  // Cleanup temporary files (but keep reports and coverage)
  const tempFiles = [
    'tests/temp/test-config.json'
  ];
  
  tempFiles.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
  
  console.log(`✅ Tests completed in ${summary.duration}`);
  console.log('📊 Coverage report available in tests/coverage/');
};