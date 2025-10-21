"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lorryService = exports.LorryService = void 0;
const prisma_1 = require("../lib/prisma");
class LorryService {
    async createLorry(data, organizationId) {
        const existingLorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                OR: [
                    { plateNumber: data.plateNumber.toUpperCase() },
                    { licensePlate: data.plateNumber.toUpperCase() }
                ]
            }
        });
        if (existingLorry) {
            throw new Error('Lorry with this plate number already exists');
        }
        const lorry = await prisma_1.prisma.lorry.create({
            data: {
                plateNumber: data.plateNumber.toUpperCase(),
                licensePlate: data.plateNumber.toUpperCase(),
                capacity: data.capacity,
                status: 'AVAILABLE',
                assignedToId: data.assignedManagerId || null,
                assignedManagerId: data.assignedManagerId || null,
                organizationId: organizationId
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return {
            ...lorry,
            assignedManager: lorry.assignedTo
        };
    }
    async getLorries(organizationId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [lorries, total] = await Promise.all([
            prisma_1.prisma.lorry.findMany({
                where: { organizationId: organizationId },
                include: {
                    assignedTo: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.lorry.count({
                where: { organizationId: organizationId }
            })
        ]);
        const formattedLorries = lorries.map(lorry => ({
            ...lorry,
            assignedManager: lorry.assignedTo
        }));
        return {
            lorries: formattedLorries,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getLorryById(id, organizationId) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id,
                organizationId: organizationId
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found');
        }
        return {
            ...lorry,
            assignedManager: lorry.assignedTo
        };
    }
    async updateLorry(id, data, organizationId) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id,
                organizationId: organizationId
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found');
        }
        const updatedLorry = await prisma_1.prisma.lorry.update({
            where: { id },
            data: {
                ...data,
                plateNumber: data.plateNumber ? data.plateNumber.toUpperCase() : undefined,
                licensePlate: data.plateNumber ? data.plateNumber.toUpperCase() : undefined,
                assignedToId: data.assignedManagerId,
                assignedManagerId: data.assignedManagerId,
                updatedAt: new Date()
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return {
            ...updatedLorry,
            assignedManager: updatedLorry.assignedTo
        };
    }
    async deleteLorry(id, organizationId) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id,
                organizationId: organizationId
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found');
        }
        const activeDeliveries = await prisma_1.prisma.delivery.count({
            where: {
                lorryId: id,
                status: { in: ['PENDING', 'IN_PROGRESS'] }
            }
        });
        if (activeDeliveries > 0) {
            throw new Error('Cannot delete lorry with active deliveries');
        }
        await prisma_1.prisma.lorry.delete({
            where: { id }
        });
    }
    async updateLorryStatus(id, status, organizationId) {
        const lorry = await prisma_1.prisma.lorry.findFirst({
            where: {
                id,
                organizationId: organizationId
            }
        });
        if (!lorry) {
            throw new Error('Lorry not found');
        }
        const updateData = {
            status: status,
            updatedAt: new Date()
        };
        if (status === 'SENT_TO_DEALER') {
            updateData.sentToDealerAt = new Date();
        }
        if (status === 'AVAILABLE' && lorry.status === 'SENT_TO_DEALER') {
            updateData.assignedManagerId = null;
            updateData.assignedAt = null;
        }
        const updatedLorry = await prisma_1.prisma.lorry.update({
            where: { id },
            data: updateData,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        return {
            ...updatedLorry,
            assignedManager: updatedLorry.assignedTo
        };
    }
}
exports.LorryService = LorryService;
exports.lorryService = new LorryService();
//# sourceMappingURL=lorry.service.simple.js.map