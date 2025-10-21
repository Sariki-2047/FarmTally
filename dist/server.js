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
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
const fieldManager_1 = __importDefault(require("./routes/fieldManager"));
const farmer_1 = __importDefault(require("./routes/farmer"));
const delivery_simple_1 = __importDefault(require("./routes/delivery.simple"));
const invitation_simple_1 = __importDefault(require("./routes/invitation.simple"));
const lorry_request_simple_1 = __importDefault(require("./routes/lorry-request.simple"));
const lorry_simple_1 = __importDefault(require("./routes/lorry.simple"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const system_admin_routes_1 = __importDefault(require("./routes/system-admin.routes"));
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
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/field-manager', fieldManager_1.default);
app.use('/api/farmer', farmer_1.default);
app.use('/api/deliveries', delivery_simple_1.default);
app.use('/api/invitations', invitation_simple_1.default);
app.use('/api/lorry-requests', lorry_request_simple_1.default);
app.use('/api/lorries', lorry_simple_1.default);
app.use('/api/email', email_routes_1.default);
app.use('/api/system-admin', system_admin_routes_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: config_1.config.env,
        version: '1.0.0'
    });
});
app.get('/health', (req, res) => {
    res.json({
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
        message: 'FarmTally Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/health',
            api: '/api',
            auth: '/api/auth',
            admin: '/api/admin',
            fieldManager: '/api/field-manager',
            farmer: '/api/farmer'
        },
        documentation: 'See API_DOCUMENTATION.md for complete API reference'
    });
});
app.use(errorHandler_1.errorHandler);
const PORT = config_1.config.port;
app.listen(PORT, () => {
    console.log(`🚀 FarmTally server running on port ${PORT}`);
    console.log(`📱 Web app available at: http://localhost:${PORT}`);
    console.log(`🔗 API available at: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${config_1.config.env}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map