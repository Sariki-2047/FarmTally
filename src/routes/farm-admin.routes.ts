import express from 'express';
import { requireRole } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require FARM_ADMIN role
router.use(requireRole(['FARM_ADMIN']));

// Placeholder routes - to be implemented
router.get('/dashboard', (req, res) => {
  res.json({ 
    message: 'Farm Admin dashboard - to be implemented',
    data: {
      stats: {
        totalLorries: 0,
        totalManagers: 0,
        totalFarmers: 0,
        pendingRequests: 0,
      }
    }
  });
});

router.get('/lorries', (req, res) => {
  res.json({ 
    message: 'Lorry management - to be implemented',
    data: { lorries: [] }
  });
});

router.get('/requests', (req, res) => {
  res.json({ 
    message: 'Lorry requests management - to be implemented',
    data: { requests: [] }
  });
});

export default router;