const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Service URLs from environment
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:8081',
  organization: process.env.ORGANIZATION_SERVICE_URL || 'http://localhost:8082',
  farmer: process.env.FARMER_SERVICE_URL || 'http://localhost:8083',
  lorry: process.env.LORRY_SERVICE_URL || 'http://localhost:8084',
  delivery: process.env.DELIVERY_SERVICE_URL || 'http://localhost:8085',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:8086',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8087',
  fieldManager: process.env.FIELD_MANAGER_SERVICE_URL || 'http://localhost:8088',
  farmAdmin: process.env.FARM_ADMIN_SERVICE_URL || 'http://localhost:8089',
  report: process.env.REPORT_SERVICE_URL || 'http://localhost:8090',
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'FarmTally API Gateway is running',
    timestamp: new Date().toISOString(),
    services: Object.keys(services),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FarmTally API Gateway',
    version: '1.0.0',
    services: {
      auth: '/api/auth',
      organizations: '/api/organizations',
      farmers: '/api/farmers',
      lorries: '/api/lorries',
      deliveries: '/api/deliveries',
      payments: '/api/payments',
      notifications: '/api/notifications',
      fieldManager: '/api/field-manager',
      farmAdmin: '/api/farm-admin',
      reports: '/api/reports',
    },
  });
});

// Service routing with proxy middleware
const proxyOptions = {
  changeOrigin: true,
  timeout: 30000,
  onError: (err, req, res) => {
    console.error('Proxy error:', err.message);
    res.status(503).json({
      error: 'Service unavailable',
      message: 'The requested service is currently unavailable',
    });
  },
};

// Auth Service Routes
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  ...proxyOptions,
}));

// Organization Service Routes
app.use('/api/organizations', createProxyMiddleware({
  target: services.organization,
  ...proxyOptions,
}));

// Farmer Service Routes
app.use('/api/farmers', createProxyMiddleware({
  target: services.farmer,
  ...proxyOptions,
}));

// Lorry Service Routes
app.use('/api/lorries', createProxyMiddleware({
  target: services.lorry,
  ...proxyOptions,
}));

// Delivery Service Routes
app.use('/api/deliveries', createProxyMiddleware({
  target: services.delivery,
  ...proxyOptions,
}));

// Payment Service Routes
app.use('/api/payments', createProxyMiddleware({
  target: services.payment,
  ...proxyOptions,
}));

// Notification Service Routes
app.use('/api/notifications', createProxyMiddleware({
  target: services.notification,
  ...proxyOptions,
}));

// Field Manager Service Routes
app.use('/api/field-manager', createProxyMiddleware({
  target: services.fieldManager,
  ...proxyOptions,
}));

// Farm Admin Service Routes
app.use('/api/farm-admin', createProxyMiddleware({
  target: services.farmAdmin,
  ...proxyOptions,
}));

// Report Service Routes
app.use('/api/reports', createProxyMiddleware({
  target: services.report,
  ...proxyOptions,
}));

// Service health checks
app.get('/api/health/services', async (req, res) => {
  const healthChecks = {};
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(`${url}/health`);
      healthChecks[name] = {
        status: response.ok ? 'healthy' : 'unhealthy',
        url: url,
        responseTime: Date.now(),
      };
    } catch (error) {
      healthChecks[name] = {
        status: 'error',
        url: url,
        error: error.message,
      };
    }
  }
  
  res.json({
    gateway: 'healthy',
    services: healthChecks,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: Object.keys(services).map(service => `/api/${service}`),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FarmTally API Gateway running on port ${PORT}`);
  console.log(`🌐 Available services:`, Object.keys(services));
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;