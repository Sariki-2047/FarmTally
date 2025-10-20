export interface CreateLorryData {
    plateNumber: string;
    capacity: number;
    assignedManagerId?: string;
}
export interface LorryResponse {
    id: string;
    plateNumber: string;
    licensePlate: string;
    capacity: number;
    status: string;
    assignedToId: string | null;
    assignedManagerId: string | null;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
    assignedManager?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}
export declare class LorryService {
    createLorry(data: CreateLorryData, organizationId: string): Promise<LorryResponse>;
    getLorries(organizationId: string, page?: number, limit?: number): Promise<{
        lorries: LorryResponse[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getLorryById(id: string, organizationId: string): Promise<LorryResponse>;
    updateLorry(id: string, data: Partial<CreateLorryData>, organizationId: string): Promise<LorryResponse>;
    deleteLorry(id: string, organizationId: string): Promise<void>;
    updateLorryStatus(id: string, status: string, organizationId: string): Promise<LorryResponse>;
}
export declare const lorryService: LorryService;
//# sourceMappingURL=lorry.service.simple.d.ts.map