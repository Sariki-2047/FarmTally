import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../utils/jwt';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email?: string;
        phone?: string;
        role: string;
        organizationId?: string;
    };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No valid authorization header provided'
            });
        }

        const token = authHeader.replace('Bearer ', '');

        // Check if token is blacklisted
        const isBlacklisted = await jwtService.isTokenBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                error: 'Token revoked',
                message: 'This token has been revoked'
            });
        }

        // Verify token
        const decoded = jwtService.verifyAccessToken(token);

        // Verify user still exists and is active
        const user = await prisma.user.findUnique({
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

        if (user.status !== 'ACTIVE') {
            return res.status(401).json({
                error: 'Account inactive',
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
    } catch (error) {
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

// Role-based authorization middleware
export const requireRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
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

// Organization-based authorization middleware
export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
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