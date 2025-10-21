#!/usr/bin/env node

/**
 * Test Frontend Login Flow
 */

const puppeteer = require('puppeteer');

async function testFrontendLogin() {
  console.log('🧪 Testing frontend login flow...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      console.log('🖥️  Browser:', msg.text());
    });
    
    // Navigate to simple login test
    console.log('📍 Navigating to simple login test...');
    await page.goto('http://localhost:3000/simple-login-test', { 
      waitUntil: 'networkidle0' 
    });
    
    // Wait for the test button and click it
    console.log('🔘 Clicking test login button...');
    await page.waitForSelector('button', { timeout: 10000 });
    await page.click('button');
    
    // Wait for result
    console.log('⏳ Waiting for result...');
    await page.waitForTimeout(5000);
    
    // Get the result text
    const result = await page.$eval('pre', el => el.textContent);
    console.log('📊 Test Result:');
    console.log(result);
    
    if (result.includes('SUCCESS')) {
      console.log('✅ Frontend login test PASSED!');
    } else {
      console.log('❌ Frontend login test FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  testFrontendLogin();
} catch (error) {
  console.log('⚠️  Puppeteer not available, skipping browser test');
  console.log('💡 You can manually test at: http://localhost:3000/simple-login-test');
}