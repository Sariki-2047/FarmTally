"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const system_admin_controller_1 = require("../controllers/system-admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/setup', system_admin_controller_1.createSystemAdmin);
router.use(auth_1.authenticateToken);
router.use((0, auth_1.requireRole)(['APPLICATION_ADMIN']));
router.get('/dashboard', system_admin_controller_1.getDashboardStats);
router.get('/users/pending', system_admin_controller_1.getPendingUsers);
router.get('/users/:userId', system_admin_controller_1.getUserDetails);
router.post('/users/:userId/approve', system_admin_controller_1.approveUser);
router.post('/users/:userId/reject', system_admin_controller_1.rejectUser);
router.post('/users/:userId/toggle-status', system_admin_controller_1.toggleUserStatus);
router.post('/users/bulk-approve', system_admin_controller_1.bulkApproveUsers);
router.get('/organizations', system_admin_controller_1.getAllOrganizations);
exports.default = router;
//# sourceMappingURL=system-admin.routes.js.map