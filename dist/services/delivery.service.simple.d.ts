export interface CreateDeliveryData {
    lorryId: string;
    farmerId: string;
    deliveryDate: Date;
    bagsCount: number;
    individualWeights: number[];
    moistureContent: number;
    qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
    photos?: string[];
    notes?: string;
}
export interface UpdateDeliveryData {
    bagsCount?: number;
    individualWeights?: number[];
    moistureContent?: number;
    qualityGrade?: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
    photos?: string[];
    notes?: string;
}
export interface SetQualityDeductionData {
    qualityDeduction: number;
    standardDeduction: number;
    qualityGrade: 'A' | 'B' | 'C' | 'D' | 'REJECTED';
}
export interface SetPricingData {
    pricePerKg: number;
}
export declare class DeliveryService {
    addFarmerToLorry(lorryId: string, farmerId: string, userId: string, organizationId: string, data: CreateDeliveryData): Promise<{
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    }>;
    getLorryDeliveries(lorryId: string, organizationId: string): Promise<({
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    })[]>;
    updateDelivery(deliveryId: string, data: UpdateDeliveryData, userId: string, organizationId: string): Promise<{
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    }>;
    setQualityDeduction(deliveryId: string, data: SetQualityDeductionData, organizationId: string): Promise<{
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    }>;
    setPricing(deliveryId: string, data: SetPricingData, organizationId: string): Promise<{
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    }>;
    submitLorry(lorryId: string, userId: string, organizationId: string): Promise<void>;
    markSentToDealer(lorryId: string, organizationId: string): Promise<void>;
    getDeliveryById(deliveryId: string, organizationId: string): Promise<{
        lorry: {
            id: string;
            capacity: number;
            plateNumber: string;
        };
        farmer: {
            id: string;
            phone: string;
            name: string;
            address: string | null;
        };
        fieldManager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.DeliveryStatus;
        organizationId: string;
        createdAt: Date;
        updatedAt: Date;
        lorryId: string;
        farmerId: string;
        deliveryDate: Date | null;
        bagsCount: number;
        individualWeights: import("@prisma/client/runtime/library").JsonValue;
        moistureContent: number | null;
        photos: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        fieldManagerId: string;
        grossWeight: number;
        qualityGrade: import(".prisma/client").$Enums.QualityGrade | null;
        standardDeduction: number | null;
        qualityDeduction: number | null;
        netWeight: number;
        pricePerKg: number | null;
        totalValue: number | null;
        advanceAmount: number | null;
        interestCharges: number | null;
        finalAmount: number | null;
        deliveredAt: Date | null;
        processedAt: Date | null;
    }>;
    deleteDelivery(deliveryId: string, userId: string, organizationId: string): Promise<void>;
    private getFarmerAdvanceBalance;
    private calculateStandardDeduction;
    private calculateInterestCharges;
}
export declare const deliveryService: DeliveryService;
//# sourceMappingURL=delivery.service.simple.d.ts.map