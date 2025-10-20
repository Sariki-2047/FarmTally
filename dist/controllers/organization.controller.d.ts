import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class OrganizationController {
    private organizationService;
    constructor();
    createOrganization: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getOrganization: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateOrganization: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getOrganizationUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    inviteUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    removeUser: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getOrganizationStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=organization.controller.d.ts.map