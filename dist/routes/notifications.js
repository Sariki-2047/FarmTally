"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.authMiddleware);
router.get('/', (req, res) => {
    res.json({
        message: 'User notifications - to be implemented',
        data: { notifications: [] }
    });
});
router.put('/:notificationId/read', (req, res) => {
    res.json({
        message: 'Mark notification as read - to be implemented',
        data: { success: true }
    });
});
router.delete('/:notificationId', (req, res) => {
    res.json({
        message: 'Delete notification - to be implemented',
        data: { success: true }
    });
});
exports.default = router;
//# sourceMappingURL=notifications.js.map