import { Router } from 'express';
import {
  getDashboardStats,
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllOrganizations,
  toggleUserStatus,
  createSystemAdmin,
  bulkApproveUsers,
  getUserDetails,
} from '../controllers/system-admin.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/system-admin/setup
 * @desc    Create the first system admin (no auth required for initial setup)
 * @access  Public (only works if no admin exists)
 */
router.post('/setup', createSystemAdmin);

// All other routes require authentication as APPLICATION_ADMIN
router.use(authenticateToken);
router.use(requireRole(['APPLICATION_ADMIN']));

/**
 * @route   GET /api/system-admin/dashboard
 * @desc    Get system admin dashboard statistics
 * @access  System Admin only
 */
router.get('/dashboard', getDashboardStats);

/**
 * @route   GET /api/system-admin/users/pending
 * @desc    Get all pending user registrations
 * @access  System Admin only
 */
router.get('/users/pending', getPendingUsers);

/**
 * @route   GET /api/system-admin/users/:userId
 * @desc    Get user details by ID
 * @access  System Admin only
 */
router.get('/users/:userId', getUserDetails);

/**
 * @route   POST /api/system-admin/users/:userId/approve
 * @desc    Approve a pending user registration
 * @access  System Admin only
 */
router.post('/users/:userId/approve', approveUser);

/**
 * @route   POST /api/system-admin/users/:userId/reject
 * @desc    Reject a pending user registration
 * @access  System Admin only
 */
router.post('/users/:userId/reject', rejectUser);

/**
 * @route   POST /api/system-admin/users/:userId/toggle-status
 * @desc    Suspend or reactivate a user
 * @access  System Admin only
 */
router.post('/users/:userId/toggle-status', toggleUserStatus);

/**
 * @route   POST /api/system-admin/users/bulk-approve
 * @desc    Bulk approve multiple users
 * @access  System Admin only
 */
router.post('/users/bulk-approve', bulkApproveUsers);

/**
 * @route   GET /api/system-admin/organizations
 * @desc    Get all organizations
 * @access  System Admin only
 */
router.get('/organizations', getAllOrganizations);

export default router;