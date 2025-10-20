import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class LorryRequestController {
    private lorryRequestService;
    constructor();
    createLorryRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryRequests: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryRequestById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateLorryRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    approveLorryRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    rejectLorryRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    cancelLorryRequest: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryRequestStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=lorry-request.controller.d.ts.map