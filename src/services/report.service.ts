import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface FarmerReportData {
  reportId: string;
  generatedDate: string;
  farmer: {
    id: string;
    name: string;
    number: string;
    phone?: string;
    aadhar?: string;
    bankAccount?: string;
  };
  transaction: {
    lorryId: string;
    date: string;
    fieldManager: string;
  };
  weights: {
    individual: number[];
    totalWeight: number;
    bagsCount: number;
    standardDeduction: number;
    qualityDeduction: number;
    adjustedWeight: number;
  };
  financial: {
    pricePerKg: number;
    totalValue: number;
    totalInterest: number;
    totalAdvance: number;
    finalAmount: number;
  };
  advance: {
    status: string;
    amount: number;
    history: any[];
    interestCharges: number;
  };
}

function getUserDisplayName(user: any): string {
  if (user.profile && typeof user.profile === 'object') {
    const profile = user.profile as any;
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;
    if (profile.lastName) return profile.lastName;
  }
  return user.email || user.phone || 'Unknown User';
}

export class ReportService {
  static prisma = prisma;

  static async generateFarmerReport(
    lorryId: string,
    farmerId: string,
    userId: string
  ): Promise<FarmerReportData> {
    try {
      // Get user and verify permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user || !user.organizationId) {
        throw new NotFoundError('User not found');
      }

      // Get delivery directly
      const delivery = await prisma.delivery.findFirst({
        where: { 
          lorryId,
          farmerId,
          organizationId: user.organizationId
        },
        include: {
          farmer: true
        }
      });

      if (!delivery) {
        throw new NotFoundError('No delivery found for this farmer in this lorry');
      }

      if (delivery.status !== 'COMPLETED') {
        throw new BadRequestError('Report can only be generated for completed deliveries');
      }

      // Get lorry and assigned manager info
      const lorry = await prisma.lorry.findUnique({
        where: { id: lorryId },
        include: {
          assignedManager: {
            select: { id: true, profile: true, email: true, phone: true }
          }
        }
      });

      if (!lorry) {
        throw new NotFoundError('Lorry not found');
      }

      // Verify user has permission to generate this report
      if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
        throw new ForbiddenError('You can only generate reports for your assigned lorries');
      }

      // Get farmer details
      const farmer = delivery.farmer;

      // Calculate weights from delivery data
      const individualWeights = delivery.individualWeights.map((weight: any) => Number(weight));
      const totalWeight = Number(delivery.grossWeight);
      const bagsCount = delivery.bagsCount;
      const standardDeduction = Number(delivery.standardDeduction);
      const qualityDeduction = Number(delivery.qualityDeduction || 0);
      const adjustedWeight = Number(delivery.netWeight);

      // Get financial details from delivery
      const pricePerKg = Number(delivery.pricePerKg);
      const totalValue = Number(delivery.totalValue);
      const totalAdvance = Number(delivery.advanceAmount);
      const totalInterest = Number(delivery.interestCharges);
      const finalAmount = Number(delivery.finalAmount);

      // Get advance payment history for this farmer
      const advancePayments = await prisma.advancePayment.findMany({
        where: {
          farmerId,
          organizationId: user.organizationId,
          status: 'ACTIVE'
        },
        orderBy: { createdAt: 'desc' }
      });

      // Format advance status
      let advanceStatus = "No advance data available";
      if (totalAdvance > 0) {
        advanceStatus = `Advance: ₹${totalAdvance.toFixed(2)} INR`;
      }

      // Generate report ID
      const reportId = `RPT${Date.now()}`;

      // Get farmer bank details
      const bankDetails = farmer.bankDetails as any;
      
      const reportData: FarmerReportData = {
        reportId,
        generatedDate: new Date().toISOString(),
        farmer: {
          id: farmer.id,
          name: farmer.name,
          number: farmer.idNumber || 'N/A',
          phone: farmer.phone || undefined,
          aadhar: farmer.idNumber ? `****-****-${farmer.idNumber.slice(-4)}` : undefined,
          bankAccount: bankDetails?.accountNumber ? `****${bankDetails.accountNumber.slice(-4)}` : undefined
        },
        transaction: {
          lorryId: delivery.lorryId,
          date: delivery.deliveryDate.toISOString().split('T')[0],
          fieldManager: lorry.assignedManager ? getUserDisplayName(lorry.assignedManager) : 'Unknown'
        },
        weights: {
          individual: individualWeights,
          totalWeight,
          bagsCount,
          standardDeduction,
          qualityDeduction,
          adjustedWeight
        },
        financial: {
          pricePerKg,
          totalValue,
          totalInterest,
          totalAdvance,
          finalAmount
        },
        advance: {
          status: advanceStatus,
          amount: totalAdvance,
          history: advancePayments.map(payment => ({
            amount: Number(payment.amount),
            date: payment.paymentDate.toISOString().split('T')[0],
            interestAmount: 0 // Interest is calculated at delivery level
          })),
          interestCharges: totalInterest
        }
      };

      // Store report generation record
      await prisma.reportGeneration.create({
        data: {
          reportId,
          lorryId,
          farmerId,
          generatedById: userId,
          reportType: 'FARMER_SETTLEMENT',
          reportData: JSON.stringify(reportData)
        }
      });

      return reportData;

    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error generating farmer report:', error);
      throw new Error('Failed to generate farmer report');
    }
  }

  static async generateTextReport(reportData: FarmerReportData): Promise<string> {
    const { farmer, weights, financial, advance } = reportData;
    
    let report = `Farmer Settlement Report\n`;
    report += `========================\n\n`;
    
    // Farmer Information
    report += `Name: ${farmer.name}\n`;
    report += `Number: ${farmer.number}\n`;
    if (farmer.phone) report += `Phone No.: ${farmer.phone}\n`;
    if (farmer.aadhar) report += `Aadhar: ${farmer.aadhar}\n`;
    if (farmer.bankAccount) report += `Bank Account: ${farmer.bankAccount}\n`;
    report += `\n${advance.status}\n\n`;
    
    report += `---\n\n`;
    
    // Financial Summary
    report += `Financial Summary:\n`;
    report += `Price Per Kg: ${financial.pricePerKg}\n`;
    report += `Bags Entered: ${weights.bagsCount}\n`;
    report += `Total Weight: ${weights.totalWeight}\n`;
    report += `Weight Adjustment: ${weights.standardDeduction + weights.qualityDeduction}\n`;
    report += `Adjusted Total Weight: ${weights.adjustedWeight}\n`;
    report += `Total Value: ${financial.totalValue.toFixed(2)}\n`;
    report += `Total Interest: ${financial.totalInterest.toFixed(2)} INR\n`;
    report += `Total Advance: ${financial.totalAdvance.toFixed(2)} INR\n`;
    report += `Final amount: ${financial.finalAmount.toFixed(2)} INR\n\n`;
    
    report += `---\n\n`;
    
    // Individual Bag Weights
    report += `Weights Entered:\n`;
    const weightsText = weights.individual.join(', ');
    // Wrap text to approximately 60 characters per line
    const wrappedWeights = weightsText.match(/.{1,60}(?:,|$)/g)?.join('\n') || weightsText;
    report += `${wrappedWeights}\n`;
    
    return report;
  }

  static async getLorryReports(lorryId: string, userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user || !user.organizationId) {
        throw new NotFoundError('User not found');
      }

      const lorry = await prisma.lorry.findUnique({
        where: { 
          id: lorryId,
          organizationId: user.organizationId 
        }
      });

      if (!lorry) {
        throw new NotFoundError('Lorry not found');
      }

      // Verify user has permission
      if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
        throw new ForbiddenError('You can only access reports for your assigned lorries');
      }

      // Get deliveries for this lorry
      const deliveries = await prisma.delivery.findMany({
        where: { lorryId },
        include: {
          farmer: {
            select: { id: true, name: true, idNumber: true }
          }
        }
      });

      const reports = await prisma.reportGeneration.findMany({
        where: { lorryId },
        include: {
          generatedBy: {
            select: { id: true, profile: true, email: true, phone: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        lorry: {
          id: lorry.id,
          plateNumber: lorry.licensePlate,
          status: lorry.status
        },
        farmers: deliveries.map(delivery => ({
          id: delivery.farmer.id,
          name: delivery.farmer.name,
          farmerNumber: delivery.farmer.idNumber || 'N/A'
        })),
        reports: reports.map(report => ({
          id: report.id,
          reportId: report.reportId,
          farmerId: report.farmerId,
          reportType: report.reportType,
          generatedAt: report.createdAt,
          generatedBy: getUserDisplayName(report.generatedBy)
        }))
      };

    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      console.error('Error getting lorry reports:', error);
      throw new Error('Failed to get lorry reports');
    }
  }
}