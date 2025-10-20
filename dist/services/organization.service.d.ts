import { Organization } from '@prisma/client';
export interface CreateOrganizationData {
    name: string;
    code: string;
    address?: string;
    phone?: string;
    email?: string;
    settings?: any;
}
export interface UpdateOrganizationData {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    settings?: any;
}
export declare class OrganizationService {
    createOrganization(ownerId: string, data: CreateOrganizationData): Promise<Organization>;
    getOrganization(organizationId: string, userId: string): Promise<any>;
    updateOrganization(organizationId: string, userId: string, data: UpdateOrganizationData): Promise<Organization>;
    getOrganizationUsers(organizationId: string, userId: string): Promise<any[]>;
    inviteUser(organizationId: string, inviterId: string, userData: {
        email?: string;
        phone?: string;
        role: 'FIELD_MANAGER' | 'FARMER';
        profile: any;
    }): Promise<any>;
    removeUser(organizationId: string, ownerId: string, userIdToRemove: string): Promise<void>;
    getOrganizationStats(organizationId: string, userId: string): Promise<any>;
}
//# sourceMappingURL=organization.service.d.ts.map