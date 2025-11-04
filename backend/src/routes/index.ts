import { Router } from 'express';
import authRoutes from './authRoutes';
import voterVerificationRoutes from './voterVerificationRoutes';
import officialRoutes from './officialRoutes';
import letterRoutes from './letterRoutes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/${API_VERSION}/auth`, authRoutes);
router.use(`/${API_VERSION}/voter-verification`, voterVerificationRoutes);
router.use(`/${API_VERSION}/officials`, officialRoutes);
router.use(`/${API_VERSION}/letters`, letterRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Civic Voice API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
