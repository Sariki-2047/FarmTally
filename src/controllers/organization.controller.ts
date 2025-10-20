import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from '../services/organization.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class OrganizationController {
  private organizationService: OrganizationService;

  constructor() {
    this.organizationService = new OrganizationService();
  }

  createOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const ownerId = req.user!.id;
      const organization = await this.organizationService.createOrganization(ownerId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Organization created successfully',
        data: { organization },
      });
    } catch (error) {
      next(error);
    }
  };

  getOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const organization = await this.organizationService.getOrganization(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Organization retrieved successfully',
        data: { organization },
      });
    } catch (error) {
      next(error);
    }
  };

  updateOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const organization = await this.organizationService.updateOrganization(
        organizationId,
        userId,
        req.body
      );
      
      res.json({
        success: true,
        message: 'Organization updated successfully',
        data: { organization },
      });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const users = await this.organizationService.getOrganizationUsers(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Organization users retrieved successfully',
        data: { users },
      });
    } catch (error) {
      next(error);
    }
  };

  inviteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const inviterId = req.user!.id;
      
      const user = await this.organizationService.inviteUser(organizationId, inviterId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'User invited successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };

  removeUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId, userId: userIdToRemove } = req.params;
      const ownerId = req.user!.id;
      
      await this.organizationService.removeUser(organizationId, ownerId, userIdToRemove);
      
      res.json({
        success: true,
        message: 'User removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { organizationId } = req.params;
      const userId = req.user!.id;
      
      const stats = await this.organizationService.getOrganizationStats(organizationId, userId);
      
      res.json({
        success: true,
        message: 'Organization statistics retrieved successfully',
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  };
}