"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use((0, auth_middleware_1.requireRole)(['FARM_ADMIN']));
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
exports.default = router;
//# sourceMappingURL=farm-admin.routes.js.map