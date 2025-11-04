import { Router } from 'express';
import letterController from '../controllers/letterController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { letterLimiter, apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public/optional auth routes
router.get('/community', optionalAuth, apiLimiter, letterController.getCommunityLetters);
router.get('/:id', optionalAuth, letterController.getLetterById);

// Protected routes - require authentication
router.post('/', authenticate, letterLimiter, letterController.createLetter);
router.patch('/:id', authenticate, letterController.updateLetter);
router.post('/:id/send', authenticate, letterLimiter, letterController.sendLetter);
router.post('/:id/pdf', authenticate, letterController.generatePDF);
router.get('/', authenticate, letterController.getUserLetters);
router.delete('/:id', authenticate, letterController.deleteLetter);

export default router;
