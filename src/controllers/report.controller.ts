import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { NotFoundError, BadRequestError, ForbiddenError, AppErrorClass } from '../middleware/error.middleware';

function getUserDisplayName(user: any): string {
  if (user.profile && typeof user.profile === 'object') {
    const profile = user.profile as any;
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    if (profile.firstName) return profile.firstName;
    if (profile.lastName) return profile.lastName;
  }
  return user.email || user.phone || 'Unknown User';
}

export class ReportController {
  static async generateFarmerReport(req: Request, res: Response) {
    try {
      const { lorryId, farmerId } = req.params;
      const userId = req.user!.id;

      const reportData = await ReportService.generateFarmerReport(lorryId, farmerId, userId);

      res.json({
        success: true,
        message: 'Farmer report generated successfully',
        data: reportData
      });
    } catch (error) {
      if (error instanceof AppErrorClass) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Error generating farmer report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async generateFarmerReportText(req: Request, res: Response) {
    try {
      const { lorryId, farmerId } = req.params;
      const userId = req.user!.id;

      const reportData = await ReportService.generateFarmerReport(lorryId, farmerId, userId);
      const textReport = await ReportService.generateTextReport(reportData);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="farmer-report-${reportData.farmer.name}-${reportData.reportId}.txt"`);
      res.send(textReport);
    } catch (error) {
      if (error instanceof AppErrorClass) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Error generating farmer report text:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getLorryReports(req: Request, res: Response) {
    try {
      const { lorryId } = req.params;
      const userId = req.user!.id;

      const reports = await ReportService.getLorryReports(lorryId, userId);

      res.json({
        success: true,
        message: 'Lorry reports retrieved successfully',
        data: reports
      });
    } catch (error) {
      if (error instanceof AppErrorClass) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Error getting lorry reports:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getAllReports(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 10, lorryId, farmerId, reportType } = req.query;

      // Get user organization
      const user = await ReportService.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Build filters
      const filters: any = {};
      if (lorryId) filters.lorryId = lorryId as string;
      if (farmerId) filters.farmerId = farmerId as string;
      if (reportType) filters.reportType = reportType as string;

      // Get reports with pagination
      const skip = (Number(page) - 1) * Number(limit);
      const reports = await ReportService.prisma.reportGeneration.findMany({
        where: filters,
        include: {
          generatedBy: {
            select: { id: true, profile: true, email: true, phone: true, role: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      });

      const total = await ReportService.prisma.reportGeneration.count({
        where: filters
      });

      res.json({
        success: true,
        message: 'Reports retrieved successfully',
        data: {
          reports: reports.map(report => ({
            id: report.id,
            reportId: report.reportId,
            lorryId: report.lorryId,
            farmerId: report.farmerId,
            reportType: report.reportType,
            generatedAt: report.createdAt,
            generatedBy: {
              name: getUserDisplayName(report.generatedBy),
              role: report.generatedBy.role
            }
          })),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      if (error instanceof AppErrorClass) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Error getting all reports:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  static async getReportById(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const userId = req.user!.id;

      const report = await ReportService.prisma.reportGeneration.findUnique({
        where: { reportId },
        include: {
          generatedBy: {
            select: { id: true, profile: true, email: true, phone: true, role: true }
          }
        }
      });

      if (!report) {
        throw new NotFoundError('Report not found');
      }

      // Verify user has permission to view this report
      const user = await ReportService.prisma.user.findUnique({
        where: { id: userId },
        include: { organization: true }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Check if user can access this report (same organization or generated by them)
      if (report.generatedById !== userId && user.role !== 'FARM_ADMIN') {
        // For field managers, check if they have access to the lorry
        const lorry = await ReportService.prisma.lorry.findUnique({
          where: { id: report.lorryId }
        });

        if (!lorry || (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId)) {
          throw new ForbiddenError('You do not have permission to view this report');
        }
      }

      res.json({
        success: true,
        message: 'Report retrieved successfully',
        data: {
          id: report.id,
          reportId: report.reportId,
          lorryId: report.lorryId,
          farmerId: report.farmerId,
          reportType: report.reportType,
          reportData: JSON.parse(report.reportData as string),
          generatedAt: report.createdAt,
          generatedBy: {
            name: getUserDisplayName(report.generatedBy),
            role: report.generatedBy.role
          }
        }
      });
    } catch (error) {
      if (error instanceof AppErrorClass) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      
      console.error('Error getting report by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}