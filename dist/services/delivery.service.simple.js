"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryService = exports.DeliveryService = void 0;
const prisma_1 = require("../lib/prisma");
class DeliveryService {
    async addFarmerToLorry(lorryId, farmerId, userId, organizationId, data) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id: lorryId,
                organizationId: organizationId
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found');
        }
        if (lorry.status === 'SENT_TO_DEALER') {
            throw new Error('Cannot add farmers to lorry that has been sent to dealer');
        }
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                id: farmerId,
                organizationId: organizationId,
                isActive: true
            }
        });
        if (!farmer) {
            throw new Error('Farmer not found in your organization');
        }
        const existingDelivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                lorryId: lorryId,
                farmerId: farmerId,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });
        if (existingDelivery) {
            throw new Error('Farmer is already added to this lorry');
        }
        if (data.individualWeights.length !== data.bagsCount) {
            throw new Error('Number of individual weights must match bags count');
        }
        if (data.bagsCount <= 0) {
            throw new Error('Bags count must be greater than 0');
        }
        if (data.moistureContent < 0 || data.moistureContent > 100) {
            throw new Error('Moisture content must be between 0 and 100');
        }
        const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
        const standardDeduction = this.calculateStandardDeduction(data.bagsCount, data.moistureContent);
        const qualityDeduction = 0;
        const netWeight = grossWeight - standardDeduction - qualityDeduction;
        const advanceBalance = await this.getFarmerAdvanceBalance(farmerId, organizationId);
        const delivery = await prisma_1.prisma.delivery.create({
            data: {
                organizationId: organizationId,
                lorryId: lorryId,
                farmerId: farmerId,
                fieldManagerId: userId,
                bagsCount: data.bagsCount,
                individualWeights: data.individualWeights,
                grossWeight: grossWeight,
                moistureContent: data.moistureContent,
                qualityGrade: data.qualityGrade || 'A',
                standardDeduction: standardDeduction,
                qualityDeduction: qualityDeduction,
                netWeight: netWeight,
                advanceAmount: advanceBalance,
                interestCharges: 0,
                status: 'PENDING',
                deliveryDate: data.deliveryDate,
                deliveredAt: data.deliveryDate,
                photos: data.photos || [],
                notes: data.notes
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        const deliveryCount = await prisma_1.prisma.delivery.count({
            where: { lorryId: lorryId }
        });
        if (deliveryCount === 1) {
            await prisma_1.prisma.lorry.update({
                where: { id: lorryId },
                data: { status: 'LOADING' }
            });
        }
        return delivery;
    }
    async getLorryDeliveries(lorryId, organizationId) {
        const deliveries = await prisma_1.prisma.delivery.findMany({
            where: {
                lorryId: lorryId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return deliveries;
    }
    async updateDelivery(deliveryId, data, userId, organizationId) {
        const delivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId,
                fieldManagerId: userId
            }
        });
        if (!delivery) {
            throw new Error('Delivery not found or access denied');
        }
        if (delivery.status !== 'PENDING') {
            throw new Error('Can only update pending deliveries');
        }
        let updateData = { ...data };
        if (data.individualWeights && data.bagsCount) {
            if (data.individualWeights.length !== data.bagsCount) {
                throw new Error('Number of individual weights must match bags count');
            }
            const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
            const moistureValue = data.moistureContent || Number(delivery.moistureContent || 0);
            const standardDeduction = this.calculateStandardDeduction(data.bagsCount, moistureValue);
            const qualityDeduction = Number(delivery.qualityDeduction || 0);
            updateData = {
                ...updateData,
                grossWeight,
                standardDeduction,
                qualityDeduction,
                netWeight: grossWeight - standardDeduction - qualityDeduction
            };
        }
        const updatedDelivery = await prisma_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: updateData,
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedDelivery;
    }
    async setQualityDeduction(deliveryId, data, organizationId) {
        const delivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            }
        });
        if (!delivery) {
            throw new Error('Delivery not found');
        }
        if (data.qualityDeduction < 0) {
            throw new Error('Quality deduction cannot be negative');
        }
        if (data.qualityDeduction > Number(delivery.grossWeight)) {
            throw new Error('Quality deduction cannot exceed gross weight');
        }
        const netWeight = Number(delivery.grossWeight) - Number(delivery.standardDeduction || 0) - data.qualityDeduction;
        const updatedDelivery = await prisma_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                qualityDeduction: data.qualityDeduction,
                standardDeduction: data.standardDeduction,
                qualityGrade: data.qualityGrade,
                netWeight: netWeight,
                updatedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedDelivery;
    }
    async setPricing(deliveryId, data, organizationId) {
        const delivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            }
        });
        if (!delivery) {
            throw new Error('Delivery not found');
        }
        const currentAdvanceBalance = await this.getFarmerAdvanceBalance(delivery.farmerId, organizationId);
        const totalValue = Number(delivery.netWeight) * data.pricePerKg;
        const interestCharges = this.calculateInterestCharges(currentAdvanceBalance);
        const finalAmount = totalValue - currentAdvanceBalance - interestCharges;
        const updatedDelivery = await prisma_1.prisma.delivery.update({
            where: { id: deliveryId },
            data: {
                pricePerKg: data.pricePerKg,
                totalValue: totalValue,
                advanceAmount: currentAdvanceBalance,
                interestCharges: interestCharges,
                finalAmount: finalAmount,
                processedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedDelivery;
    }
    async submitLorry(lorryId, userId, organizationId) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id: lorryId,
                organizationId: organizationId,
                assignedManagerId: userId
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found or access denied');
        }
        const deliveryCount = await prisma_1.prisma.delivery.count({
            where: { lorryId: lorryId }
        });
        if (deliveryCount === 0) {
            throw new Error('Cannot submit lorry without deliveries');
        }
        await prisma_1.prisma.lorry.update({
            where: { id: lorryId },
            data: { status: 'SUBMITTED' }
        });
        await prisma_1.prisma.delivery.updateMany({
            where: { lorryId: lorryId },
            data: { status: 'IN_PROGRESS' }
        });
    }
    async markSentToDealer(lorryId, organizationId) {
        await prisma_1.prisma.lorry.update({
            where: {
                id: lorryId,
                organizationId: organizationId
            },
            data: { status: 'SENT_TO_DEALER' }
        });
        await prisma_1.prisma.delivery.updateMany({
            where: { lorryId: lorryId },
            data: { status: 'COMPLETED' }
        });
    }
    async getDeliveryById(deliveryId, organizationId) {
        const delivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        address: true
                    }
                },
                lorry: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true
                    }
                },
                fieldManager: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!delivery) {
            throw new Error('Delivery not found');
        }
        return delivery;
    }
    async deleteDelivery(deliveryId, userId, organizationId) {
        const delivery = await prisma_1.prisma.delivery.findFirst({
            where: {
                id: deliveryId,
                organizationId: organizationId,
                fieldManagerId: userId
            }
        });
        if (!delivery) {
            throw new Error('Delivery not found or access denied');
        }
        if (delivery.status !== 'PENDING') {
            throw new Error('Can only delete pending deliveries');
        }
        await prisma_1.prisma.delivery.delete({
            where: { id: deliveryId }
        });
        const remainingDeliveries = await prisma_1.prisma.delivery.count({
            where: { lorryId: delivery.lorryId }
        });
        if (remainingDeliveries === 0) {
            await prisma_1.prisma.lorry.update({
                where: { id: delivery.lorryId },
                data: { status: 'ASSIGNED' }
            });
        }
    }
    async getFarmerAdvanceBalance(farmerId, organizationId) {
        const result = await prisma_1.prisma.advancePayment.aggregate({
            where: {
                farmerId: farmerId,
                organizationId: organizationId,
                status: 'COMPLETED'
            },
            _sum: {
                amount: true
            }
        });
        return Number(result._sum?.amount || 0);
    }
    calculateStandardDeduction(bagsCount, moistureContent) {
        let deduction = bagsCount * 2.0;
        if (moistureContent > 14) {
            const excessMoisture = moistureContent - 14;
            deduction += bagsCount * (excessMoisture * 0.1);
        }
        return Math.round(deduction * 100) / 100;
    }
    calculateInterestCharges(advanceAmount) {
        const interestRate = 0.02;
        return Math.round(advanceAmount * interestRate * 100) / 100;
    }
}
exports.DeliveryService = DeliveryService;
exports.deliveryService = new DeliveryService();
//# sourceMappingURL=delivery.service.simple.js.map