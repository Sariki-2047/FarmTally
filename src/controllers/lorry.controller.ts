import { Request, Response, NextFunction } from 'express';
import { LorryService } from '../services/lorry.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class LorryController {
  private lorryService: LorryService;

  constructor() {
    this.lorryService = new LorryService();
  }

  createLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const lorry = await this.lorryService.createLorry(organizationId, userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Lorry created successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  getLorries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const { status, assignedManagerId, search, page = '1', limit = '20' } = req.query;
      
      const filters = {
        status: status as any,
        assignedManagerId: assignedManagerId as string,
        search: search as string,
      };

      const result = await this.lorryService.getLorries(
        organizationId,
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        message: 'Lorries retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const lorry = await this.lorryService.getLorryById(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Lorry retrieved successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  updateLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const lorry = await this.lorryService.updateLorry(lorryId, userId, req.body);
      
      res.json({
        success: true,
        message: 'Lorry updated successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      await this.lorryService.deleteLorry(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Lorry deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  assignLorryToManager = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const { managerId } = req.body;
      const userId = req.user!.id;
      
      const lorry = await this.lorryService.assignLorryToManager(lorryId, managerId, userId);
      
      res.json({
        success: true,
        message: 'Lorry assigned successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  unassignLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;
      
      const lorry = await this.lorryService.unassignLorry(lorryId, userId);
      
      res.json({
        success: true,
        message: 'Lorry unassigned successfully',
        data: { lorry },
      });
    } catch (error) {
      next(error);
    }
  };

  getLorryStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const stats = await this.lorryService.getLorryStats(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Lorry statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}