import { Request, Response, NextFunction } from 'express';
import { DeliveryService } from '../services/delivery.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class DeliveryController {
  private deliveryService: DeliveryService;

  constructor() {
    this.deliveryService = new DeliveryService();
  }

  addFarmerToLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId, farmerId } = req.params;
      const userId = req.user!.id;
      
      const delivery = await this.deliveryService.addFarmerToLorry(
        lorryId,
        farmerId,
        userId,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Farmer added to lorry successfully',
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryDeliveries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const deliveries = await this.deliveryService.getLorryDeliveries(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Lorry deliveries retrieved successfully',
        data: { deliveries },
      });
    } catch (error) {
      next(error);
    }
  };

  updateDelivery = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deliveryId } = req.params;
      const userId = req.user!.id;
      
      const delivery = await this.deliveryService.updateDelivery(deliveryId, userId, req.body);
      
      res.json({
        success: true,
        message: 'Delivery updated successfully',
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  };

  submitLorryToAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const lorry = await this.deliveryService.submitLorryToAdmin(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Lorry submitted to admin successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  createAdvancePayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const advancePayment = await this.deliveryService.createAdvancePayment(
        organizationId,
        userId,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Advance payment created successfully',
        data: { advancePayment },
      });
    } catch (error) {
      next(error);
    }
  };

  setQualityDeduction = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { deliveryId } = req.params;
      const userId = req.user!.id;
      
      const delivery = await this.deliveryService.setQualityDeduction(deliveryId, userId, req.body);
      
      res.json({
        success: true,
        message: 'Quality deduction set successfully',
        data: { delivery },
      });
    } catch (error) {
      next(error);
    }
  };

  setPricing = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      await this.deliveryService.setPricing(organizationId, userId, req.body);
      
      res.json({
        success: true,
        message: 'Pricing updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  processDeliveries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const deliveries = await this.deliveryService.processDeliveries(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Deliveries processed successfully',
        data: { deliveries },
      });
    } catch (error) {
      next(error);
    }
  };

  getDeliveries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const {
        status,
        lorryId,
        farmerId,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;
      
      const filters = {
        status: status as any,
        lorryId: lorryId as string,
        farmerId: farmerId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.deliveryService.getDeliveries(
        organizationId,
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        message: 'Deliveries retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getDeliveryStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const stats = await this.deliveryService.getDeliveryStats(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Delivery statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}