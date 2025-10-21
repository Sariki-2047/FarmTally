"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("../controllers/email.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/status', (0, auth_1.requireRole)(['FARM_ADMIN']), email_controller_1.getEmailStatus);
router.post('/test', (0, auth_1.requireRole)(['FARM_ADMIN']), email_controller_1.testEmailConfig);
router.post('/lorry-request/:requestId', (0, auth_1.requireRole)(['FARM_ADMIN']), email_controller_1.sendLorryRequestNotification);
router.post('/bulk', (0, auth_1.requireRole)(['FARM_ADMIN']), email_controller_1.sendBulkNotifications);
exports.default = router;
//# sourceMappingURL=email.routes.js.map