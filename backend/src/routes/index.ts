import { Router } from 'express';
import authRoutes from './authRoutes';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Mount routes
router.use(`/${API_VERSION}/auth`, authRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Civic Voice API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
