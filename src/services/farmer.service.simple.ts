import { prisma } from '../lib/prisma';

export interface CreateFarmerData {
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  bankAccount?: string;
  idNumber?: string;
}

export interface FarmerResponse {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string;
  address: string | null;
  bankAccount: string | null;
  idNumber: string | null;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class FarmerService {
  async createFarmer(data: CreateFarmerData, organizationId: string): Promise<FarmerResponse> {
    // Check if farmer with this phone already exists in this organization
    const existingFarmer = await prisma.farmer.findFirst({
      where: { 
        phone: data.phone,
        organizationId: organizationId
      }
    });

    if (existingFarmer) {
      throw new Error('Farmer with this phone number already exists');
    }

    const farmer = await prisma.farmer.create({
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

    // Create farmer-organization relationship
    await prisma.farmerOrganization.create({
      data: {
        farmerId: farmer.id,
        organizationId: organizationId,
        isActive: true
      }
    });

    return farmer;
  }

  async getFarmers(organizationId: string, page = 1, limit = 20): Promise<{
    farmers: FarmerResponse[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [farmers, total] = await Promise.all([
      prisma.farmer.findMany({
        where: { 
          organizationId: organizationId,
          isActive: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.farmer.count({
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

  async getFarmerById(id: string, organizationId: string): Promise<FarmerResponse> {
    const farmer = await prisma.farmer.findFirst({
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

  async updateFarmer(id: string, data: Partial<CreateFarmerData>, organizationId: string): Promise<FarmerResponse> {
    const farmer = await prisma.farmer.findFirst({
      where: { 
        id,
        organizationId: organizationId,
        isActive: true
      }
    });

    if (!farmer) {
      throw new Error('Farmer not found');
    }

    const updatedFarmer = await prisma.farmer.update({
      where: { id },
      data: {
        ...data,
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : farmer.name,
        updatedAt: new Date()
      }
    });

    return updatedFarmer;
  }

  async deleteFarmer(id: string, organizationId: string): Promise<void> {
    const farmer = await prisma.farmer.findFirst({
      where: { 
        id,
        organizationId: organizationId
      }
    });

    if (!farmer) {
      throw new Error('Farmer not found');
    }

    // Soft delete
    await prisma.farmer.update({
      where: { id },
      data: { isActive: false }
    });

    // Deactivate farmer-organization relationship
    await prisma.farmerOrganization.updateMany({
      where: { 
        farmerId: id,
        organizationId: organizationId
      },
      data: { isActive: false }
    });
  }

  async searchFarmers(query: string, organizationId: string): Promise<FarmerResponse[]> {
    return prisma.farmer.findMany({
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

export const farmerService = new FarmerService();