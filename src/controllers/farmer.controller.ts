import { Request, Response, NextFunction } from 'express';
import { FarmerService } from '../services/farmer.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class FarmerController {
  private farmerService: FarmerService;

  constructor() {
    this.farmerService = new FarmerService();
  }

  createFarmer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const createdBy = req.user!.id;
      
      const farmer = await this.farmerService.createFarmer(organizationId, createdBy, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Farmer created successfully',
        data: { farmer },
      });
    } catch (error) {
      next(error);
    }
  };

  getFarmers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const { search, status, page = '1', limit = '20' } = req.query;
      
      const filters = {
        search: search as string,
        status: status as string,
      };

      const result = await this.farmerService.getFarmers(
        organizationId,
        userId,
        filters,
        parseInt(page as string),
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        message: 'Farmers retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getFarmerById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { farmerId } = req.params;
      const userId = req.user!.id;
      
      const farmer = await this.farmerService.getFarmerById(farmerId, userId);
      
      res.json({
        success: true,
        message: 'Farmer retrieved successfully',
        data: { farmer },
      });
    } catch (error) {
      next(error);
    }
  };

  updateFarmer = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { farmerId } = req.params;
      const userId = req.user!.id;
      
      const farmer = await this.farmerService.updateFarmer(farmerId, userId, req.body);
      
      res.json({
        success: true,
        message: 'Farmer updated successfully',
        data: { farmer },
      });
    } catch (error) {
      next(error);
    }
  };

  removeFarmerFromOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { farmerId } = req.params;
      const userId = req.user!.id;
      
      await this.farmerService.removeFarmerFromOrganization(farmerId, userId);
      
      res.json({
        success: true,
        message: 'Farmer removed from organization successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getFarmerStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const stats = await this.farmerService.getFarmerStats(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Farmer statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };

  searchFarmersForLorry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      const { search, limit = '10' } = req.query;
      
      const farmers = await this.farmerService.searchFarmersForLorry(
        organizationId,
        userId,
        search as string,
        parseInt(limit as string)
      );
      
      res.json({
        success: true,
        message: 'Farmers for lorry retrieved successfully',
        data: { farmers },
      });
    } catch (error) {
      next(error);
    }
  };
}