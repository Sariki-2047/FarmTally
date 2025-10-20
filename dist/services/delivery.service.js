"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const database_1 = require("../config/database");
const error_middleware_1 = require("../middleware/error.middleware");
class DeliveryService {
    async addFarmerToLorry(lorryId, farmerId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FIELD_MANAGER') {
            throw new error_middleware_1.ForbiddenError('Only field managers can add farmers to lorries');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            select: {
                organizationId: true,
                assignedManagerId: true,
                status: true,
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (lorry.organizationId !== user.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (lorry.assignedManagerId !== userId) {
            throw new error_middleware_1.ForbiddenError('This lorry is not assigned to you');
        }
        if (lorry.status !== 'ASSIGNED') {
            throw new error_middleware_1.BadRequestError('Lorry must be in ASSIGNED status to add farmers');
        }
        const farmer = await database_1.prisma.farmer.findFirst({
            where: {
                id: farmerId,
                organizations: {
                    some: {
                        organizationId: user.organizationId,
                        status: 'ACTIVE',
                    },
                },
            },
        });
        if (!farmer) {
            throw new error_middleware_1.NotFoundError('Farmer not found in your organization');
        }
        const existingDelivery = await database_1.prisma.delivery.findFirst({
            where: {
                lorryId: lorryId,
                farmerId: farmerId,
                status: {
                    in: ['PENDING', 'IN_PROGRESS'],
                },
            },
        });
        if (existingDelivery) {
            throw new error_middleware_1.BadRequestError('Farmer is already added to this lorry');
        }
        if (data.individualWeights.length !== data.bagsCount) {
            throw new error_middleware_1.BadRequestError('Number of individual weights must match bags count');
        }
        const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
        const advanceBalance = await this.getFarmerAdvanceBalance(farmerId, user.organizationId);
        const delivery = await database_1.prisma.delivery.create({
            data: {
                organizationId: user.organizationId,
                lorryId: lorryId,
                farmerId: farmerId,
                managerId: userId,
                deliveryDate: data.deliveryDate,
                bagsCount: data.bagsCount,
                individualWeights: data.individualWeights,
                grossWeight: grossWeight,
                moistureContent: data.moistureContent,
                standardDeduction: 0,
                qualityDeduction: 0,
                qualityDeductionReason: null,
                netWeight: grossWeight,
                pricePerKg: 0,
                totalValue: 0,
                advanceAmount: advanceBalance,
                interestCharges: 0,
                finalAmount: 0,
                status: 'PENDING',
                photos: data.photos || [],
                notes: data.notes,
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true,
                    },
                },
                lorry: {
                    select: {
                        id: true,
                        name: true,
                        licensePlate: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return delivery;
    }
    async getLorryDeliveries(lorryId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user) {
            throw new error_middleware_1.NotFoundError('User not found');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            select: {
                organizationId: true,
                assignedManagerId: true,
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (lorry.organizationId !== user.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        const deliveries = await database_1.prisma.delivery.findMany({
            where: { lorryId: lorryId },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return deliveries;
    }
    async updateDelivery(deliveryId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FIELD_MANAGER') {
            throw new error_middleware_1.ForbiddenError('Only field managers can update deliveries');
        }
        const delivery = await database_1.prisma.delivery.findUnique({
            where: { id: deliveryId },
            select: {
                organizationId: true,
                managerId: true,
                status: true,
                lorryId: true,
            },
        });
        if (!delivery) {
            throw new error_middleware_1.NotFoundError('Delivery not found');
        }
        if (delivery.organizationId !== user.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this delivery');
        }
        if (delivery.managerId !== userId) {
            throw new error_middleware_1.ForbiddenError('You can only update your own deliveries');
        }
        if (delivery.status !== 'PENDING') {
            throw new error_middleware_1.BadRequestError('Can only update pending deliveries');
        }
        if (data.individualWeights && data.bagsCount) {
            if (data.individualWeights.length !== data.bagsCount) {
                throw new error_middleware_1.BadRequestError('Number of individual weights must match bags count');
            }
        }
        let updateData = { ...data };
        if (data.individualWeights) {
            const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
            updateData.grossWeight = grossWeight;
        }
        const updatedDelivery = await database_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData,
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true,
                    },
                },
                lorry: {
                    select: {
                        id: true,
                        name: true,
                        licensePlate: true,
                    },
                },
            },
        });
        return updatedDelivery;
    }
    async submitLorryToAdmin(lorryId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FIELD_MANAGER') {
            throw new error_middleware_1.ForbiddenError('Only field managers can submit lorries');
        }
        const lorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            select: {
                organizationId: true,
                assignedManagerId: true,
                status: true,
            },
        });
        if (!lorry) {
            throw new error_middleware_1.NotFoundError('Lorry not found');
        }
        if (lorry.organizationId !== user.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this lorry');
        }
        if (lorry.assignedManagerId !== userId) {
            throw new error_middleware_1.ForbiddenError('This lorry is not assigned to you');
        }
        const deliveryCount = await database_1.prisma.delivery.count({
            where: {
                lorryId: lorryId,
                status: 'PENDING',
            },
        });
        if (deliveryCount === 0) {
            throw new error_middleware_1.BadRequestError('Cannot submit lorry without any deliveries');
        }
        await database_1.prisma.delivery.updateMany({
            where: {
                lorryId: lorryId,
                status: 'PENDING',
            },
            data: {
                status: 'IN_PROGRESS',
            },
        });
        await database_1.prisma.lorry.update({
            where: { id: lorryId },
            data: {
                status: 'IN_TRANSIT',
            },
        });
        const updatedLorry = await database_1.prisma.lorry.findUnique({
            where: { id: lorryId },
            include: {
                assignedManager: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
                deliveries: {
                    where: { status: 'IN_PROGRESS' },
                    include: {
                        farmer: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                            },
                        },
                    },
                },
            },
        });
        return updatedLorry;
    }
    async createAdvancePayment(organizationId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
            throw new error_middleware_1.ForbiddenError('Only farm admins and field managers can create advance payments');
        }
        const farmer = await database_1.prisma.farmer.findFirst({
            where: {
                id: data.farmerId,
                organizations: {
                    some: {
                        organizationId: organizationId,
                        status: 'ACTIVE',
                    },
                },
            },
        });
        if (!farmer) {
            throw new error_middleware_1.NotFoundError('Farmer not found in your organization');
        }
        const advancePayment = await database_1.prisma.advancePayment.create({
            data: {
                organizationId: organizationId,
                farmerId: data.farmerId,
                amount: data.amount,
                paymentMethod: data.paymentMethod,
                paymentDate: data.paymentDate,
                referenceNumber: data.referenceNumber,
                reason: data.reason,
                notes: data.notes,
                receiptPhoto: data.receiptPhoto,
                recordedBy: userId,
                status: 'ACTIVE',
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                recorder: {
                    select: {
                        id: true,
                        email: true,
                        profile: true,
                    },
                },
            },
        });
        return advancePayment;
    }
    async getFarmerAdvanceBalance(farmerId, organizationId) {
        const result = await database_1.prisma.advancePayment.aggregate({
            where: {
                farmerId: farmerId,
                organizationId: organizationId,
                status: 'ACTIVE',
            },
            _sum: {
                amount: true,
            },
        });
        return Number(result._sum.amount || 0);
    }
    async setQualityDeduction(deliveryId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can set quality deductions');
        }
        const delivery = await database_1.prisma.delivery.findUnique({
            where: { id: deliveryId },
            select: {
                organizationId: true,
                bagsCount: true,
                grossWeight: true,
                status: true,
            },
        });
        if (!delivery) {
            throw new error_middleware_1.NotFoundError('Delivery not found');
        }
        if (delivery.organizationId !== user.organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this delivery');
        }
        if (!['PENDING', 'IN_PROGRESS'].includes(delivery.status)) {
            throw new error_middleware_1.BadRequestError('Can only set quality deduction for pending or in-progress deliveries');
        }
        const standardDeduction = delivery.bagsCount * 2;
        const netWeight = Math.max(0, Number(delivery.grossWeight) - standardDeduction - data.qualityDeductionKgs);
        const updatedDelivery = await database_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                qualityDeduction: data.qualityDeductionKgs,
                qualityDeductionReason: data.qualityDeductionReason,
                standardDeduction: standardDeduction,
                netWeight: netWeight,
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
            },
        });
        return updatedDelivery;
    }
    async setPricing(organizationId, userId, data) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can set pricing');
        }
        if (user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        switch (data.pricingType) {
            case 'UNIVERSAL':
                await database_1.prisma.organization.update({
                    where: { id: organizationId },
                    data: {
                        settings: {
                            universalPricePerKg: data.pricePerKg,
                            updatedAt: new Date().toISOString(),
                        },
                    },
                });
                break;
            case 'LORRY':
                if (!data.lorryId) {
                    throw new error_middleware_1.BadRequestError('Lorry ID is required for lorry-specific pricing');
                }
                const lorry = await database_1.prisma.lorry.findUnique({
                    where: { id: data.lorryId },
                    select: { organizationId: true },
                });
                if (!lorry || lorry.organizationId !== organizationId) {
                    throw new error_middleware_1.NotFoundError('Lorry not found in your organization');
                }
                await database_1.prisma.delivery.updateMany({
                    where: {
                        lorryId: data.lorryId,
                        organizationId: organizationId,
                        status: { in: ['PENDING', 'IN_PROGRESS'] },
                    },
                    data: {
                        pricePerKg: data.pricePerKg,
                    },
                });
                break;
            case 'FARMER':
                if (!data.farmerId) {
                    throw new error_middleware_1.BadRequestError('Farmer ID is required for farmer-specific pricing');
                }
                const farmer = await database_1.prisma.farmer.findFirst({
                    where: {
                        id: data.farmerId,
                        organizations: {
                            some: {
                                organizationId: organizationId,
                            },
                        },
                    },
                });
                if (!farmer) {
                    throw new error_middleware_1.NotFoundError('Farmer not found in your organization');
                }
                await database_1.prisma.delivery.updateMany({
                    where: {
                        farmerId: data.farmerId,
                        organizationId: organizationId,
                        status: { in: ['PENDING', 'IN_PROGRESS'] },
                    },
                    data: {
                        pricePerKg: data.pricePerKg,
                    },
                });
                break;
            default:
                throw new error_middleware_1.BadRequestError('Invalid pricing type');
        }
        await this.recalculateDeliveryTotals(organizationId, data);
    }
    async recalculateDeliveryTotals(organizationId, pricingData) {
        let whereClause = {
            organizationId: organizationId,
            status: { in: ['PENDING', 'IN_PROGRESS'] },
            pricePerKg: { gt: 0 },
        };
        if (pricingData.pricingType === 'LORRY' && pricingData.lorryId) {
            whereClause.lorryId = pricingData.lorryId;
        }
        else if (pricingData.pricingType === 'FARMER' && pricingData.farmerId) {
            whereClause.farmerId = pricingData.farmerId;
        }
        const deliveries = await database_1.prisma.delivery.findMany({
            where: whereClause,
            select: {
                id: true,
                netWeight: true,
                pricePerKg: true,
                advanceAmount: true,
                interestCharges: true,
            },
        });
        for (const delivery of deliveries) {
            const totalValue = Number(delivery.netWeight) * Number(delivery.pricePerKg);
            const finalAmount = Math.max(0, totalValue - Number(delivery.advanceAmount) - Number(delivery.interestCharges));
            await database_1.prisma.delivery.update({
                where: { id: delivery.id },
                data: {
                    totalValue: totalValue,
                    finalAmount: finalAmount,
                },
            });
        }
    }
    async processDeliveries(lorryId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.role !== 'FARM_ADMIN') {
            throw new error_middleware_1.ForbiddenError('Only farm admins can process deliveries');
        }
        const organization = await database_1.prisma.organization.findUnique({
            where: { id: user.organizationId },
            select: { settings: true },
        });
        const pricePerKg = organization?.settings?.universalPricePerKg || organization?.settings?.pricePerKg || 0;
        if (pricePerKg <= 0) {
            throw new error_middleware_1.BadRequestError('Please set price per KG first');
        }
        const deliveries = await database_1.prisma.delivery.findMany({
            where: {
                lorryId: lorryId,
                organizationId: user.organizationId,
                status: 'IN_PROGRESS',
            },
            select: {
                id: true,
                farmerId: true,
                bagsCount: true,
                grossWeight: true,
                qualityDeduction: true,
                advanceAmount: true,
                interestCharges: true,
            },
        });
        if (deliveries.length === 0) {
            throw new error_middleware_1.BadRequestError('No deliveries to process for this lorry');
        }
        const processedDeliveries = [];
        for (const delivery of deliveries) {
            const standardDeduction = delivery.bagsCount * 2;
            const netWeight = Math.max(0, Number(delivery.grossWeight) - standardDeduction - Number(delivery.qualityDeduction));
            const totalValue = netWeight * pricePerKg;
            const finalAmount = Math.max(0, totalValue - Number(delivery.advanceAmount) - Number(delivery.interestCharges));
            const updatedDelivery = await database_1.prisma.delivery.update({
                where: { id: delivery.id },
                data: {
                    standardDeduction: standardDeduction,
                    netWeight: netWeight,
                    pricePerKg: pricePerKg,
                    totalValue: totalValue,
                    finalAmount: finalAmount,
                    status: 'COMPLETED',
                },
                include: {
                    farmer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            address: true,
                        },
                    },
                },
            });
            processedDeliveries.push(updatedDelivery);
            await database_1.prisma.farmerOrganization.update({
                where: {
                    farmerId_organizationId: {
                        farmerId: delivery.farmerId,
                        organizationId: user.organizationId,
                    },
                },
                data: {
                    totalDeliveries: {
                        increment: 1,
                    },
                    totalEarnings: {
                        increment: finalAmount,
                    },
                },
            });
        }
        await database_1.prisma.lorry.update({
            where: { id: lorryId },
            data: {
                status: 'AVAILABLE',
                assignedManagerId: null,
                assignedAt: null,
            },
        });
        return processedDeliveries;
    }
    async getDeliveries(organizationId, userId, filters = {}, page = 1, limit = 20) {
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
        if (filters.lorryId) {
            where.lorryId = filters.lorryId;
        }
        if (filters.farmerId) {
            where.farmerId = filters.farmerId;
        }
        if (filters.startDate || filters.endDate) {
            where.deliveryDate = {};
            if (filters.startDate) {
                where.deliveryDate.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.deliveryDate.lte = filters.endDate;
            }
        }
        if (user.role === 'FIELD_MANAGER') {
            where.managerId = userId;
        }
        const [deliveries, total] = await Promise.all([
            database_1.prisma.delivery.findMany({
                where,
                include: {
                    farmer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            address: true,
                        },
                    },
                    lorry: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true,
                        },
                    },
                    manager: {
                        select: {
                            id: true,
                            email: true,
                            profile: true,
                        },
                    },
                },
                orderBy: { deliveryDate: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.prisma.delivery.count({ where }),
        ]);
        return {
            deliveries,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getDeliveryStats(organizationId, userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, organizationId: true },
        });
        if (!user || user.organizationId !== organizationId) {
            throw new error_middleware_1.ForbiddenError('Access denied to this organization');
        }
        const where = { organizationId };
        if (user.role === 'FIELD_MANAGER') {
            where.managerId = userId;
        }
        const [totalDeliveries, pendingDeliveries, inProgressDeliveries, completedDeliveries, totalGrossWeight, totalNetWeight, totalValue,] = await Promise.all([
            database_1.prisma.delivery.count({ where }),
            database_1.prisma.delivery.count({ where: { ...where, status: 'PENDING' } }),
            database_1.prisma.delivery.count({ where: { ...where, status: 'IN_PROGRESS' } }),
            database_1.prisma.delivery.count({ where: { ...where, status: 'COMPLETED' } }),
            database_1.prisma.delivery.aggregate({
                where,
                _sum: { grossWeight: true },
            }),
            database_1.prisma.delivery.aggregate({
                where,
                _sum: { netWeight: true },
            }),
            database_1.prisma.delivery.aggregate({
                where: { ...where, status: 'COMPLETED' },
                _sum: { totalValue: true },
            }),
        ]);
        return {
            totalDeliveries,
            pendingDeliveries,
            inProgressDeliveries,
            completedDeliveries,
            totalGrossWeight: totalGrossWeight._sum.grossWeight || 0,
            totalNetWeight: totalNetWeight._sum.netWeight || 0,
            totalValue: totalValue._sum.totalValue || 0,
            averageWeightPerDelivery: totalDeliveries > 0
                ? ((Number(totalGrossWeight._sum.grossWeight) || 0) / totalDeliveries).toFixed(2)
                : 0,
        };
    }
}
exports.DeliveryService = DeliveryService;
//# sourceMappingURL=delivery.service.js.map