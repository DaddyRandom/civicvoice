import { Router } from 'express';
import officialController from '../controllers/officialController';
import { authenticate, optionalAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes
router.get('/search', apiLimiter, officialController.searchByAddress);
router.get('/search-name', apiLimiter, officialController.searchOfficials);
router.get('/list', apiLimiter, officialController.getOfficials);
router.get('/:id', apiLimiter, officialController.getOfficialById);

// Protected routes
router.get('/my/officials', authenticate, officialController.getMyOfficials);

// Admin routes (TODO: Add admin middleware)
router.post('/sync/federal', authenticate, officialController.syncFederalOfficials);

export default router;
