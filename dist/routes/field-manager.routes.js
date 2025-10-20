"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use((0, auth_middleware_1.requireRole)(['FIELD_MANAGER']));
router.get('/dashboard', (req, res) => {
    res.json({
        message: 'Field Manager dashboard - to be implemented',
        data: {
            stats: {
                assignedLorries: 0,
                pendingDeliveries: 0,
                completedDeliveries: 0,
            }
        }
    });
});
router.get('/lorries', (req, res) => {
    res.json({
        message: 'Assigned lorries - to be implemented',
        data: { lorries: [] }
    });
});
router.get('/deliveries', (req, res) => {
    res.json({
        message: 'Delivery management - to be implemented',
        data: { deliveries: [] }
    });
});
exports.default = router;
//# sourceMappingURL=field-manager.routes.js.map