import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError, ConflictError } from '../middleware/error.middleware';
import { Farmer } from '@prisma/client';

export interface CreateFarmerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  idNumber?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branchCode?: string;
  };
}

export interface UpdateFarmerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  idNumber?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branchCode?: string;
  };
}

export interface FarmerFilters {
  search?: string;
  status?: string;
}

export class FarmerService {
  async createFarmer(
    organizationId: string,
    createdBy: string,
    data: CreateFarmerData
  ): Promise<any> {
    // Verify user belongs to this organization and can create farmers
    const user = await prisma.user.findUnique({
      where: { id: createdBy },
      select: { role: true, organizationId: true, status: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
      throw new ForbiddenError('Only farm admins and field managers can create farmers');
    }

    if (user.status !== 'APPROVED') {
      throw new BadRequestError('Unapproved users cannot create farmers');
    }

    // Check if farmer with same phone already exists in this organization
    const existingFarmer = await prisma.farmer.findFirst({
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
      throw new ConflictError('A farmer with this phone number already exists in your organization');
    }

    // Check if farmer exists globally (by phone)
    const globalFarmer = await prisma.farmer.findFirst({
      where: { phone: data.phone },
    });

    let farmer;

    if (globalFarmer) {
      // Farmer exists globally, just add to this organization
      farmer = globalFarmer;
      
      // Check if already in this organization
      const existingRelation = await prisma.farmerOrganization.findUnique({
        where: {
          farmerId_organizationId: {
            farmerId: farmer.id,
            organizationId: organizationId,
          },
        },
      });

      if (existingRelation) {
        throw new ConflictError('This farmer is already part of your organization');
      }

      // Add farmer to organization
      await prisma.farmerOrganization.create({
        data: {
          farmerId: farmer.id,
          organizationId: organizationId,
          status: 'ACTIVE',
          qualityRating: null,
          totalDeliveries: 0,
          totalEarnings: 0,
        },
      });
    } else {
      // Create new farmer
      farmer = await prisma.farmer.create({
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

      // Add to organization
      await prisma.farmerOrganization.create({
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

    // Return farmer with organization details
    const farmerWithOrg = await prisma.farmer.findUnique({
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

  async getFarmers(
    organizationId: string,
    userId: string,
    filters: FarmerFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ farmers: any[]; total: number; page: number; totalPages: number }> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = {
      organizations: {
        some: {
          organizationId: organizationId,
        },
      },
    };

    // Apply search filter
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { idNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [farmers, total] = await Promise.all([
      prisma.farmer.findMany({
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
      prisma.farmer.count({ where }),
    ]);

    return {
      farmers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getFarmerById(farmerId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        organizations: {
          where: { organizationId: user.organizationId! },
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
          where: { organizationId: user.organizationId! },
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
          where: { organizationId: user.organizationId! },
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
      throw new NotFoundError('Farmer not found');
    }

    // Check if farmer belongs to user's organization
    if (farmer.organizations.length === 0) {
      throw new ForbiddenError('Farmer not found in your organization');
    }

    return farmer;
  }

  async updateFarmer(farmerId: string, userId: string, data: UpdateFarmerData): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
      throw new ForbiddenError('Only farm admins and field managers can update farmers');
    }

    // Verify farmer exists and belongs to user's organization
    const farmer = await prisma.farmer.findFirst({
      where: {
        id: farmerId,
        organizations: {
          some: {
            organizationId: user.organizationId!,
          },
        },
      },
    });

    if (!farmer) {
      throw new NotFoundError('Farmer not found in your organization');
    }

    // If updating phone, check for conflicts
    if (data.phone && data.phone !== farmer.phone) {
      const existingFarmer = await prisma.farmer.findFirst({
        where: {
          phone: data.phone,
          id: { not: farmerId },
          organizations: {
            some: {
              organizationId: user.organizationId!,
            },
          },
        },
      });

      if (existingFarmer) {
        throw new ConflictError('A farmer with this phone number already exists in your organization');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email?.toLowerCase();
    if (data.address !== undefined) updateData.address = data.address;
    if (data.idNumber !== undefined) updateData.idNumber = data.idNumber;
    if (data.bankDetails !== undefined) updateData.bankDetails = data.bankDetails;

    // Update farmer
    const updatedFarmer = await prisma.farmer.update({
      where: { id: farmerId },
      data: updateData,
      include: {
        organizations: {
          where: { organizationId: user.organizationId! },
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

  async removeFarmerFromOrganization(farmerId: string, userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can remove farmers from organization');
    }

    // Check if farmer has any deliveries or advance payments
    const [deliveryCount, advanceCount] = await Promise.all([
      prisma.delivery.count({
        where: {
          farmerId: farmerId,
          organizationId: user.organizationId!,
        },
      }),
      prisma.advancePayment.count({
        where: {
          farmerId: farmerId,
          organizationId: user.organizationId!,
          status: 'ACTIVE',
        },
      }),
    ]);

    if (deliveryCount > 0 || advanceCount > 0) {
      throw new BadRequestError('Cannot remove farmer with existing deliveries or active advance payments');
    }

    // Remove farmer from organization
    await prisma.farmerOrganization.delete({
      where: {
        farmerId_organizationId: {
          farmerId: farmerId,
          organizationId: user.organizationId!,
        },
      },
    });
  }

  async getFarmerStats(organizationId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const [
      totalFarmers,
      activeFarmers,
      farmersWithDeliveries,
      farmersWithAdvances,
      avgQualityRating,
    ] = await Promise.all([
      prisma.farmerOrganization.count({
        where: { organizationId },
      }),
      prisma.farmerOrganization.count({
        where: { organizationId, status: 'ACTIVE' },
      }),
      prisma.farmerOrganization.count({
        where: {
          organizationId,
          totalDeliveries: { gt: 0 },
        },
      }),
      prisma.advancePayment.count({
        where: {
          organizationId,
          status: 'ACTIVE',
        },
      }),
      prisma.farmerOrganization.aggregate({
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

  async searchFarmersForLorry(
    organizationId: string,
    userId: string,
    searchTerm?: string,
    limit: number = 10
  ): Promise<any[]> {
    // Verify user belongs to this organization
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = {
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

    const farmers = await prisma.farmer.findMany({
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