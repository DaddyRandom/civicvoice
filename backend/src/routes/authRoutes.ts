import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/verify-2fa', authLimiter, authController.verifyTwoFactor);

// Protected routes
router.get('/me', authenticate, authController.me);
router.post('/setup-2fa', authenticate, authController.setupTwoFactor);
router.post('/enable-2fa', authenticate, authController.enableTwoFactor);
router.post('/logout', authenticate, authController.logout);

export default router;
