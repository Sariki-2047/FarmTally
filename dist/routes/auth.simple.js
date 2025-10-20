"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_service_simple_1 = require("../services/auth.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email and password are required'
        });
    }
    try {
        const result = await auth_service_simple_1.authService.login({ email, password });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, firstName, lastName, role, organizationName } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({
            success: false,
            error: 'All fields are required'
        });
    }
    try {
        const result = await auth_service_simple_1.authService.register({
            email,
            password,
            firstName,
            lastName,
            role,
            organizationName
        });
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    try {
        const user = await auth_service_simple_1.authService.getCurrentUser(req.user.id);
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Auth service is healthy',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=auth.simple.js.map