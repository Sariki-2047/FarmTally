"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invitation_service_simple_1 = require("../services/invitation.service.simple");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/field-manager', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, firstName, lastName, message } = req.body;
    if (!email || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            error: 'Email, first name, and last name are required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can invite field managers'
        });
    }
    try {
        const farmAdmin = await invitation_service_simple_1.invitationService.getFarmAdminWithOrganization(req.user.id);
        const invitation = await invitation_service_simple_1.invitationService.createInvitation({
            email: email.toLowerCase(),
            role: 'FIELD_MANAGER',
            organizationName: farmAdmin.organization.name,
            invitedBy: req.user.id,
            firstName,
            lastName,
            message,
            expiresInDays: 7
        }, req.user.id);
        res.status(201).json({
            success: true,
            data: {
                id: invitation.id,
                email: invitation.email,
                firstName,
                lastName,
                role: invitation.role,
                organizationName: invitation.organizationName,
                expiresAt: invitation.expiresAt,
                invitationLink: `${req.protocol}://${req.get('host')}/register?token=${invitation.invitationToken}`
            },
            message: 'Field Manager invitation sent successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/my-invitations', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can view invitations'
        });
    }
    try {
        const invitations = await invitation_service_simple_1.invitationService.getInvitations(req.user.organizationId);
        res.json({
            success: true,
            data: invitations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/field-managers', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can view field managers'
        });
    }
    try {
        const fieldManagers = await invitation_service_simple_1.invitationService.getFieldManagers(req.user.organizationId);
        res.json({
            success: true,
            data: fieldManagers
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, role, organizationName, expiresInDays } = req.body;
    if (!email || !role || !organizationName) {
        return res.status(400).json({
            success: false,
            error: 'Email, role, and organization name are required'
        });
    }
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can send invitations'
        });
    }
    try {
        const invitation = await invitation_service_simple_1.invitationService.createInvitation({
            email: email.toLowerCase(),
            role,
            organizationName,
            invitedBy: req.user.id,
            expiresInDays
        }, req.user.id);
        res.status(201).json({
            success: true,
            data: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                organizationName: invitation.organizationName,
                expiresAt: invitation.expiresAt,
                invitationLink: `${req.protocol}://${req.get('host')}/register?token=${invitation.invitationToken}`
            },
            message: 'Invitation created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/validate/:token', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    try {
        const invitation = await invitation_service_simple_1.invitationService.validateInvitation(token);
        res.json({
            success: true,
            data: {
                email: invitation.email,
                role: invitation.role,
                organizationName: invitation.organizationName,
                expiresAt: invitation.expiresAt
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/register/:token', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token } = req.params;
    const { password, firstName, lastName } = req.body;
    if (!password || !firstName || !lastName) {
        return res.status(400).json({
            success: false,
            error: 'Password, first name, and last name are required'
        });
    }
    try {
        const result = await invitation_service_simple_1.invitationService.registerWithInvitation(token, {
            password,
            firstName,
            lastName
        });
        res.status(201).json({
            success: true,
            data: result,
            message: 'Account created successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.get('/', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can view invitations'
        });
    }
    try {
        const invitations = await invitation_service_simple_1.invitationService.getInvitations(req.user.organizationId);
        res.json({
            success: true,
            data: invitations
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}));
router.post('/:invitationId/resend', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { invitationId } = req.params;
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can resend invitations'
        });
    }
    try {
        const invitation = await invitation_service_simple_1.invitationService.resendInvitation(invitationId);
        res.json({
            success: true,
            data: {
                id: invitation.id,
                email: invitation.email,
                expiresAt: invitation.expiresAt,
                invitationLink: `${req.protocol}://${req.get('host')}/register?token=${invitation.invitationToken}`
            },
            message: 'Invitation resent successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
router.delete('/:invitationId', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { invitationId } = req.params;
    if (req.user.role !== 'FARM_ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only farm admins can cancel invitations'
        });
    }
    try {
        await invitation_service_simple_1.invitationService.cancelInvitation(invitationId);
        res.json({
            success: true,
            message: 'Invitation cancelled successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}));
exports.default = router;
//# sourceMappingURL=invitation.simple.js.map