import express from 'express';
import { invitationService } from '../services/invitation.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Send Field Manager invitation (specific endpoint for Farm Admin)
router.post('/field-manager', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { email, firstName, lastName, message } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'Email, first name, and last name are required'
    });
  }

  // Only Farm Admin can invite Field Managers
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can invite field managers'
    });
  }

  try {
    // Get the Farm Admin's organization
    const farmAdmin = await invitationService.getFarmAdminWithOrganization(req.user!.id);
    
    const invitation = await invitationService.createInvitation(
      {
        email: email.toLowerCase(),
        role: 'FIELD_MANAGER',
        organizationName: farmAdmin.organization.name,
        invitedBy: req.user!.id,
        firstName,
        lastName,
        message,
        expiresInDays: 7 // 7 days expiry
      },
      req.user!.id
    );

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Get my invitations (for Farm Admin dashboard)
router.get('/my-invitations', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can view invitations'
    });
  }

  try {
    const invitations = await invitationService.getInvitations(req.user!.organizationId);

    res.json({
      success: true,
      data: invitations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Get field managers for Farm Admin dashboard
router.get('/field-managers', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can view field managers'
    });
  }

  try {
    const fieldManagers = await invitationService.getFieldManagers(req.user!.organizationId);

    res.json({
      success: true,
      data: fieldManagers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Create invitation (Farm Admin or Super Admin only)
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { email, role, organizationName, expiresInDays } = req.body;

  if (!email || !role || !organizationName) {
    return res.status(400).json({
      success: false,
      error: 'Email, role, and organization name are required'
    });
  }

  // Only Farm Admin can invite Field Managers
  // Only Super Admin can invite Farm Admins (for now, we'll allow Farm Admin to invite other Farm Admins)
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can send invitations'
    });
  }

  try {
    const invitation = await invitationService.createInvitation(
      {
        email: email.toLowerCase(),
        role,
        organizationName,
        invitedBy: req.user!.id,
        expiresInDays
      },
      req.user!.id
    );

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Validate invitation token
router.get('/validate/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const invitation = await invitationService.validateInvitation(token);

    res.json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organizationName,
        expiresAt: invitation.expiresAt
      }
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Register with invitation token
router.post('/register/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, firstName, lastName } = req.body;

  if (!password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      error: 'Password, first name, and last name are required'
    });
  }

  try {
    const result = await invitationService.registerWithInvitation(token, {
      password,
      firstName,
      lastName
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Account created successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Get all invitations (Farm Admin only)
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can view invitations'
    });
  }

  try {
    const invitations = await invitationService.getInvitations(req.user!.organizationId);

    res.json({
      success: true,
      data: invitations
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}));

// Resend invitation
router.post('/:invitationId/resend', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { invitationId } = req.params;

  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can resend invitations'
    });
  }

  try {
    const invitation = await invitationService.resendInvitation(invitationId);

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
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// Cancel invitation
router.delete('/:invitationId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { invitationId } = req.params;

  if (req.user!.role !== 'FARM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only farm admins can cancel invitations'
    });
  }

  try {
    await invitationService.cancelInvitation(invitationId);

    res.json({
      success: true,
      message: 'Invitation cancelled successfully'
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

export default router;