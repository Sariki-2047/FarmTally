import { RequestStatus, RequestPriority } from '@prisma/client';
export interface CreateLorryRequestData {
    requiredDate: Date;
    priority?: RequestPriority;
    purpose: string;
    estimatedDuration?: number;
    location?: string;
    expectedVolume?: number;
}
export interface UpdateLorryRequestData {
    requiredDate?: Date;
    priority?: RequestPriority;
    purpose?: string;
    estimatedDuration?: number;
    location?: string;
    expectedVolume?: number;
}
export interface ApproveLorryRequestData {
    assignedLorryId: string;
}
export interface RejectLorryRequestData {
    rejectionReason: string;
}
export interface LorryRequestFilters {
    status?: RequestStatus;
    priority?: RequestPriority;
    managerId?: string;
    startDate?: Date;
    endDate?: Date;
}
export declare class LorryRequestService {
    createLorryRequest(organizationId: string, managerId: string, data: CreateLorryRequestData): Promise<any>;
    getLorryRequests(organizationId: string, userId: string, filters?: LorryRequestFilters, page?: number, limit?: number): Promise<{
        requests: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getLorryRequestById(requestId: string, userId: string): Promise<any>;
    updateLorryRequest(requestId: string, userId: string, data: UpdateLorryRequestData): Promise<any>;
    approveLorryRequest(requestId: string, approverId: string, data: ApproveLorryRequestData): Promise<any>;
    rejectLorryRequest(requestId: string, approverId: string, data: RejectLorryRequestData): Promise<any>;
    cancelLorryRequest(requestId: string, userId: string): Promise<any>;
    getLorryRequestStats(organizationId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=lorry-request.service.d.ts.map