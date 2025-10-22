#!/usr/bin/env node

/**
 * FarmTally Microservices Testing Script
 * Test individual services and their interactions
 */

const axios = require('axios');

// Configuration
const VPS_HOST = '147.93.153.247';
const services = {
  'api-gateway': { port: 8080, path: '/health' },
  'auth-service': { port: 8081, path: '/health' },
  'organization-service': { port: 8082, path: '/health' },
  'farmer-service': { port: 8083, path: '/health' },
  'lorry-service': { port: 8084, path: '/health' },
  'delivery-service': { port: 8085, path: '/health' },
  'payment-service': { port: 8086, path: '/health' },
  'notification-service': { port: 8087, path: '/health' },
  'report-service': { port: 8088, path: '/health' },
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test individual service health
async function testServiceHealth(serviceName, config) {
  const url = `http://${VPS_HOST}:${config.port}${config.path}`;
  
  try {
    const response = await axios.get(url, { timeout: 5000 });
    
    if (response.status === 200) {
      logSuccess(`${serviceName} is healthy (${config.port})`);
      return { service: serviceName, status: 'healthy', data: response.data };
    } else {
      logError(`${serviceName} returned status ${response.status}`);
      return { service: serviceName, status: 'unhealthy', error: `Status ${response.status}` };
    }
  } catch (error) {
    logError(`${serviceName} health check failed: ${error.message}`);
    return { service: serviceName, status: 'error', error: error.message };
  }
}

// Test API Gateway routing
async function testAPIGatewayRouting() {
  logInfo('Testing API Gateway routing...');
  
  const routes = [
    '/api/auth/health',
    '/api/organizations/health',
    '/api/farmers/health',
    '/api/lorries/health',
    '/api/deliveries/health',
    '/api/payments/health',
    '/api/notifications/health',
    '/api/reports/health',
  ];
  
  const results = [];
  
  for (const route of routes) {
    const url = `http://${VPS_HOST}:8080${route}`;
    
    try {
      const response = await axios.get(url, { timeout: 5000 });
      logSuccess(`Gateway routing to ${route} works`);
      results.push({ route, status: 'success' });
    } catch (error) {
      logError(`Gateway routing to ${route} failed: ${error.message}`);
      results.push({ route, status: 'error', error: error.message });
    }
  }
  
  return results;
}

// Test authentication flow
async function testAuthenticationFlow() {
  logInfo('Testing authentication flow...');
  
  const authBaseUrl = `http://${VPS_HOST}:8081`;
  
  try {
    // Test registration
    const registerData = {
      email: `test-${Date.now()}@farmtally.com`,
      password: 'TestPassword123!',
      role: 'APPLICATION_ADMIN',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      }
    };
    
    const registerResponse = await axios.post(`${authBaseUrl}/register`, registerData);
    logSuccess('User registration successful');
    
    // Test login
    const loginData = {
      email: registerData.email,
      password: registerData.password
    };
    
    const loginResponse = await axios.post(`${authBaseUrl}/login`, loginData);
    
    if (loginResponse.data.data.tokens) {
      logSuccess('User login successful');
      
      // Test token verification
      const verifyResponse = await axios.post(`${authBaseUrl}/verify`, {
        token: loginResponse.data.data.tokens.accessToken
      });
      
      logSuccess('Token verification successful');
      
      return {
        status: 'success',
        user: loginResponse.data.data.user,
        tokens: loginResponse.data.data.tokens
      };
    } else {
      logWarning('Login successful but no tokens returned (user pending approval)');
      return { status: 'pending', user: loginResponse.data.data.user };
    }
    
  } catch (error) {
    logError(`Authentication flow failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

// Test service interactions
async function testServiceInteractions() {
  logInfo('Testing service interactions...');
  
  // This would test how services communicate with each other
  // For now, we'll test basic connectivity
  
  const gatewayUrl = `http://${VPS_HOST}:8080/api/health/services`;
  
  try {
    const response = await axios.get(gatewayUrl, { timeout: 10000 });
    
    if (response.data.services) {
      logSuccess('Service interaction test via gateway successful');
      
      const healthyServices = Object.entries(response.data.services)
        .filter(([name, info]) => info.status === 'healthy')
        .map(([name]) => name);
      
      logInfo(`Healthy services: ${healthyServices.join(', ')}`);
      
      return { status: 'success', services: response.data.services };
    } else {
      logError('Service interaction test failed - no services data');
      return { status: 'error', error: 'No services data' };
    }
    
  } catch (error) {
    logError(`Service interaction test failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

// Test database connectivity
async function testDatabaseConnectivity() {
  logInfo('Testing database connectivity through services...');
  
  const authUrl = `http://${VPS_HOST}:8081/users`;
  
  try {
    const response = await axios.get(authUrl, { timeout: 5000 });
    logSuccess('Database connectivity test successful');
    return { status: 'success', userCount: response.data.data.count };
  } catch (error) {
    logError(`Database connectivity test failed: ${error.message}`);
    return { status: 'error', error: error.message };
  }
}

// Generate test report
function generateTestReport(results) {
  log('\n' + '='.repeat(50), 'cyan');
  log('FARMTALLY MICROSERVICES TEST REPORT', 'cyan');
  log('='.repeat(50), 'cyan');
  
  // Service health summary
  log('\n📊 Service Health Summary:', 'blue');
  results.healthChecks.forEach(result => {
    const status = result.status === 'healthy' ? '✅' : '❌';
    log(`${status} ${result.service}: ${result.status}`);
  });
  
  // Overall health
  const healthyCount = results.healthChecks.filter(r => r.status === 'healthy').length;
  const totalCount = results.healthChecks.length;
  
  log(`\n🏥 Overall Health: ${healthyCount}/${totalCount} services healthy`, 
      healthyCount === totalCount ? 'green' : 'yellow');
  
  // Authentication test
  log('\n🔐 Authentication Test:', 'blue');
  if (results.authTest.status === 'success') {
    logSuccess('Authentication flow working correctly');
  } else if (results.authTest.status === 'pending') {
    logWarning('Authentication working but user approval required');
  } else {
    logError('Authentication flow failed');
  }
  
  // Service interactions
  log('\n🔄 Service Interactions:', 'blue');
  if (results.interactionTest.status === 'success') {
    logSuccess('Service interactions working correctly');
  } else {
    logError('Service interaction issues detected');
  }
  
  // Database connectivity
  log('\n🗄️  Database Connectivity:', 'blue');
  if (results.dbTest.status === 'success') {
    logSuccess(`Database accessible (${results.dbTest.userCount} users found)`);
  } else {
    logError('Database connectivity issues');
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'yellow');
  if (healthyCount < totalCount) {
    log('• Check logs for unhealthy services');
    log('• Verify service dependencies');
    log('• Check network connectivity between services');
  }
  
  if (results.authTest.status !== 'success') {
    log('• Verify JWT configuration');
    log('• Check database user table');
    log('• Verify password hashing');
  }
  
  log('\n🔗 Service URLs:', 'blue');
  Object.entries(services).forEach(([name, config]) => {
    log(`• ${name}: http://${VPS_HOST}:${config.port}`);
  });
  
  log('\n🌐 Main Application: http://' + VPS_HOST, 'green');
  log('='.repeat(50), 'cyan');
}

// Main test function
async function runTests() {
  log('🧪 Starting FarmTally Microservices Tests...', 'cyan');
  
  const results = {
    healthChecks: [],
    routingTest: [],
    authTest: {},
    interactionTest: {},
    dbTest: {}
  };
  
  // Test individual service health
  log('\n1️⃣  Testing individual service health...', 'blue');
  for (const [serviceName, config] of Object.entries(services)) {
    const result = await testServiceHealth(serviceName, config);
    results.healthChecks.push(result);
  }
  
  // Test API Gateway routing
  log('\n2️⃣  Testing API Gateway routing...', 'blue');
  results.routingTest = await testAPIGatewayRouting();
  
  // Test authentication flow
  log('\n3️⃣  Testing authentication flow...', 'blue');
  results.authTest = await testAuthenticationFlow();
  
  // Test service interactions
  log('\n4️⃣  Testing service interactions...', 'blue');
  results.interactionTest = await testServiceInteractions();
  
  // Test database connectivity
  log('\n5️⃣  Testing database connectivity...', 'blue');
  results.dbTest = await testDatabaseConnectivity();
  
  // Generate report
  generateTestReport(results);
  
  return results;
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'health':
    (async () => {
      for (const [serviceName, config] of Object.entries(services)) {
        await testServiceHealth(serviceName, config);
      }
    })();
    break;
    
  case 'auth':
    testAuthenticationFlow();
    break;
    
  case 'routing':
    testAPIGatewayRouting();
    break;
    
  case 'interactions':
    testServiceInteractions();
    break;
    
  case 'db':
    testDatabaseConnectivity();
    break;
    
  default:
    runTests();
}

module.exports = {
  testServiceHealth,
  testAPIGatewayRouting,
  testAuthenticationFlow,
  testServiceInteractions,
  testDatabaseConnectivity,
  runTests
};