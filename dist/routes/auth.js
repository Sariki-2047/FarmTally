"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const config_1 = require("../config/config");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await prisma_1.prisma.user.findUnique({
        where: { email },
        include: { organization: true }
    });
    if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organization: {
                id: user.organization.id,
                name: user.organization.name
            }
        }
    });
}));
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, firstName, lastName, role, organizationName } = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, config_1.config.bcrypt.saltRounds);
    let organization = await prisma_1.prisma.organization.findFirst({
        where: { name: organizationName || 'Default Organization' }
    });
    if (!organization) {
        organization = await prisma_1.prisma.organization.create({
            data: { name: organizationName || 'Default Organization' }
        });
    }
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            organizationId: organization.id
        },
        include: { organization: true }
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
    res.status(201).json({
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organization: {
                id: user.organization.id,
                name: user.organization.name
            }
        }
    });
}));
router.get('/profile', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        include: { organization: true }
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        organization: {
            id: user.organization.id,
            name: user.organization.name
        }
    });
}));
router.post('/refresh', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const token = jsonwebtoken_1.default.sign({ userId: req.user.id, email: req.user.email, role: req.user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
    res.json({ token });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map