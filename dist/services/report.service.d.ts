import { PrismaClient } from '@prisma/client';
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
export declare class ReportService {
    static prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    static generateFarmerReport(lorryId: string, farmerId: string, userId: string): Promise<FarmerReportData>;
    static generateTextReport(reportData: FarmerReportData): Promise<string>;
    static getLorryReports(lorryId: string, userId: string): Promise<{
        lorry: {
            id: string;
            plateNumber: string;
            status: import(".prisma/client").$Enums.LorryStatus;
        };
        farmers: {
            id: string;
            name: string;
            farmerNumber: string;
        }[];
        reports: {
            id: string;
            reportId: any;
            farmerId: any;
            reportType: import(".prisma/client").$Enums.ReportType;
            generatedAt: Date;
            generatedBy: string;
        }[];
    }>;
}
//# sourceMappingURL=report.service.d.ts.map