"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validation_1 = require("../utils/validation");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const authController = new auth_controller_1.AuthController();
router.post('/register', (0, validation_middleware_1.validate)(validation_1.authSchemas.register), authController.register);
router.post('/login', (0, validation_middleware_1.validate)(validation_1.authSchemas.login), authController.login);
router.post('/refresh-token', (0, validation_middleware_1.validate)(validation_1.authSchemas.refreshToken), authController.refreshToken);
router.post('/logout', auth_middleware_1.authMiddleware, authController.logout);
router.post('/change-password', auth_middleware_1.authMiddleware, (0, validation_middleware_1.validate)(validation_1.authSchemas.changePassword), authController.changePassword);
router.get('/profile', auth_middleware_1.authMiddleware, authController.getProfile);
router.put('/profile', auth_middleware_1.authMiddleware, authController.updateProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map