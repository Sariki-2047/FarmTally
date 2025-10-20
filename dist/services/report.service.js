"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const client_1 = require("@prisma/client");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma = new client_1.PrismaClient();
function getUserDisplayName(user) {
    if (user.profile && typeof user.profile === 'object') {
        const profile = user.profile;
        if (profile.firstName && profile.lastName) {
            return `${profile.firstName} ${profile.lastName}`;
        }
        if (profile.firstName)
            return profile.firstName;
        if (profile.lastName)
            return profile.lastName;
    }
    return user.email || user.phone || 'Unknown User';
}
class ReportService {
    static prisma = prisma;
    static async generateFarmerReport(lorryId, farmerId, userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { organization: true }
            });
            if (!user || !user.organizationId) {
                throw new error_middleware_1.NotFoundError('User not found');
            }
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
                throw new error_middleware_1.NotFoundError('No delivery found for this farmer in this lorry');
            }
            if (delivery.status !== 'COMPLETED') {
                throw new error_middleware_1.BadRequestError('Report can only be generated for completed deliveries');
            }
            const lorry = await prisma.lorry.findUnique({
                where: { id: lorryId },
                include: {
                    assignedManager: {
                        select: { id: true, profile: true, email: true, phone: true }
                    }
                }
            });
            if (!lorry) {
                throw new error_middleware_1.NotFoundError('Lorry not found');
            }
            if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
                throw new error_middleware_1.ForbiddenError('You can only generate reports for your assigned lorries');
            }
            const farmer = delivery.farmer;
            const individualWeights = delivery.individualWeights.map((weight) => Number(weight));
            const totalWeight = Number(delivery.grossWeight);
            const bagsCount = delivery.bagsCount;
            const standardDeduction = Number(delivery.standardDeduction);
            const qualityDeduction = Number(delivery.qualityDeduction || 0);
            const adjustedWeight = Number(delivery.netWeight);
            const pricePerKg = Number(delivery.pricePerKg);
            const totalValue = Number(delivery.totalValue);
            const totalAdvance = Number(delivery.advanceAmount);
            const totalInterest = Number(delivery.interestCharges);
            const finalAmount = Number(delivery.finalAmount);
            const advancePayments = await prisma.advancePayment.findMany({
                where: {
                    farmerId,
                    organizationId: user.organizationId,
                    status: 'ACTIVE'
                },
                orderBy: { createdAt: 'desc' }
            });
            let advanceStatus = "No advance data available";
            if (totalAdvance > 0) {
                advanceStatus = `Advance: ₹${totalAdvance.toFixed(2)} INR`;
            }
            const reportId = `RPT${Date.now()}`;
            const bankDetails = farmer.bankDetails;
            const reportData = {
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
                        interestAmount: 0
                    })),
                    interestCharges: totalInterest
                }
            };
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.NotFoundError || error instanceof error_middleware_1.BadRequestError || error instanceof error_middleware_1.ForbiddenError) {
                throw error;
            }
            console.error('Error generating farmer report:', error);
            throw new Error('Failed to generate farmer report');
        }
    }
    static async generateTextReport(reportData) {
        const { farmer, weights, financial, advance } = reportData;
        let report = `Farmer Settlement Report\n`;
        report += `========================\n\n`;
        report += `Name: ${farmer.name}\n`;
        report += `Number: ${farmer.number}\n`;
        if (farmer.phone)
            report += `Phone No.: ${farmer.phone}\n`;
        if (farmer.aadhar)
            report += `Aadhar: ${farmer.aadhar}\n`;
        if (farmer.bankAccount)
            report += `Bank Account: ${farmer.bankAccount}\n`;
        report += `\n${advance.status}\n\n`;
        report += `---\n\n`;
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
        report += `Weights Entered:\n`;
        const weightsText = weights.individual.join(', ');
        const wrappedWeights = weightsText.match(/.{1,60}(?:,|$)/g)?.join('\n') || weightsText;
        report += `${wrappedWeights}\n`;
        return report;
    }
    static async getLorryReports(lorryId, userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { organization: true }
            });
            if (!user || !user.organizationId) {
                throw new error_middleware_1.NotFoundError('User not found');
            }
            const lorry = await prisma.lorry.findUnique({
                where: {
                    id: lorryId,
                    organizationId: user.organizationId
                }
            });
            if (!lorry) {
                throw new error_middleware_1.NotFoundError('Lorry not found');
            }
            if (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId) {
                throw new error_middleware_1.ForbiddenError('You can only access reports for your assigned lorries');
            }
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.NotFoundError || error instanceof error_middleware_1.ForbiddenError) {
                throw error;
            }
            console.error('Error getting lorry reports:', error);
            throw new Error('Failed to get lorry reports');
        }
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=report.service.js.map