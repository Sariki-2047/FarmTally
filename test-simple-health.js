const http = require('http');

function testHealth() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Health check successful');
      console.log('Status:', res.statusCode);
      console.log('Response:', JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.log('❌ Health check failed:', error.message);
  });

  req.end();
}

testHealth();