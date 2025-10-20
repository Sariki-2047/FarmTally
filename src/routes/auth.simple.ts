import express from 'express';
import { authService } from '../services/auth.service.simple';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }

  try {
    const result = await authService.login({ email, password });
    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(401).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, organizationName } = req.body;

  if (!email || !password || !firstName || !lastName || !role) {
    return res.status(400).json({ 
      success: false, 
      error: 'All fields are required' 
    });
  }

  try {
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      role,
      organizationName
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Get current user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  try {
    const user = await authService.getCurrentUser(req.user!.id);
    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(404).json({ 
      success: false, 
      error: error.message 
    });
  }
}));

// Health check for auth
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;