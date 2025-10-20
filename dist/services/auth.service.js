"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../config/database");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
class AuthService {
    async register(data) {
        if (!data.email && !data.phone) {
            throw new error_middleware_1.BadRequestError('Either email or phone number is required');
        }
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    ...(data.email ? [{ email: data.email }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new error_middleware_1.ConflictError('User with this email or phone already exists');
        }
        if (data.role !== 'FARM_ADMIN' && data.organizationId) {
            const organization = await database_1.prisma.organization.findUnique({
                where: { id: data.organizationId },
            });
            if (!organization) {
                throw new error_middleware_1.NotFoundError('Organization not found');
            }
        }
        const passwordHash = await password_1.PasswordService.hash(data.password);
        const user = await database_1.prisma.user.create({
            data: {
                email: data.email?.toLowerCase(),
                phone: data.phone,
                passwordHash,
                role: data.role,
                organizationId: data.organizationId,
                profile: data.profile,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        const tokenPayload = {
            userId: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
        };
        const tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
        await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
        return { user, tokens };
    }
    async login(data) {
        if (!data.email && !data.phone) {
            throw new error_middleware_1.BadRequestError('Either email or phone number is required');
        }
        const user = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
                    ...(data.phone ? [{ phone: data.phone }] : []),
                ],
            },
            select: {
                id: true,
                email: true,
                phone: true,
                passwordHash: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new error_middleware_1.UnauthorizedError('Invalid credentials');
        }
        if (user.status !== 'ACTIVE') {
            throw new error_middleware_1.UnauthorizedError('Account is inactive');
        }
        const isPasswordValid = await password_1.PasswordService.verify(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new error_middleware_1.UnauthorizedError('Invalid credentials');
        }
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        const tokenPayload = {
            userId: user.id,
            email: user.email || undefined,
            phone: user.phone || undefined,
            role: user.role,
            organizationId: user.organizationId || undefined,
        };
        const tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
        await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
        const { passwordHash, ...userResponse } = user;
        return { user: userResponse, tokens };
    }
    async refreshToken(refreshToken) {
        try {
            const decoded = jwt_1.jwtService.verifyRefreshToken(refreshToken);
            const storedToken = await jwt_1.jwtService.getStoredRefreshToken(decoded.userId);
            if (!storedToken || storedToken !== refreshToken) {
                throw new error_middleware_1.UnauthorizedError('Invalid refresh token');
            }
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
            if (!user || user.status !== 'ACTIVE') {
                throw new error_middleware_1.UnauthorizedError('User not found or inactive');
            }
            const tokenPayload = {
                userId: user.id,
                email: user.email || undefined,
                phone: user.phone || undefined,
                role: user.role,
                organizationId: user.organizationId || undefined,
            };
            const tokens = jwt_1.jwtService.generateTokenPair(tokenPayload);
            await jwt_1.jwtService.storeRefreshToken(user.id, tokens.refreshToken);
            return tokens;
        }
        catch (error) {
            throw new error_middleware_1.UnauthorizedError('Invalid refresh token');
        }
    }
    async logout(userId, accessToken) {
        await jwt_1.jwtService.revokeRefreshToken(userId);
        await jwt_1.jwtService.blacklistToken(accessToken);
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { passwordHash: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const isCurrentPasswordValid = await password_1.PasswordService.verify(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new error_middleware_1.UnauthorizedError('Current password is incorrect');
        }
        const validation = password_1.PasswordService.validate(newPassword);
        if (!validation.isValid) {
            throw new error_middleware_1.BadRequestError(`Password validation failed: ${validation.errors.join(', ')}`);
        }
        const newPasswordHash = await password_1.PasswordService.hash(newPassword);
        await database_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });
        await jwt_1.jwtService.revokeRefreshToken(userId);
    }
    async getUserProfile(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        return user;
    }
    async updateProfile(userId, profileData) {
        const user = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                profile: profileData,
            },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                organizationId: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        return user;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map