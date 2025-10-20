import express from 'express';
import { requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// Email routes for admin use
router.use(requireRole(['FARM_ADMIN']));

// Placeholder routes - to be implemented later with email service
router.post('/send', (req, res) => {
  res.json({ 
    message: 'Email sending - to be implemented with email service',
    data: { success: true }
  });
});

router.get('/templates', (req, res) => {
  res.json({ 
    message: 'Email templates - to be implemented',
    data: { templates: [] }
  });
});

export default router;