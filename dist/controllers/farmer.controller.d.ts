import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class FarmerController {
    private farmerService;
    constructor();
    createFarmer: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getFarmers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getFarmerById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateFarmer: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    removeFarmerFromOrganization: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getFarmerStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    searchFarmersForLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=farmer.controller.d.ts.map