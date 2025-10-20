import { prisma } from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';
import { DeliveryStatus } from '@prisma/client';
import EmailService from './emailService';

export interface CreateDeliveryData {
  lorryId: string;
  farmerId: string;
  deliveryDate: Date;
  bagsCount: number;
  individualWeights: number[];
  moistureContent: number;
  photos?: string[];
  notes?: string;
}

export interface UpdateDeliveryData {
  bagsCount?: number;
  individualWeights?: number[];
  moistureContent?: number;
  photos?: string[];
  notes?: string;
}

export interface SetQualityDeductionData {
  qualityDeductionKgs: number;
  qualityDeductionReason?: string;
}

export interface CreateAdvancePaymentData {
  farmerId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  referenceNumber?: string;
  reason?: string;
  notes?: string;
  receiptPhoto?: string;
}

export interface SetPricingData {
  pricePerKg: number;
  pricingType: 'UNIVERSAL' | 'LORRY' | 'FARMER';
  lorryId?: string;
  farmerId?: string;
}

export interface DeliveryFilters {
  status?: DeliveryStatus;
  lorryId?: string;
  farmerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class DeliveryService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }
  async addFarmerToLorry(
    lorryId: string,
    farmerId: string,
    userId: string,
    data: CreateDeliveryData
  ): Promise<any> {
    // Verify user is field manager and lorry is assigned to them
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FIELD_MANAGER') {
      throw new ForbiddenError('Only field managers can add farmers to lorries');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      select: {
        organizationId: true,
        assignedManagerId: true,
        status: true,
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (lorry.organizationId !== user.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    if (lorry.assignedManagerId !== userId) {
      throw new ForbiddenError('This lorry is not assigned to you');
    }

    if (lorry.status !== 'ASSIGNED') {
      throw new BadRequestError('Lorry must be in ASSIGNED status to add farmers');
    }

    // Verify farmer belongs to the organization
    const farmer = await prisma.farmer.findFirst({
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
      throw new NotFoundError('Farmer not found in your organization');
    }

    // Check if farmer is already added to this lorry
    const existingDelivery = await prisma.delivery.findFirst({
      where: {
        lorryId: lorryId,
        farmerId: farmerId,
        status: {
          in: ['PENDING', 'IN_PROGRESS'],
        },
      },
    });

    if (existingDelivery) {
      throw new BadRequestError('Farmer is already added to this lorry');
    }

    // Validate individual weights match bags count
    if (data.individualWeights.length !== data.bagsCount) {
      throw new BadRequestError('Number of individual weights must match bags count');
    }

    // Calculate gross weight
    const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);

    // Get current advance balance for this farmer
    const advanceBalance = await this.getFarmerAdvanceBalance(farmerId, user.organizationId);

    // Create delivery record (without pricing and quality deductions - to be set by Farm Admin)
    const delivery = await prisma.delivery.create({
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
        standardDeduction: 0, // Will be calculated when pricing is set
        qualityDeduction: 0, // To be set by Farm Admin
        qualityDeductionReason: null,
        netWeight: grossWeight, // Will be recalculated when quality deduction is set
        pricePerKg: 0, // To be set by Farm Admin
        totalValue: 0, // To be calculated when pricing is set
        advanceAmount: advanceBalance, // Current advance balance
        interestCharges: 0, // To be calculated if needed
        finalAmount: 0, // To be calculated when pricing is set
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

  async getLorryDeliveries(
    lorryId: string,
    userId: string
  ): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      select: {
        organizationId: true,
        assignedManagerId: true,
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (lorry.organizationId !== user.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    // Field managers can only see their assigned lorries
    if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    const deliveries = await prisma.delivery.findMany({
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

  async updateDelivery(
    deliveryId: string,
    userId: string,
    data: UpdateDeliveryData
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FIELD_MANAGER') {
      throw new ForbiddenError('Only field managers can update deliveries');
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        organizationId: true,
        managerId: true,
        status: true,
        lorryId: true,
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.organizationId !== user.organizationId) {
      throw new ForbiddenError('Access denied to this delivery');
    }

    if (delivery.managerId !== userId) {
      throw new ForbiddenError('You can only update your own deliveries');
    }

    if (delivery.status !== 'PENDING') {
      throw new BadRequestError('Can only update pending deliveries');
    }

    // Validate individual weights if provided
    if (data.individualWeights && data.bagsCount) {
      if (data.individualWeights.length !== data.bagsCount) {
        throw new BadRequestError('Number of individual weights must match bags count');
      }
    }

    // Calculate new weights if individual weights are updated
    let updateData: any = { ...data };
    
    if (data.individualWeights) {
      const grossWeight = data.individualWeights.reduce((sum, weight) => sum + weight, 0);
      updateData.grossWeight = grossWeight;
      
      // Note: Quality deductions are now set by Farm Admin only, not in updates
    }

    const updatedDelivery = await prisma.delivery.update({
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

  async submitLorryToAdmin(lorryId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FIELD_MANAGER') {
      throw new ForbiddenError('Only field managers can submit lorries');
    }

    const lorry = await prisma.lorry.findUnique({
      where: { id: lorryId },
      select: {
        organizationId: true,
        assignedManagerId: true,
        status: true,
      },
    });

    if (!lorry) {
      throw new NotFoundError('Lorry not found');
    }

    if (lorry.organizationId !== user.organizationId) {
      throw new ForbiddenError('Access denied to this lorry');
    }

    if (lorry.assignedManagerId !== userId) {
      throw new ForbiddenError('This lorry is not assigned to you');
    }

    // Check if lorry has any deliveries
    const deliveryCount = await prisma.delivery.count({
      where: {
        lorryId: lorryId,
        status: 'PENDING',
      },
    });

    if (deliveryCount === 0) {
      throw new BadRequestError('Cannot submit lorry without any deliveries');
    }

    // Update all deliveries to IN_PROGRESS status
    await prisma.delivery.updateMany({
      where: {
        lorryId: lorryId,
        status: 'PENDING',
      },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    // Update lorry status
    await prisma.lorry.update({
      where: { id: lorryId },
      data: {
        status: 'IN_TRANSIT',
      },
    });

    // Get updated lorry with deliveries
    const updatedLorry = await prisma.lorry.findUnique({
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

  async createAdvancePayment(
    organizationId: string,
    userId: string,
    data: CreateAdvancePaymentData
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    if (!['FARM_ADMIN', 'FIELD_MANAGER'].includes(user.role)) {
      throw new ForbiddenError('Only farm admins and field managers can create advance payments');
    }

    // Verify farmer belongs to organization
    const farmer = await prisma.farmer.findFirst({
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
      throw new NotFoundError('Farmer not found in your organization');
    }

    const advancePayment = await prisma.advancePayment.create({
      data: {
        organizationId: organizationId,
        farmerId: data.farmerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod as any,
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
            email: true,
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

    // Send advance payment notification email
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true' && farmer.email) {
      try {
        await this.emailService.sendAdvancePaymentNotification(
          farmer.email,
          {
            farmerName: advancePayment.farmer.name,
            amount: advancePayment.amount,
            paymentDate: advancePayment.paymentDate.toLocaleDateString(),
            referenceNumber: advancePayment.referenceNumber,
            reason: advancePayment.reason,
          }
        );
      } catch (error) {
        console.error('Failed to send advance payment notification email:', error);
        // Don't fail the payment creation if email fails
      }
    }

    return advancePayment;
  }

  async getFarmerAdvanceBalance(farmerId: string, organizationId: string): Promise<number> {
    const result = await prisma.advancePayment.aggregate({
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

  async setQualityDeduction(
    deliveryId: string,
    userId: string,
    data: SetQualityDeductionData
  ): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can set quality deductions');
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      select: {
        organizationId: true,
        bagsCount: true,
        grossWeight: true,
        status: true,
      },
    });

    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    if (delivery.organizationId !== user.organizationId) {
      throw new ForbiddenError('Access denied to this delivery');
    }

    if (!['PENDING', 'IN_PROGRESS'].includes(delivery.status)) {
      throw new BadRequestError('Can only set quality deduction for pending or in-progress deliveries');
    }

    // Calculate standard deduction: 2kg per bag
    const standardDeduction = delivery.bagsCount * 2;
    const netWeight = Math.max(0, Number(delivery.grossWeight) - standardDeduction - data.qualityDeductionKgs);

    const updatedDelivery = await prisma.delivery.update({
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

  async setPricing(
    organizationId: string,
    userId: string,
    data: SetPricingData
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can set pricing');
    }

    if (user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    switch (data.pricingType) {
      case 'UNIVERSAL':
        // Update organization settings with universal price
        await prisma.organization.update({
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
          throw new BadRequestError('Lorry ID is required for lorry-specific pricing');
        }

        // Verify lorry belongs to organization
        const lorry = await prisma.lorry.findUnique({
          where: { id: data.lorryId },
          select: { organizationId: true },
        });

        if (!lorry || lorry.organizationId !== organizationId) {
          throw new NotFoundError('Lorry not found in your organization');
        }

        // Update all deliveries for this lorry
        await prisma.delivery.updateMany({
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
          throw new BadRequestError('Farmer ID is required for farmer-specific pricing');
        }

        // Verify farmer belongs to organization
        const farmer = await prisma.farmer.findFirst({
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
          throw new NotFoundError('Farmer not found in your organization');
        }

        // Update all deliveries for this farmer
        await prisma.delivery.updateMany({
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
        throw new BadRequestError('Invalid pricing type');
    }

    // Recalculate totals for affected deliveries
    await this.recalculateDeliveryTotals(organizationId, data);
  }

  private async recalculateDeliveryTotals(organizationId: string, pricingData: SetPricingData): Promise<void> {
    let whereClause: any = {
      organizationId: organizationId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
      pricePerKg: { gt: 0 }, // Only recalculate deliveries with pricing set
    };

    if (pricingData.pricingType === 'LORRY' && pricingData.lorryId) {
      whereClause.lorryId = pricingData.lorryId;
    } else if (pricingData.pricingType === 'FARMER' && pricingData.farmerId) {
      whereClause.farmerId = pricingData.farmerId;
    }

    const deliveries = await prisma.delivery.findMany({
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

      await prisma.delivery.update({
        where: { id: delivery.id },
        data: {
          totalValue: totalValue,
          finalAmount: finalAmount,
        },
      });
    }
  }

  async processDeliveries(
    lorryId: string,
    userId: string
  ): Promise<any[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.role !== 'FARM_ADMIN') {
      throw new ForbiddenError('Only farm admins can process deliveries');
    }

    // Get organization pricing
    const organization = await prisma.organization.findUnique({
      where: { id: user.organizationId! },
      select: { settings: true },
    });

    const pricePerKg = (organization?.settings as any)?.universalPricePerKg || (organization?.settings as any)?.pricePerKg || 0;

    if (pricePerKg <= 0) {
      throw new BadRequestError('Please set price per KG first');
    }

    // Get all IN_PROGRESS deliveries for this lorry
    const deliveries = await prisma.delivery.findMany({
      where: {
        lorryId: lorryId,
        organizationId: user.organizationId!,
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
      throw new BadRequestError('No deliveries to process for this lorry');
    }

    // Process each delivery
    const processedDeliveries = [];

    for (const delivery of deliveries) {
      // Calculate standard deduction: 2kg per bag
      const standardDeduction = delivery.bagsCount * 2;
      
      // Calculate net weight (gross - standard deduction - quality deduction)
      const netWeight = Math.max(0, Number(delivery.grossWeight) - standardDeduction - Number(delivery.qualityDeduction));
      
      // Calculate total value
      const totalValue = netWeight * pricePerKg;
      
      // Calculate final amount (total value - advance - interest charges)
      const finalAmount = Math.max(0, totalValue - Number(delivery.advanceAmount) - Number(delivery.interestCharges));

      // Update delivery with calculations
      const updatedDelivery = await prisma.delivery.update({
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

      // Send payment notification email
      if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true') {
        try {
          // Get farmer email from farmer record
          const farmerWithEmail = await prisma.farmer.findUnique({
            where: { id: delivery.farmerId },
            select: { email: true },
          });

          if (farmerWithEmail?.email) {
            await this.emailService.sendPaymentNotification(
              farmerWithEmail.email,
              {
                farmerName: updatedDelivery.farmer.name,
                amount: finalAmount,
                deliveryDate: updatedDelivery.deliveryDate?.toLocaleDateString() || new Date().toLocaleDateString(),
                referenceNumber: updatedDelivery.id,
              }
            );
          }
        } catch (error) {
          console.error('Failed to send payment notification email:', error);
          // Don't fail the processing if email fails
        }
      }

      // Update farmer organization stats
      await prisma.farmerOrganization.update({
        where: {
          farmerId_organizationId: {
            farmerId: delivery.farmerId,
            organizationId: user.organizationId!,
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

    // Update lorry status back to AVAILABLE
    await prisma.lorry.update({
      where: { id: lorryId },
      data: {
        status: 'AVAILABLE',
        assignedManagerId: null,
        assignedAt: null,
      },
    });

    return processedDeliveries;
  }

  async getDeliveries(
    organizationId: string,
    userId: string,
    filters: DeliveryFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{ deliveries: any[]; total: number; page: number; totalPages: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = { organizationId };

    // Apply filters
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

    // Field managers can only see their own deliveries
    if (user.role === 'FIELD_MANAGER') {
      where.managerId = userId;
    }

    const [deliveries, total] = await Promise.all([
      prisma.delivery.findMany({
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
      prisma.delivery.count({ where }),
    ]);

    return {
      deliveries,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDeliveryStats(organizationId: string, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    });

    if (!user || user.organizationId !== organizationId) {
      throw new ForbiddenError('Access denied to this organization');
    }

    const where: any = { organizationId };

    // Field managers only see their own stats
    if (user.role === 'FIELD_MANAGER') {
      where.managerId = userId;
    }

    const [
      totalDeliveries,
      pendingDeliveries,
      inProgressDeliveries,
      completedDeliveries,
      totalGrossWeight,
      totalNetWeight,
      totalValue,
    ] = await Promise.all([
      prisma.delivery.count({ where }),
      prisma.delivery.count({ where: { ...where, status: 'PENDING' } }),
      prisma.delivery.count({ where: { ...where, status: 'IN_PROGRESS' } }),
      prisma.delivery.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.delivery.aggregate({
        where,
        _sum: { grossWeight: true },
      }),
      prisma.delivery.aggregate({
        where,
        _sum: { netWeight: true },
      }),
      prisma.delivery.aggregate({
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