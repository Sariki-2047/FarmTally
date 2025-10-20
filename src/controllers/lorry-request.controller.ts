import { Request, Response, NextFunction } from 'express';
import { LorryRequestService } from '../services/lorry-request.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class LorryRequestController {
  private lorryRequestService: LorryRequestService;

  constructor() {
    this.lorryRequestService = new LorryRequestService();
  }

  createLorryRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const managerId = req.user!.id;
      
      const request = await this.lorryRequestService.createLorryRequest(
        organizationId,
        managerId,
        req.body
      );
      
      res.status(201).json({
        success: true,
        message: 'Lorry request created successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const {
        status,
        priority,
        managerId,
        startDate,
        endDate,
        page = '1',
        limit = '20',
      } = req.query;
      
      const filters = {
        status: status as any,
        priority: priority as any,
        managerId: managerId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const result = await this.lorryRequestService.getLorryRequests(
        organizationId,
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        message: 'Lorry requests retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryRequestById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      
      const request = await this.lorryRequestService.getLorryRequestById(requestId, userId);
      
      res.json({
        success: true,
        message: 'Lorry request retrieved successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  updateLorryRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      
      const request = await this.lorryRequestService.updateLorryRequest(
        requestId,
        userId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Lorry request updated successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  approveLorryRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const approverId = req.user!.id;
      
      const request = await this.lorryRequestService.approveLorryRequest(
        requestId,
        approverId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Lorry request approved successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  rejectLorryRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const approverId = req.user!.id;
      
      const request = await this.lorryRequestService.rejectLorryRequest(
        requestId,
        approverId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Lorry request rejected successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  cancelLorryRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params;
      const userId = req.user!.id;
      
      const request = await this.lorryRequestService.cancelLorryRequest(requestId, userId);
      
      res.json({
        success: true,
        message: 'Lorry request cancelled successfully',
        data: { request },
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryRequestStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const stats = await this.lorryRequestService.getLorryRequestStats(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Lorry request statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}