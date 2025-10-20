"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LorryRequestController = void 0;
const lorry_request_service_1 = require("../services/lorry-request.service");
class LorryRequestController {
    lorryRequestService;
    constructor() {
        this.lorryRequestService = new lorry_request_service_1.LorryRequestService();
    }
    createLorryRequest = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const managerId = req.user.id;
            const request = await this.lorryRequestService.createLorryRequest(organizationId, managerId, req.body);
            res.status(201).json({
                success: true,
                message: 'Lorry request created successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getLorryRequests = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const { status, priority, managerId, startDate, endDate, page = '1', limit = '20', } = req.query;
            const filters = {
                status: status,
                priority: priority,
                managerId: managerId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            };
            const result = await this.lorryRequestService.getLorryRequests(organizationId, userId, filters, parseInt(page), parseInt(limit));
            res.json({
                success: true,
                message: 'Lorry requests retrieved successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getLorryRequestById = async (req, res, next) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const request = await this.lorryRequestService.getLorryRequestById(requestId, userId);
            res.json({
                success: true,
                message: 'Lorry request retrieved successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateLorryRequest = async (req, res, next) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const request = await this.lorryRequestService.updateLorryRequest(requestId, userId, req.body);
            res.json({
                success: true,
                message: 'Lorry request updated successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    approveLorryRequest = async (req, res, next) => {
        try {
            const { requestId } = req.params;
            const approverId = req.user.id;
            const request = await this.lorryRequestService.approveLorryRequest(requestId, approverId, req.body);
            res.json({
                success: true,
                message: 'Lorry request approved successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    rejectLorryRequest = async (req, res, next) => {
        try {
            const { requestId } = req.params;
            const approverId = req.user.id;
            const request = await this.lorryRequestService.rejectLorryRequest(requestId, approverId, req.body);
            res.json({
                success: true,
                message: 'Lorry request rejected successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    cancelLorryRequest = async (req, res, next) => {
        try {
            const { requestId } = req.params;
            const userId = req.user.id;
            const request = await this.lorryRequestService.cancelLorryRequest(requestId, userId);
            res.json({
                success: true,
                message: 'Lorry request cancelled successfully',
                data: { request },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getLorryRequestStats = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const stats = await this.lorryRequestService.getLorryRequestStats(organizationId, userId);
            res.json({
                success: true,
                message: 'Lorry request statistics retrieved successfully',
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.LorryRequestController = LorryRequestController;
//# sourceMappingURL=lorry-request.controller.js.map