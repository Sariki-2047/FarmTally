import { prisma } from '../lib/prisma';

export interface CreateAdvancePaymentData {
  farmerId: string;
  amount: number;
  paymentDate: Date;
  reference?: string;
  notes?: string;
}

export interface AdvancePaymentResponse {
  id: string;
  farmerId: string;
  organizationId: string;
  processedById: string;
  amount: number;
  interestRate: number | null;
  dueDate: Date | null;
  status: string;
  reference: string | null;
  notes: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  farmer?: {
    id: string;
    name: string;
    phone: string;
  };
  processedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export class AdvancePaymentService {
  
  /**
   * Create advance payment (Farm Admin only)
   */
  async createAdvancePayment(
    data: CreateAdvancePaymentData,
    userId: string,
    organizationId: string
  ): Promise<AdvancePaymentResponse> {
    
    // Verify farmer exists in organization
    const farmer = await prisma.farmer.findFirst({
      where: { 
        id: data.farmerId,
        organizationId: organizationId,
        isActive: true
      }
    });

    if (!farmer) {
      throw new Error('Farmer not found in your organization');
    }

    // Validate amount
    if (data.amount <= 0) {
      throw new Error('Advance amount must be greater than 0');
    }

    // Create advance payment record
    const advancePayment = await prisma.advancePayment.create({
      data: {
        farmerId: data.farmerId,
        organizationId: organizationId,
        processedById: userId,
        amount: data.amount,
        interestRate: 0, // Can be configured later
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

    return advancePayment as AdvancePaymentResponse;
  }

  /**
   * Get all advance payments for a farmer
   */
  async getFarmerAdvancePayments(
    farmerId: string,
    organizationId: string
  ): Promise<AdvancePaymentResponse[]> {
    
    const payments = await prisma.advancePayment.findMany({
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

    return payments as AdvancePaymentResponse[];
  }

  /**
   * Get total advance balance for a farmer
   */
  async getFarmerAdvanceBalance(farmerId: string, organizationId: string): Promise<number> {
    const result = await prisma.advancePayment.aggregate({
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

  /**
   * Get advance payment summary for organization
   */
  async getAdvancePaymentSummary(organizationId: string): Promise<{
    totalAdvances: number;
    totalFarmers: number;
    recentPayments: AdvancePaymentResponse[];
  }> {
    
    const [totalResult, farmerCount, recentPayments] = await Promise.all([
      prisma.advancePayment.aggregate({
        where: {
          organizationId: organizationId,
          status: 'COMPLETED'
        },
        _sum: {
          amount: true
        }
      }),
      prisma.advancePayment.groupBy({
        by: ['farmerId'],
        where: {
          organizationId: organizationId,
          status: 'COMPLETED'
        }
      }),
      prisma.advancePayment.findMany({
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
      recentPayments: recentPayments as AdvancePaymentResponse[]
    };
  }

  /**
   * Update advance payment
   */
  async updateAdvancePayment(
    paymentId: string,
    data: Partial<CreateAdvancePaymentData>,
    organizationId: string
  ): Promise<AdvancePaymentResponse> {
    
    const payment = await prisma.advancePayment.findFirst({
      where: {
        id: paymentId,
        organizationId: organizationId
      }
    });

    if (!payment) {
      throw new Error('Advance payment not found');
    }

    const updatedPayment = await prisma.advancePayment.update({
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

    return updatedPayment as AdvancePaymentResponse;
  }

  /**
   * Delete advance payment
   */
  async deleteAdvancePayment(paymentId: string, organizationId: string): Promise<void> {
    const payment = await prisma.advancePayment.findFirst({
      where: {
        id: paymentId,
        organizationId: organizationId
      }
    });

    if (!payment) {
      throw new Error('Advance payment not found');
    }

    await prisma.advancePayment.delete({
      where: { id: paymentId }
    });
  }
}

export const advancePaymentService = new AdvancePaymentService();