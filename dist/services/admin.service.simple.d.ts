export interface PendingFarmAdminResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    organizationName: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ApprovalData {
    userId: string;
    approved: boolean;
    rejectionReason?: string;
}
export declare class AdminService {
    getPendingFarmAdmins(): Promise<PendingFarmAdminResponse[]>;
    reviewFarmAdminRegistration(data: ApprovalData, reviewerId: string): Promise<{
        message: string;
        user: any;
    }>;
    getAllFarmAdmins(): Promise<PendingFarmAdminResponse[]>;
    getSystemStats(): Promise<{
        totalOrganizations: number;
        totalFarmAdmins: number;
        pendingApprovals: number;
        totalFieldManagers: number;
        totalFarmers: number;
        totalDeliveries: number;
        totalAdvancePayments: number;
    }>;
    createApplicationAdmin(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        token: string;
        user: any;
    }>;
    canInviteFieldManagers(userId: string): Promise<boolean>;
}
export declare const adminService: AdminService;
//# sourceMappingURL=admin.service.simple.d.ts.map