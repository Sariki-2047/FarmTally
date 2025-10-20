"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
const report_service_1 = require("../services/report.service");
const error_middleware_1 = require("../middleware/error.middleware");
function getUserDisplayName(user) {
    if (user.profile && typeof user.profile === 'object') {
        const profile = user.profile;
        if (profile.firstName && profile.lastName) {
            return `${profile.firstName} ${profile.lastName}`;
        }
        if (profile.firstName)
            return profile.firstName;
        if (profile.lastName)
            return profile.lastName;
    }
    return user.email || user.phone || 'Unknown User';
}
class ReportController {
    static async generateFarmerReport(req, res) {
        try {
            const { lorryId, farmerId } = req.params;
            const userId = req.user.id;
            const reportData = await report_service_1.ReportService.generateFarmerReport(lorryId, farmerId, userId);
            res.json({
                success: true,
                message: 'Farmer report generated successfully',
                data: reportData
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppErrorClass) {
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
    static async generateFarmerReportText(req, res) {
        try {
            const { lorryId, farmerId } = req.params;
            const userId = req.user.id;
            const reportData = await report_service_1.ReportService.generateFarmerReport(lorryId, farmerId, userId);
            const textReport = await report_service_1.ReportService.generateTextReport(reportData);
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename="farmer-report-${reportData.farmer.name}-${reportData.reportId}.txt"`);
            res.send(textReport);
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppErrorClass) {
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
    static async getLorryReports(req, res) {
        try {
            const { lorryId } = req.params;
            const userId = req.user.id;
            const reports = await report_service_1.ReportService.getLorryReports(lorryId, userId);
            res.json({
                success: true,
                message: 'Lorry reports retrieved successfully',
                data: reports
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppErrorClass) {
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
    static async getAllReports(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10, lorryId, farmerId, reportType } = req.query;
            const user = await report_service_1.ReportService.prisma.user.findUnique({
                where: { id: userId },
                include: { organization: true }
            });
            if (!user) {
                throw new error_middleware_1.NotFoundError('User not found');
            }
            const filters = {};
            if (lorryId)
                filters.lorryId = lorryId;
            if (farmerId)
                filters.farmerId = farmerId;
            if (reportType)
                filters.reportType = reportType;
            const skip = (Number(page) - 1) * Number(limit);
            const reports = await report_service_1.ReportService.prisma.reportGeneration.findMany({
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
            const total = await report_service_1.ReportService.prisma.reportGeneration.count({
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
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppErrorClass) {
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
    static async getReportById(req, res) {
        try {
            const { reportId } = req.params;
            const userId = req.user.id;
            const report = await report_service_1.ReportService.prisma.reportGeneration.findUnique({
                where: { reportId },
                include: {
                    generatedBy: {
                        select: { id: true, profile: true, email: true, phone: true, role: true }
                    }
                }
            });
            if (!report) {
                throw new error_middleware_1.NotFoundError('Report not found');
            }
            const user = await report_service_1.ReportService.prisma.user.findUnique({
                where: { id: userId },
                include: { organization: true }
            });
            if (!user) {
                throw new error_middleware_1.NotFoundError('User not found');
            }
            if (report.generatedById !== userId && user.role !== 'FARM_ADMIN') {
                const lorry = await report_service_1.ReportService.prisma.lorry.findUnique({
                    where: { id: report.lorryId }
                });
                if (!lorry || (user.role === 'FIELD_MANAGER' && lorry.assignedManagerId !== userId)) {
                    throw new error_middleware_1.ForbiddenError('You do not have permission to view this report');
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
                    reportData: JSON.parse(report.reportData),
                    generatedAt: report.createdAt,
                    generatedBy: {
                        name: getUserDisplayName(report.generatedBy),
                        role: report.generatedBy.role
                    }
                }
            });
        }
        catch (error) {
            if (error instanceof error_middleware_1.AppErrorClass) {
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
exports.ReportController = ReportController;
//# sourceMappingURL=report.controller.js.map