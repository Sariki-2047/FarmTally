"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const config_1 = require("../config/config");
class AuthService {
    async login(data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
            include: { organization: true }
        });
        if (!user || !user.isActive) {
            throw new Error('Invalid credentials');
        }
        if (user.role === 'FARM_ADMIN' && user.status !== 'APPROVED') {
            const statusMessage = user.status === 'PENDING'
                ? 'Your Farm Admin account is pending approval by the application administrator.'
                : user.status === 'REJECTED'
                    ? 'Your Farm Admin account has been rejected. Please contact support.'
                    : 'Your account is not active. Please contact support.';
            throw new Error(statusMessage);
        }
        const isValidPassword = await bcrypt.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, config_1.config.jwt.secret, { expiresIn: config_1.config.jwt.expiresIn });
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                organization: {
                    id: user.organization.id,
                    name: user.organization.name
                }
            }
        };
    }
    async register(data) {
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, config_1.config.bcrypt.saltRounds);
        let organization = await prisma_1.prisma.organization.findFirst({
            where: { name: data.organizationName || 'Default Organization' }
        });
        if (!organization) {
            organization = await prisma_1.prisma.organization.create({
                data: {
                    name: data.organizationName || 'Default Organization',
                    code: (data.organizationName || 'DEFAULT').toUpperCase().replace(/\s+/g, '_'),
                    isActive: true
                }
            });
        }
        let initialStatus = 'APPROVED';
        let message = 'Account created successfully';
        if (data.role === 'FARM_ADMIN') {
            initialStatus = 'PENDING';
            message = 'Farm Admin account created successfully. Your account is pending approval by the application administrator.';
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
                status: initialStatus,
                organizationId: organization.id
            },
            include: { organization: true }
        });
        return {
            message,
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
        };
    }
    async getCurrentUser(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: true }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            organization: {
                id: user.organization.id,
                name: user.organization.name
            }
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.simple.js.map