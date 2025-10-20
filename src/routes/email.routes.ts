import { Router } from 'express';
import {
  testEmailConfig,
  sendLorryRequestNotification,
  getEmailStatus,
  sendBulkNotifications
} from '../controllers/email.controller';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All email routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/email/status
 * @desc    Get email configuration status
 * @access  Farm Admin only
 */
router.get('/status', requireRole(['FARM_ADMIN']), getEmailStatus);

/**
 * @route   POST /api/email/test
 * @desc    Test email configuration
 * @access  Farm Admin only
 */
router.post('/test', requireRole(['FARM_ADMIN']), testEmailConfig);

/**
 * @route   POST /api/email/lorry-request/:requestId
 * @desc    Send lorry request notification manually
 * @access  Farm Admin only
 */
router.post('/lorry-request/:requestId', requireRole(['FARM_ADMIN']), sendLorryRequestNotification);

/**
 * @route   POST /api/email/bulk
 * @desc    Send bulk notification emails
 * @access  Farm Admin only
 */
router.post('/bulk', requireRole(['FARM_ADMIN']), sendBulkNotifications);

export default router;