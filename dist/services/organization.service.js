"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class OrganizationService {
    async createOrganization(ownerId, data) {
        const existingOrg = await database_1.prisma.organization.findUnique({
            where: { code: data.code.toUpperCase() },
        });
        if (existingOrg) {
            throw new error_middleware_1.ConflictError('Organization code already exists');
        }
        const owner = await database_1.prisma.user.findUnique({
            where: { id: ownerId },
            select: { role: true, organizationId: true },
        });
        if (!owner) {
            throw new error_middleware_1.NotFoundError('Owner not found');
        }
        if (owner.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can create organizations');
        }
        if (owner.organizationId) {
            throw new error_middleware_1.BadRequestError('User already belongs to an organization');
        }
        const organization = await database_1.prisma.organization.create({
            data: {
                ...data,
                code: data.code.toUpperCase(),
                ownerId,
            },
        });
        await database_1.prisma.user.update({
            where: { id: ownerId },
            data: { organizationId: organization.id },
        });
        return organization;
    }
    async getOrganization(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: organizationId },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        role: true,
                        profile: true,
                        status: true,
                        createdAt: true,
                        lastLogin: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
            },
        });
        if (!organization) {
            throw new error_middleware_1.NotFoundError('Organization not found');
        }
        return organization;
    }
    async updateOrganization(organizationId, userId, data) {
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { ownerId: true },
        });
        if (!organization) {
            throw new error_middleware_1.NotFoundError('Organization not found');
        }
        if (organization.ownerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Only organization owner can update organization details');
        }
        const updatedOrganization = await database_1.prisma.organization.update({
            where: { id: organizationId },
            data,
        });
        return updatedOrganization;
    }
    async getOrganizationUsers(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const users = await database_1.prisma.user.findMany({
            where: { organizationId },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                profile: true,
                status: true,
                createdAt: true,
                lastLogin: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return users;
    }
    async inviteUser(organizationId, inviterId, userData) {
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { ownerId: true },
        });
        if (!organization) {
            throw new error_middleware_1.NotFoundError('Organization not found');
        }
        if (organization.ownerId !== inviterId) {
            throw new error_middleware_1.ForbiddenError('Only organization owner can invite users');
        }
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    ...(userData.email ? [{ email: userData.email }] : []),
                    ...(userData.phone ? [{ phone: userData.phone }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new error_middleware_1.ConflictError('User with this email or phone already exists');
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(tempPassword, 12);
        const user = await database_1.prisma.user.create({
            data: {
                email: userData.email?.toLowerCase(),
                phone: userData.phone,
                passwordHash,
                role: userData.role,
                organizationId,
                profile: userData.profile,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                email: true,
                phone: true,
                role: true,
                profile: true,
                status: true,
                createdAt: true,
            },
        });
        console.log(`Temporary password for ${userData.email || userData.phone}: ${tempPassword}`);
        return user;
    }
    async removeUser(organizationId, ownerId, userIdToRemove) {
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: organizationId },
            select: { ownerId: true },
        });
        if (!organization) {
            throw new error_middleware_1.NotFoundError('Organization not found');
        }
        if (organization.ownerId !== ownerId) {
            throw new error_middleware_1.ForbiddenError('Only organization owner can remove users');
        }
        if (ownerId === userIdToRemove) {
            throw new error_middleware_1.BadRequestError('Organization owner cannot remove themselves');
        }
        const userToRemove = await database_1.prisma.user.findUnique({
            where: { id: userIdToRemove },
            select: { organizationId: true },
        });
        if (!userToRemove || userToRemove.organizationId !== organizationId) {
            throw new error_middleware_1.NotFoundError('User not found in this organization');
        }
        await database_1.prisma.user.update({
            where: { id: userIdToRemove },
            data: {
                organizationId: null,
                status: 'INACTIVE',
            },
        });
    }
    async getOrganizationStats(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const [totalUsers, totalLorries, totalFarmers, totalDeliveries, totalAdvancePayments, recentRequests,] = await Promise.all([
            database_1.prisma.user.count({ where: { organizationId } }),
            database_1.prisma.lorry.count({ where: { organizationId } }),
            database_1.prisma.farmerOrganization.count({ where: { organizationId } }),
            database_1.prisma.delivery.count({ where: { organizationId } }),
            database_1.prisma.advancePayment.count({ where: { organizationId } }),
            database_1.prisma.lorryRequest.count({
                where: {
                    organizationId,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        return {
            totalUsers,
            totalLorries,
            totalFarmers,
            totalDeliveries,
            totalAdvancePayments,
            recentRequests,
        };
    }
}
exports.OrganizationService = OrganizationService;
//# sourceMappingURL=organization.service.js.map