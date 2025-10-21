export interface CreateInvitationData {
    email: string;
    role: 'FARM_ADMIN' | 'FIELD_MANAGER';
    organizationName: string;
    invitedBy: string;
    firstName?: string;
    lastName?: string;
    message?: string;
    expiresInDays?: number;
}
export interface InvitationResponse {
    id: string;
    email: string;
    role: string;
    organizationName: string;
    invitationToken: string;
    invitedBy: string;
    isUsed: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare class InvitationService {
    private emailService;
    constructor();
    createInvitation(data: CreateInvitationData, inviterUserId: string): Promise<InvitationResponse>;
    validateInvitation(token: string): Promise<InvitationResponse>;
    registerWithInvitation(token: string, userData: {
        password: string;
        firstName: string;
        lastName: string;
    }): Promise<{
        user: any;
        token: string;
    }>;
    getInvitations(organizationId?: string): Promise<InvitationResponse[]>;
    resendInvitation(invitationId: string): Promise<InvitationResponse>;
    cancelInvitation(invitationId: string): Promise<void>;
    getFarmAdminWithOrganization(userId: string): Promise<any>;
    getFieldManagers(organizationId: string): Promise<any[]>;
}
export declare const invitationService: InvitationService;
//# sourceMappingURL=invitation.service.simple.d.ts.map