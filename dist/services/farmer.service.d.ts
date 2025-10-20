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
export declare class FarmerService {
    createFarmer(organizationId: string, createdBy: string, data: CreateFarmerData): Promise<any>;
    getFarmers(organizationId: string, userId: string, filters?: FarmerFilters, page?: number, limit?: number): Promise<{
        farmers: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getFarmerById(farmerId: string, userId: string): Promise<any>;
    updateFarmer(farmerId: string, userId: string, data: UpdateFarmerData): Promise<any>;
    removeFarmerFromOrganization(farmerId: string, userId: string): Promise<void>;
    getFarmerStats(organizationId: string, userId: string): Promise<any>;
    searchFarmersForLorry(organizationId: string, userId: string, searchTerm?: string, limit?: number): Promise<any[]>;
}
//# sourceMappingURL=farmer.service.d.ts.map