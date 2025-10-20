import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare class DeliveryController {
    private deliveryService;
    constructor();
    addFarmerToLorry: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getLorryDeliveries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    updateDelivery: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    submitLorryToAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    createAdvancePayment: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    setQualityDeduction: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    setPricing: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    processDeliveries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getDeliveries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    getDeliveryStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=delivery.controller.d.ts.map