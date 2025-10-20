"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancePaymentService = exports.AdvancePaymentService = void 0;
const prisma_1 = require("../lib/prisma");
class AdvancePaymentService {
    async createAdvancePayment(data, userId, organizationId) {
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                id: data.farmerId,
                organizationId: organizationId,
                isActive: true
            }
        });
        if (!farmer) {
            throw new Error('Farmer not found in your organization');
        }
        if (data.amount <= 0) {
            throw new Error('Advance amount must be greater than 0');
        }
        const advancePayment = await prisma_1.prisma.advancePayment.create({
            data: {
                farmerId: data.farmerId,
                organizationId: organizationId,
                processedById: userId,
                amount: data.amount,
                interestRate: 0,
                status: 'COMPLETED',
                reference: data.reference,
                notes: data.notes,
                paidAt: data.paymentDate,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                },
                processedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return advancePayment;
    }
    async getFarmerAdvancePayments(farmerId, organizationId) {
        const payments = await prisma_1.prisma.advancePayment.findMany({
            where: {
                farmerId: farmerId,
                organizationId: organizationId
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                },
                processedBy: {
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
        return payments;
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
        return result._sum.amount || 0;
    }
    async getAdvancePaymentSummary(organizationId) {
        const [totalResult, farmerCount, recentPayments] = await Promise.all([
            prisma_1.prisma.advancePayment.aggregate({
                where: {
                    organizationId: organizationId,
                    status: 'COMPLETED'
                },
                _sum: {
                    amount: true
                }
            }),
            prisma_1.prisma.advancePayment.groupBy({
                by: ['farmerId'],
                where: {
                    organizationId: organizationId,
                    status: 'COMPLETED'
                }
            }),
            prisma_1.prisma.advancePayment.findMany({
                where: {
                    organizationId: organizationId
                },
                include: {
                    farmer: {
                        select: {
                            id: true,
                            name: true,
                            phone: true
                        }
                    },
                    processedBy: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);
        return {
            totalAdvances: totalResult._sum.amount || 0,
            totalFarmers: farmerCount.length,
            recentPayments: recentPayments
        };
    }
    async updateAdvancePayment(paymentId, data, organizationId) {
        const payment = await prisma_1.prisma.advancePayment.findFirst({
            where: {
                id: paymentId,
                organizationId: organizationId
            }
        });
        if (!payment) {
            throw new Error('Advance payment not found');
        }
        const updatedPayment = await prisma_1.prisma.advancePayment.update({
            where: { id: paymentId },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                farmer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true
                    }
                },
                processedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return updatedPayment;
    }
    async deleteAdvancePayment(paymentId, organizationId) {
        const payment = await prisma_1.prisma.advancePayment.findFirst({
            where: {
                id: paymentId,
                organizationId: organizationId
            }
        });
        if (!payment) {
            throw new Error('Advance payment not found');
        }
        await prisma_1.prisma.advancePayment.delete({
            where: { id: paymentId }
        });
    }
}
exports.AdvancePaymentService = AdvancePaymentService;
exports.advancePaymentService = new AdvancePaymentService();
//# sourceMappingURL=advance-payment.service.simple.js.map