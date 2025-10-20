"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
dotenv_1.default.config();
const firebase_1 = __importDefault(require("./config/firebase"));
try {
    firebase_1.default.getInstance().initialize();
}
catch (error) {
    console.warn('Firebase initialization failed:', error);
}
const error_middleware_1 = require("./middleware/error.middleware");
const auth_middleware_1 = require("./middleware/auth.middleware");
const audit_middleware_1 = require("./middleware/audit.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const lorry_routes_1 = __importDefault(require("./routes/lorry.routes"));
const lorry_request_routes_1 = __importDefault(require("./routes/lorry-request.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const farm_admin_routes_1 = __importDefault(require("./routes/farm-admin.routes"));
const field_manager_routes_1 = __importDefault(require("./routes/field-manager.routes"));
const farmer_routes_1 = __importDefault(require("./routes/farmer.routes"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const email_1 = __importDefault(require("./routes/email"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});
exports.io = io;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', audit_middleware_1.auditMiddleware);
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: process.env.API_VERSION || 'v1'
    });
});
const apiVersion = process.env.API_VERSION || 'v1';
app.use(`/api/${apiVersion}/auth`, auth_routes_1.default);
app.use(`/api/${apiVersion}/organizations`, organization_routes_1.default);
app.use(`/api/${apiVersion}`, lorry_routes_1.default);
app.use(`/api/${apiVersion}`, lorry_request_routes_1.default);
app.use(`/api/${apiVersion}`, delivery_routes_1.default);
app.use(`/api/${apiVersion}/farm-admin`, auth_middleware_1.authMiddleware, farm_admin_routes_1.default);
app.use(`/api/${apiVersion}/field-manager`, auth_middleware_1.authMiddleware, field_manager_routes_1.default);
app.use(`/api/${apiVersion}/farmer`, auth_middleware_1.authMiddleware, farmer_routes_1.default);
app.use(`/api/${apiVersion}/notifications`, notifications_1.default);
app.use(`/api/${apiVersion}/email`, email_1.default);
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('join-organization', (organizationId) => {
        socket.join(`org-${organizationId}`);
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
app.use(error_middleware_1.errorHandler);
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
});
const PORT = parseInt(process.env.PORT || '3000');
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 FarmTally Backend Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/${apiVersion}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map