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
export declare class FarmerService {
    createFarmer(data: CreateFarmerData, organizationId: string): Promise<FarmerResponse>;
    getFarmers(organizationId: string, page?: number, limit?: number): Promise<{
        farmers: FarmerResponse[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFarmerById(id: string, organizationId: string): Promise<FarmerResponse>;
    updateFarmer(id: string, data: Partial<CreateFarmerData>, organizationId: string): Promise<FarmerResponse>;
    deleteFarmer(id: string, organizationId: string): Promise<void>;
    searchFarmers(query: string, organizationId: string): Promise<FarmerResponse[]>;
}
export declare const farmerService: FarmerService;
//# sourceMappingURL=farmer.service.simple.d.ts.map