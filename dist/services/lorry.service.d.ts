import { Lorry, LorryStatus } from '@prisma/client';
export interface CreateLorryData {
    name: string;
    licensePlate: string;
    capacity: number;
    assignedManagerId?: string;
    location?: any;
    maintenanceSchedule?: any;
}
export interface UpdateLorryData {
    name?: string;
    licensePlate?: string;
    capacity?: number;
    status?: LorryStatus;
    assignedManagerId?: string | null;
    location?: any;
    maintenanceSchedule?: any;
}
export interface LorryFilters {
    status?: LorryStatus;
    assignedManagerId?: string;
    search?: string;
}
export declare class LorryService {
    createLorry(organizationId: string, userId: string, data: CreateLorryData): Promise<Lorry>;
    getLorries(organizationId: string, userId: string, filters?: LorryFilters, page?: number, limit?: number): Promise<{
        lorries: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getLorryById(lorryId: string, userId: string): Promise<any>;
    updateLorry(lorryId: string, userId: string, data: UpdateLorryData): Promise<Lorry>;
    deleteLorry(lorryId: string, userId: string): Promise<void>;
    assignLorryToManager(lorryId: string, managerId: string, userId: string): Promise<Lorry>;
    unassignLorry(lorryId: string, userId: string): Promise<Lorry>;
    getLorryStats(organizationId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=lorry.service.d.ts.map