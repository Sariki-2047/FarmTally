"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LorryService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class LorryService {
    async createLorry(organizationId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can create lorries');
        }
        const existingLorry = await database_1.prisma.lorry.findFirst({
            where: {
                organizationId,
                licensePlate: data.licensePlate.toUpperCase(),
            },
        });
        if (existingLorry) {
            throw new error_middleware_1.BadRequestError('A lorry with this license plate already exists');
        }
        if (data.assignedManagerId) {
            const manager = await database_1.prisma.user.findUnique({
                where: { id: data.assignedManagerId },
                select: { role: true, organizationId: true, status: true },
            });
            if (!manager || manager.organizationId !== organizationId) {
                throw new error_middleware_1.NotFoundError('Manager not found in this organization');
            }
            if (manager.role !== 'FIELD_MANAGER') {
                throw new error_middleware_1.BadRequestError('Can only assign lorries to field managers');
            }
            if (manager.status !== 'ACTIVE') {
                throw new error_middleware_1.BadRequestError('Cannot assign lorry to inactive manager');
            }
        }
        const lorry = await database_1.prisma.lorry.create({
            data: {
                ...data,
                licensePlate: data.licensePlate.toUpperCase(),
                organizationId,
                status: data.assignedManagerId ? 'ASSIGNED' : 'AVAILABLE',
                assignedAt: data.assignedManagerId ? new Date() : null,
            },
            include: {
                assignedManager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
            },
        });
        return lorry;
    }
    async getLorries(organizationId, userId, filters = {}, page = 1, limit = 20) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = { organizationId };
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.assignedManagerId) {
            where.assignedManagerId = filters.assignedManagerId;
        }
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { licensePlate: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        if (user.role === 'FIELD_MANAGER') {
            where.assignedManagerId = userId;
        }
        const [lorries, total] = await Promise.all([
            database_1.prisma.lorry.findMany({
                where,
                include: {
                    assignedManager: {
                        select: {
                            id: true,
                            email: true,
                            phone: true,
                            profile: true,
                        },
                    },
                    _count: {
                        select: {
                            requests: true,
                            deliveries: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.prisma.lorry.count({ where }),
        ]);
        return {
            lorries,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getLorryById(lorryId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                assignedManager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
                requests: {
                    select: {
                        id: true,
                        requiredDate: true,
                        priority: true,
                        status: true,
                        manager: {
                            select: {
                                id: true,
                                email: true,
                                profile: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                deliveries: {
                    select: {
                        id: true,
                        deliveryDate: true,
                        grossWeight: true,
                        netWeight: true,
                        status: true,
                        farmer: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (user.organizationId !== lorry.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        return lorry;
    }
    async updateLorry(lorryId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            select: { organizationId: true, assignedManagerId: true },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (user.organizationId !== lorry.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (user.role === 'FIELD_MANAGER') {
            if (lorry.assignedManagerId !== userId) {
                throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
            }
            const allowedFields = ['location', 'status'];
            const hasDisallowedFields = Object.keys(data).some(key => !allowedFields.includes(key));
            if (hasDisallowedFields) {
                throw new error_middleware_1.ForbiddenError('Field managers can only update location and status');
            }
        }
        if (data.licensePlate) {
            const existingLorry = await database_1.prisma.lorry.findFirst({
                where: {
                    organizationId: lorry.organizationId,
                    licensePlate: data.licensePlate.toUpperCase(),
                    id: { not: lorryId },
                },
            });
            if (existingLorry) {
                throw new error_middleware_1.BadRequestError('A lorry with this license plate already exists');
            }
            data.licensePlate = data.licensePlate.toUpperCase();
        }
        if (data.assignedManagerId !== undefined) {
            if (data.assignedManagerId) {
                const manager = await database_1.prisma.user.findUnique({
                    where: { id: data.assignedManagerId },
                    select: { role: true, organizationId: true, status: true },
                });
                if (!manager || manager.organizationId !== lorry.organizationId) {
                    throw new error_middleware_1.NotFoundError('Manager not found in this organization');
                }
                if (manager.role !== 'FIELD_MANAGER') {
                    throw new error_middleware_1.BadRequestError('Can only assign lorries to field managers');
                }
                if (manager.status !== 'ACTIVE') {
                    throw new error_middleware_1.BadRequestError('Cannot assign lorry to inactive manager');
                }
                data.status = 'ASSIGNED';
                data.assignedAt = new Date();
            }
            else {
                data.status = 'AVAILABLE';
                data.assignedAt = null;
            }
        }
        const updatedLorry = await database_1.prisma.lorry.update({
            where: { id: lorryId },
            data,
            include: {
                assignedManager: {
                    select: {
                        id: true,
                        email: true,
                        phone: true,
                        profile: true,
                    },
                },
            },
        });
        return updatedLorry;
    }
    async deleteLorry(lorryId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can delete lorries');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            select: {
                organizationId: true,
                _count: {
                    select: {
                        requests: true,
                        deliveries: true,
                    },
                },
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (user.organizationId !== lorry.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (lorry._count.requests > 0 || lorry._count.deliveries > 0) {
            throw new error_middleware_1.BadRequestError('Cannot delete lorry with existing requests or deliveries');
        }
        await database_1.prisma.lorry.delete({
            where: { id: lorryId },
        });
    }
    async assignLorryToManager(lorryId, managerId, userId) {
        return this.updateLorry(lorryId, userId, { assignedManagerId: managerId });
    }
    async unassignLorry(lorryId, userId) {
        return this.updateLorry(lorryId, userId, { assignedManagerId: null });
    }
    async getLorryStats(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = { organizationId };
        if (user.role === 'FIELD_MANAGER') {
            where.assignedManagerId = userId;
        }
        const [totalLorries, availableLorries, assignedLorries, inTransitLorries, maintenanceLorries,] = await Promise.all([
            database_1.prisma.lorry.count({ where }),
            database_1.prisma.lorry.count({ where: { ...where, status: 'AVAILABLE' } }),
            database_1.prisma.lorry.count({ where: { ...where, status: 'ASSIGNED' } }),
            database_1.prisma.lorry.count({ where: { ...where, status: 'IN_TRANSIT' } }),
            database_1.prisma.lorry.count({ where: { ...where, status: 'MAINTENANCE' } }),
        ]);
        return {
            totalLorries,
            availableLorries,
            assignedLorries,
            inTransitLorries,
            maintenanceLorries,
            utilizationRate: totalLorries > 0 ? ((assignedLorries + inTransitLorries) / totalLorries * 100).toFixed(1) : 0,
        };
    }
}
exports.LorryService = LorryService;
//# sourceMappingURL=lorry.service.js.map