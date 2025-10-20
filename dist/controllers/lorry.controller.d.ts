import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class LorryController {
    private lorryService;
    constructor();
    createLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    deleteLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    assignLorryToManager: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    unassignLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=lorry.controller.d.ts.map