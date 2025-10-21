import { DeliveryStatus } from '@prisma/client';
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
export declare class DeliveryService {
    private emailService;
    constructor();
    addFarmerToLorry(lorryId: string, farmerId: string, userId: string, data: CreateDeliveryData): Promise<any>;
    getLorryDeliveries(lorryId: string, userId: string): Promise<any[]>;
    updateDelivery(deliveryId: string, userId: string, data: UpdateDeliveryData): Promise<any>;
    submitLorryToAdmin(lorryId: string, userId: string): Promise<any>;
    createAdvancePayment(organizationId: string, userId: string, data: CreateAdvancePaymentData): Promise<any>;
    getFarmerAdvanceBalance(farmerId: string, organizationId: string): Promise<number>;
    setQualityDeduction(deliveryId: string, userId: string, data: SetQualityDeductionData): Promise<any>;
    setPricing(organizationId: string, userId: string, data: SetPricingData): Promise<void>;
    private recalculateDeliveryTotals;
    processDeliveries(lorryId: string, userId: string): Promise<any[]>;
    getDeliveries(organizationId: string, userId: string, filters?: DeliveryFilters, page?: number, limit?: number): Promise<{
        deliveries: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getDeliveryStats(organizationId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=delivery.service.d.ts.map