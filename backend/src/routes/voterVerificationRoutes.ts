import { Router } from 'express';
import voterVerificationController from '../controllers/voterVerificationController';
import { authenticate } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Submit voter verification
router.post('/', apiLimiter, voterVerificationController.submitVerification);

// Get verification status
router.get('/status', voterVerificationController.getVerificationStatus);

// Admin routes (TODO: Add admin middleware)
router.get('/pending', voterVerificationController.getPendingVerifications);
router.post('/manual', voterVerificationController.manualVerification);

export default router;
