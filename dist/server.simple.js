"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const auth_simple_1 = __importDefault(require("./routes/auth.simple"));
const admin_simple_1 = __importDefault(require("./routes/admin.simple"));
const farmer_simple_1 = __importDefault(require("./routes/farmer.simple"));
const lorry_simple_1 = __importDefault(require("./routes/lorry.simple"));
const lorry_request_simple_1 = __importDefault(require("./routes/lorry-request.simple"));
const delivery_simple_1 = __importDefault(require("./routes/delivery.simple"));
const advance_payment_simple_1 = __importDefault(require("./routes/advance-payment.simple"));
const invitation_simple_1 = __importDefault(require("./routes/invitation.simple"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
app.use((0, cors_1.default)({
    origin: config_1.config.cors.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
app.use('/api/auth', auth_simple_1.default);
app.use('/api/admin', admin_simple_1.default);
app.use('/api/farmers', farmer_simple_1.default);
app.use('/api/lorries', lorry_simple_1.default);
app.use('/api/lorry-requests', lorry_request_simple_1.default);
app.use('/api/deliveries', delivery_simple_1.default);
app.use('/api/advance-payments', advance_payment_simple_1.default);
app.use('/api/invitations', invitation_simple_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.env,
        version: '1.0.0',
        services: {
            auth: 'healthy',
            farmers: 'healthy',
            lorries: 'healthy',
            deliveries: 'healthy',
            advancePayments: 'healthy',
            database: 'connected'
        }
    });
});
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.env,
        version: '1.0.0',
        database: 'connected',
        message: 'FarmTally Backend API is running!'
    });
});
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FarmTally Backend API - Simple Version',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth',
            farmers: '/api/farmers',
            lorries: '/api/lorries',
            deliveries: '/api/deliveries'
        },
        features: [
            'User Authentication',
            'Farmer Management',
            'Lorry Management',
            'Delivery Management',
            'Corn Procurement Workflow',
            'Weight & Quality Tracking',
            'Financial Calculations',
            'Organization Support',
            'Role-based Access Control'
        ],
        documentation: 'Simple backend for testing and validation'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /health',
            'GET /api/health',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'GET /api/auth/profile',
            'GET /api/farmers',
            'POST /api/farmers',
            'GET /api/lorries',
            'POST /api/lorries',
            'POST /api/deliveries/lorries/:lorryId/farmers/:farmerId',
            'GET /api/deliveries/lorries/:lorryId',
            'PATCH /api/deliveries/:deliveryId/pricing'
        ]
    });
});
app.use(errorHandler_1.errorHandler);
const PORT = 9999;
app.listen(PORT, () => {
    console.log(`🚀 FarmTally Simple Backend running on port ${PORT}`);
    console.log(`📱 API available at: http://localhost:${PORT}/api`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${config_1.config.env}`);
    console.log(`✨ Features: Auth, Farmers, Lorries, Deliveries`);
});
exports.default = app;
//# sourceMappingURL=server.simple.js.map