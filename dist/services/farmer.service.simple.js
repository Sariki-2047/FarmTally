"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.farmerService = exports.FarmerService = void 0;
const prisma_1 = require("../lib/prisma");
class FarmerService {
    async createFarmer(data, organizationId) {
        const existingFarmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                phone: data.phone,
                organizationId: organizationId
            }
        });
        if (existingFarmer) {
            throw new Error('Farmer with this phone number already exists');
        }
        const farmer = await prisma_1.prisma.farmer.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                name: `${data.firstName} ${data.lastName}`,
                phone: data.phone,
                address: data.address,
                bankAccount: data.bankAccount,
                idNumber: data.idNumber,
                organizationId: organizationId,
                isActive: true
            }
        });
        await prisma_1.prisma.farmerOrganization.create({
            data: {
                farmerId: farmer.id,
                organizationId: organizationId,
                isActive: true
            }
        });
        return farmer;
    }
    async getFarmers(organizationId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [farmers, total] = await Promise.all([
            prisma_1.prisma.farmer.findMany({
                where: {
                    organizationId: organizationId,
                    isActive: true
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.farmer.count({
                where: {
                    organizationId: organizationId,
                    isActive: true
                }
            })
        ]);
        return {
            farmers,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }
    async getFarmerById(id, organizationId) {
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                id,
                organizationId: organizationId,
                isActive: true
            }
        });
        if (!farmer) {
            throw new Error('Farmer not found');
        }
        return farmer;
    }
    async updateFarmer(id, data, organizationId) {
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                id,
                organizationId: organizationId,
                isActive: true
            }
        });
        if (!farmer) {
            throw new Error('Farmer not found');
        }
        const updatedFarmer = await prisma_1.prisma.farmer.update({
            where: { id },
            data: {
                ...data,
                name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : farmer.name,
                updatedAt: new Date()
            }
        });
        return updatedFarmer;
    }
    async deleteFarmer(id, organizationId) {
        const farmer = await prisma_1.prisma.farmer.findFirst({
            where: {
                id,
                organizationId: organizationId
            }
        });
        if (!farmer) {
            throw new Error('Farmer not found');
        }
        await prisma_1.prisma.farmer.update({
            where: { id },
            data: { isActive: false }
        });
        await prisma_1.prisma.farmerOrganization.updateMany({
            where: {
                farmerId: id,
                organizationId: organizationId
            },
            data: { isActive: false }
        });
    }
    async searchFarmers(query, organizationId) {
        return prisma_1.prisma.farmer.findMany({
            where: {
                organizationId: organizationId,
                isActive: true,
                OR: [
                    { firstName: { contains: query, mode: 'insensitive' } },
                    { lastName: { contains: query, mode: 'insensitive' } },
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } }
                ]
            },
            take: 10,
            orderBy: { name: 'asc' }
        });
    }
}
exports.FarmerService = FarmerService;
exports.farmerService = new FarmerService();
//# sourceMappingURL=farmer.service.simple.js.map