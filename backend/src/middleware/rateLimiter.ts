import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Limiter for letter sending
export const letterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 letters per hour
  message: 'You have reached the maximum number of letters per hour.',
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated
    return (req as any).userId || req.ip;
  },
});

// Limiter for petition creation
export const petitionLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 petitions per day
  message: 'You have reached the maximum number of petitions per day.',
  keyGenerator: (req: Request) => {
    return (req as any).userId || req.ip;
  },
});

// Limiter for signature submission
export const signatureLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 signatures per minute
  message: 'Please slow down when signing petitions.',
});
