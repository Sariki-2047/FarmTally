import { UserStatus, UserRole } from '@prisma/client';
export interface PendingUserFilters {
    role?: UserRole;
    status?: UserStatus;
    organizationId?: string;
    startDate?: Date;
    endDate?: Date;
}
export interface ApproveUserData {
    userId: string;
    approvalNotes?: string;
}
export interface RejectUserData {
    userId: string;
    rejectionReason: string;
}
export interface CreateSystemAdminData {
    email: string;
    phone?: string;
    password: string;
    profile: {
        firstName: string;
        lastName: string;
    };
}
export declare class SystemAdminService {
    private emailService;
    constructor();
    getPendingUsers(filters?: PendingUserFilters, page?: number, limit?: number): Promise<{
        users: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    approveUser(adminId: string, data: ApproveUserData): Promise<any>;
    rejectUser(adminId: string, data: RejectUserData): Promise<any>;
    getDashboardStats(): Promise<any>;
    createSystemAdmin(data: CreateSystemAdminData): Promise<any>;
    getAllOrganizations(page?: number, limit?: number): Promise<{
        organizations: any[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    toggleUserStatus(adminId: string, userId: string, suspend: boolean): Promise<any>;
    private sendUserApprovalEmail;
    private sendUserRejectionEmail;
    private generateApprovalEmailTemplate;
    private generateRejectionEmailTemplate;
}
export default SystemAdminService;
//# sourceMappingURL=system-admin.service.d.ts.map