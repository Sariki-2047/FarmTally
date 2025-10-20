import express from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authSchemas } from '../utils/validation';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);
router.post('/refresh-token', validate(authSchemas.refreshToken), authController.refreshToken);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.post('/change-password', authMiddleware, validate(authSchemas.changePassword), authController.changePassword);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);

// Password reset routes (to be implemented later with email service)
// router.post('/forgot-password', validate(authSchemas.forgotPassword), authController.forgotPassword);
// router.post('/reset-password', validate(authSchemas.resetPassword), authController.resetPassword);

export default router;