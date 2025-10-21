"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrganization = exports.requireRole = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = require("../config/database");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No valid authorization header provided'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        const isBlacklisted = await jwt_1.jwtService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                error: 'Token revoked',
                message: 'This token has been revoked'
            });
        }
        const decoded = jwt_1.jwtService.verifyAccessToken(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                status: true,
            },
        });
        if (!user) {
            return res.status(401).json({
                error: 'User not found',
                message: 'User associated with this token no longer exists'
            });
        }
        if (user.status !== 'APPROVED') {
            return res.status(401).json({
                error: 'Account not approved',
                message: 'Your account has been deactivated'
            });
        }
        req.user = {
            id: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
        };
        next();
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(401).json({
                error: 'Invalid token',
                message: error.message
            });
        }
        res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to authenticate request'
        });
    }
};
exports.authMiddleware = authMiddleware;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to access this resource'
            });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Insufficient permissions',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireOrganization = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Authentication required',
            message: 'You must be logged in to access this resource'
        });
    }
    if (!req.user.organizationId) {
        return res.status(403).json({
            error: 'Organization required',
            message: 'You must be associated with an organization to access this resource'
        });
    }
    next();
};
exports.requireOrganization = requireOrganization;
//# sourceMappingURL=auth.middleware.js.map