import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authMiddleware, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Generate farmer report (JSON format)
router.post('/farmer/:lorryId/:farmerId', 
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  ReportController.generateFarmerReport
);

// Generate farmer report (Text format for download)
router.get('/farmer/:lorryId/:farmerId/download', 
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  ReportController.generateFarmerReportText
);

// Get all reports for a lorry
router.get('/lorry/:lorryId', 
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  ReportController.getLorryReports
);

// Get all reports with pagination and filters
router.get('/', 
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  ReportController.getAllReports
);

// Get specific report by ID
router.get('/:reportId', 
  requireRole(['FARM_ADMIN', 'FIELD_MANAGER']),
  ReportController.getReportById
);

export default router;