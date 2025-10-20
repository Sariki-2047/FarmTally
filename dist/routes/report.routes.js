"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.post('/farmer/:lorryId/:farmerId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), report_controller_1.ReportController.generateFarmerReport);
router.get('/farmer/:lorryId/:farmerId/download', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), report_controller_1.ReportController.generateFarmerReportText);
router.get('/lorry/:lorryId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), report_controller_1.ReportController.getLorryReports);
router.get('/', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), report_controller_1.ReportController.getAllReports);
router.get('/:reportId', (0, auth_middleware_1.requireRole)(['FARM_ADMIN', 'FIELD_MANAGER']), report_controller_1.ReportController.getReportById);
exports.default = router;
//# sourceMappingURL=report.routes.js.map