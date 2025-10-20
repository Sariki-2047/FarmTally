"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationController = void 0;
const organization_service_1 = require("../services/organization.service");
class OrganizationController {
    organizationService;
    constructor() {
        this.organizationService = new organization_service_1.OrganizationService();
    }
    createOrganization = async (req, res, next) => {
        try {
            const ownerId = req.user.id;
            const organization = await this.organizationService.createOrganization(ownerId, req.body);
            res.status(201).json({
                success: true,
                message: 'Organization created successfully',
                data: { organization },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getOrganization = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const organization = await this.organizationService.getOrganization(organizationId, userId);
            res.json({
                success: true,
                message: 'Organization retrieved successfully',
                data: { organization },
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateOrganization = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const organization = await this.organizationService.updateOrganization(organizationId, userId, req.body);
            res.json({
                success: true,
                message: 'Organization updated successfully',
                data: { organization },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getOrganizationUsers = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const users = await this.organizationService.getOrganizationUsers(organizationId, userId);
            res.json({
                success: true,
                message: 'Organization users retrieved successfully',
                data: { users },
            });
        }
        catch (error) {
            next(error);
        }
    };
    inviteUser = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const inviterId = req.user.id;
            const user = await this.organizationService.inviteUser(organizationId, inviterId, req.body);
            res.status(201).json({
                success: true,
                message: 'User invited successfully',
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    };
    removeUser = async (req, res, next) => {
        try {
            const { organizationId, userId: userIdToRemove } = req.params;
            const ownerId = req.user.id;
            await this.organizationService.removeUser(organizationId, ownerId, userIdToRemove);
            res.json({
                success: true,
                message: 'User removed successfully',
            });
        }
        catch (error) {
            next(error);
        }
    };
    getOrganizationStats = async (req, res, next) => {
        try {
            const { organizationId } = req.params;
            const userId = req.user.id;
            const stats = await this.organizationService.getOrganizationStats(organizationId, userId);
            res.json({
                success: true,
                message: 'Organization statistics retrieved successfully',
                data: { stats },
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.OrganizationController = OrganizationController;
//# sourceMappingURL=organization.controller.js.map