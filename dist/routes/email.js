"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.use((0, auth_middleware_1.requireRole)(['FARM_ADMIN']));
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
exports.default = router;
//# sourceMappingURL=email.js.map