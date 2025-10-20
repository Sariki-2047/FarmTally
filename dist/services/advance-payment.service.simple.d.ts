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
export declare class AdvancePaymentService {
    createAdvancePayment(data: CreateAdvancePaymentData, userId: string, organizationId: string): Promise<AdvancePaymentResponse>;
    getFarmerAdvancePayments(farmerId: string, organizationId: string): Promise<AdvancePaymentResponse[]>;
    getFarmerAdvanceBalance(farmerId: string, organizationId: string): Promise<number>;
    getAdvancePaymentSummary(organizationId: string): Promise<{
        totalAdvances: number;
        totalFarmers: number;
        recentPayments: AdvancePaymentResponse[];
    }>;
    updateAdvancePayment(paymentId: string, data: Partial<CreateAdvancePaymentData>, organizationId: string): Promise<AdvancePaymentResponse>;
    deleteAdvancePayment(paymentId: string, organizationId: string): Promise<void>;
}
export declare const advancePaymentService: AdvancePaymentService;
//# sourceMappingURL=advance-payment.service.simple.d.ts.map