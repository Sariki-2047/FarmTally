const http = require('http');
const https = require('https');

class PerformanceMonitor {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const startTime = Date.now();
      
      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          resolve({
            statusCode: res.statusCode,
            responseTime,
            body,
            headers: res.headers,
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async testEndpoint(name, path, method = 'GET', data = null, headers = {}, iterations = 10) {
    console.log(`\n🧪 Testing ${name}...`);
    const results = [];

    for (let i = 0; i < iterations; i++) {
      try {
        const result = await this.makeRequest(path, method, data, headers);
        results.push(result);
        process.stdout.write('.');
      } catch (error) {
        console.error(`\n❌ Request ${i + 1} failed:`, error.message);
        results.push({ error: error.message, responseTime: null });
      }
    }

    const successfulResults = results.filter(r => !r.error && r.statusCode < 400);
    const responseTimes = successfulResults.map(r => r.responseTime);
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const minResponseTime = Math.min(...responseTimes);
      const maxResponseTime = Math.max(...responseTimes);
      const successRate = (successfulResults.length / iterations) * 100;

      console.log(`\n✅ ${name} Results:`);
      console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
      console.log(`   Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`   Min Response Time: ${minResponseTime}ms`);
      console.log(`   Max Response Time: ${maxResponseTime}ms`);

      this.results.push({
        name,
        successRate,
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        iterations,
      });
    } else {
      console.log(`\n❌ ${name}: All requests failed`);
    }
  }

  async runHealthCheck() {
    console.log('🏥 Running Health Check...');
    try {
      const result = await this.makeRequest('/health');
      if (result.statusCode === 200) {
        console.log('✅ Server is healthy');
        return true;
      } else {
        console.log(`❌ Health check failed with status ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Health check failed: ${error.message}`);
      return false;
    }
  }

  async runPerformanceTests() {
    console.log('🚀 Starting Performance Tests...');
    console.log(`📡 Base URL: ${this.baseUrl}`);

    // Health check first
    const isHealthy = await this.runHealthCheck();
    if (!isHealthy) {
      console.log('❌ Server is not healthy. Aborting performance tests.');
      return;
    }

    // Test various endpoints
    await this.testEndpoint('Health Check', '/health', 'GET', null, {}, 20);
    
    // Test API endpoints (these will fail without authentication, but we can measure response times)
    await this.testEndpoint('Auth Login (Invalid)', '/api/v1/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'wrongpassword'
    }, {}, 10);

    await this.testEndpoint('Get Farmers (Unauthorized)', '/api/v1/organizations/test/farmers', 'GET', null, {}, 10);

    // Test static content or public endpoints if available
    await this.testEndpoint('API Root', '/api/v1', 'GET', null, {}, 10);

    this.printSummary();
  }

  printSummary() {
    console.log('\n📊 Performance Test Summary');
    console.log('=' .repeat(50));
    
    if (this.results.length === 0) {
      console.log('No successful tests to summarize.');
      return;
    }

    this.results.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`  Success Rate: ${result.successRate.toFixed(1)}%`);
      console.log(`  Avg Response: ${result.avgResponseTime.toFixed(2)}ms`);
      console.log(`  Range: ${result.minResponseTime}ms - ${result.maxResponseTime}ms`);
    });

    const overallAvg = this.results.reduce((sum, r) => sum + r.avgResponseTime, 0) / this.results.length;
    console.log(`\n🎯 Overall Average Response Time: ${overallAvg.toFixed(2)}ms`);

    // Performance recommendations
    console.log('\n💡 Performance Recommendations:');
    if (overallAvg > 1000) {
      console.log('   ⚠️  High response times detected. Consider optimizing database queries.');
    } else if (overallAvg > 500) {
      console.log('   ⚠️  Moderate response times. Monitor under load.');
    } else {
      console.log('   ✅ Good response times.');
    }

    const lowSuccessRateTests = this.results.filter(r => r.successRate < 95);
    if (lowSuccessRateTests.length > 0) {
      console.log('   ⚠️  Some endpoints have low success rates. Check error handling.');
    }
  }
}

// Run performance tests
async function main() {
  const baseUrl = process.argv[2] || 'http://localhost:3000';
  const monitor = new PerformanceMonitor(baseUrl);
  
  try {
    await monitor.runPerformanceTests();
  } catch (error) {
    console.error('❌ Performance test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PerformanceMonitor;