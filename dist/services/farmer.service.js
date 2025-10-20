"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FarmerService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class FarmerService {
    async createFarmer(organizationId, createdBy, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: createdBy },
            select: { role: true, organizationId: true, status: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
            throw new error_middleware_1.ForbiddenError('Only farm admins and field managers can create farmers');
        }
        if (user.status !== 'ACTIVE') {
            throw new error_middleware_1.BadRequestError('Inactive users cannot create farmers');
        }
        const existingFarmer = await database_1.prisma.farmer.findFirst({
            where: {
                phone: data.phone,
                organizations: {
                    some: {
                        organizationId: organizationId,
                    },
                },
            },
        });
        if (existingFarmer) {
            throw new error_middleware_1.ConflictError('A farmer with this phone number already exists in your organization');
        }
        const globalFarmer = await database_1.prisma.farmer.findFirst({
            where: { phone: data.phone },
        });
        let farmer;
        if (globalFarmer) {
            farmer = globalFarmer;
            const existingRelation = await database_1.prisma.farmerOrganization.findUnique({
                where: {
                    farmerId_organizationId: {
                        farmerId: farmer.id,
                        organizationId: organizationId,
                    },
                },
            });
            if (existingRelation) {
                throw new error_middleware_1.ConflictError('This farmer is already part of your organization');
            }
            await database_1.prisma.farmerOrganization.create({
                data: {
                    farmerId: farmer.id,
                    organizationId: organizationId,
                    status: 'ACTIVE',
                    qualityRating: null,
                    totalDeliveries: 0,
                    totalEarnings: 0,
                },
            });
        }
        else {
            farmer = await database_1.prisma.farmer.create({
                data: {
                    name: data.name,
                    phone: data.phone,
                    email: data.email?.toLowerCase(),
                    address: data.address,
                    idNumber: data.idNumber,
                    bankDetails: data.bankDetails || {},
                    createdBy: createdBy,
                },
            });
            await database_1.prisma.farmerOrganization.create({
                data: {
                    farmerId: farmer.id,
                    organizationId: organizationId,
                    status: 'ACTIVE',
                    qualityRating: null,
                    totalDeliveries: 0,
                    totalEarnings: 0,
                },
            });
        }
        const farmerWithOrg = await database_1.prisma.farmer.findUnique({
            where: { id: farmer.id },
            include: {
                organizations: {
                    where: { organizationId },
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return farmerWithOrg;
    }
    async getFarmers(organizationId, userId, filters = {}, page = 1, limit = 20) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = {
            organizations: {
                some: {
                    organizationId: organizationId,
                },
            },
        };
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
                { idNumber: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        const [farmers, total] = await Promise.all([
            database_1.prisma.farmer.findMany({
                where,
                include: {
                    organizations: {
                        where: { organizationId },
                        select: {
                            status: true,
                            qualityRating: true,
                            totalDeliveries: true,
                            totalEarnings: true,
                            joinDate: true,
                        },
                    },
                    creator: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                    _count: {
                        select: {
                            deliveries: {
                                where: { organizationId },
                            },
                            advancePayments: {
                                where: { organizationId },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.prisma.farmer.count({ where }),
        ]);
        return {
            farmers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getFarmerById(farmerId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const farmer = await database_1.prisma.farmer.findUnique({
            where: { id: farmerId },
            include: {
                organizations: {
                    where: { organizationId: user.organizationId },
                    include: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                    },
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
                deliveries: {
                    where: { organizationId: user.organizationId },
                    select: {
                        id: true,
                        deliveryDate: true,
                        grossWeight: true,
                        netWeight: true,
                        totalValue: true,
                        status: true,
                        lorry: {
                            select: {
                                name: true,
                                licensePlate: true,
                            },
                        },
                    },
                    orderBy: { deliveryDate: 'desc' },
                    take: 10,
                },
                advancePayments: {
                    where: { organizationId: user.organizationId },
                    select: {
                        id: true,
                        amount: true,
                        paymentDate: true,
                        paymentMethod: true,
                        status: true,
                    },
                    orderBy: { paymentDate: 'desc' },
                    take: 10,
                },
            },
        });
        if (!farmer) {
            throw new error_middleware_1.NotFoundError('Farmer not found');
        }
        if (farmer.organizations.length === 0) {
            throw new error_middleware_1.ForbiddenError('Farmer not found in your organization');
        }
        return farmer;
    }
    async updateFarmer(farmerId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
            throw new error_middleware_1.ForbiddenError('Only farm admins and field managers can update farmers');
        }
        const farmer = await database_1.prisma.farmer.findFirst({
            where: {
                id: farmerId,
                organizations: {
                    some: {
                        organizationId: user.organizationId,
                    },
                },
            },
        });
        if (!farmer) {
            throw new error_middleware_1.NotFoundError('Farmer not found in your organization');
        }
        if (data.phone && data.phone !== farmer.phone) {
            const existingFarmer = await database_1.prisma.farmer.findFirst({
                where: {
                    phone: data.phone,
                    id: { not: farmerId },
                    organizations: {
                        some: {
                            organizationId: user.organizationId,
                        },
                    },
                },
            });
            if (existingFarmer) {
                throw new error_middleware_1.ConflictError('A farmer with this phone number already exists in your organization');
            }
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.email !== undefined)
            updateData.email = data.email?.toLowerCase();
        if (data.address !== undefined)
            updateData.address = data.address;
        if (data.idNumber !== undefined)
            updateData.idNumber = data.idNumber;
        if (data.bankDetails !== undefined)
            updateData.bankDetails = data.bankDetails;
        const updatedFarmer = await database_1.prisma.farmer.update({
            where: { id: farmerId },
            data: updateData,
            include: {
                organizations: {
                    where: { organizationId: user.organizationId },
                    select: {
                        status: true,
                        qualityRating: true,
                        totalDeliveries: true,
                        totalEarnings: true,
                        joinDate: true,
                    },
                },
                creator: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return updatedFarmer;
    }
    async removeFarmerFromOrganization(farmerId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can remove farmers from organization');
        }
        const [deliveryCount, advanceCount] = await Promise.all([
            database_1.prisma.delivery.count({
                where: {
                    farmerId: farmerId,
                    organizationId: user.organizationId,
                },
            }),
            database_1.prisma.advancePayment.count({
                where: {
                    farmerId: farmerId,
                    organizationId: user.organizationId,
                    status: 'ACTIVE',
                },
            }),
        ]);
        if (deliveryCount > 0 || advanceCount > 0) {
            throw new error_middleware_1.BadRequestError('Cannot remove farmer with existing deliveries or active advance payments');
        }
        await database_1.prisma.farmerOrganization.delete({
            where: {
                farmerId_organizationId: {
                    farmerId: farmerId,
                    organizationId: user.organizationId,
                },
            },
        });
    }
    async getFarmerStats(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const [totalFarmers, activeFarmers, farmersWithDeliveries, farmersWithAdvances, avgQualityRating,] = await Promise.all([
            database_1.prisma.farmerOrganization.count({
                where: { organizationId },
            }),
            database_1.prisma.farmerOrganization.count({
                where: { organizationId, status: 'ACTIVE' },
            }),
            database_1.prisma.farmerOrganization.count({
                where: {
                    organizationId,
                    totalDeliveries: { gt: 0 },
                },
            }),
            database_1.prisma.advancePayment.count({
                where: {
                    organizationId,
                    status: 'ACTIVE',
                },
            }),
            database_1.prisma.farmerOrganization.aggregate({
                where: {
                    organizationId,
                    qualityRating: { not: null },
                },
                _avg: {
                    qualityRating: true,
                },
            }),
        ]);
        return {
            totalFarmers,
            activeFarmers,
            farmersWithDeliveries,
            farmersWithAdvances,
            averageQualityRating: avgQualityRating._avg.qualityRating
                ? Number(avgQualityRating._avg.qualityRating.toFixed(2))
                : null,
        };
    }
    async searchFarmersForLorry(organizationId, userId, searchTerm, limit = 10) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = {
            organizations: {
                some: {
                    organizationId: organizationId,
                    status: 'ACTIVE',
                },
            },
        };
        if (searchTerm) {
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { phone: { contains: searchTerm, mode: 'insensitive' } },
                { idNumber: { contains: searchTerm, mode: 'insensitive' } },
            ];
        }
        const farmers = await database_1.prisma.farmer.findMany({
            where,
            select: {
                id: true,
                name: true,
                phone: true,
                address: true,
                organizations: {
                    where: { organizationId },
                    select: {
                        qualityRating: true,
                        totalDeliveries: true,
                    },
                },
            },
            orderBy: [
                { name: 'asc' },
            ],
            take: limit,
        });
        return farmers;
    }
}
exports.FarmerService = FarmerService;
//# sourceMappingURL=farmer.service.js.map