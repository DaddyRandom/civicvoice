import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import { AuthRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import {
  registerSchema,
  loginSchema,
  verifyTwoFactorSchema,
  enableTwoFactorSchema,
} from '../validators/authValidators';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  register = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { email, password, phone, firstName, lastName } = value;
      const result = await authService.register(
        email,
        password,
        phone,
        firstName,
        lastName
      );

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Registration successful',
      };

      res.status(201).json(response);
    }
  );

  login = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { email, password } = value;
      const result = await authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: result.requiresTwoFactor
          ? 'Two-factor authentication required'
          : 'Login successful',
      };

      res.status(200).json(response);
    }
  );

  setupTwoFactor = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const result = await authService.setupTwoFactor(req.userId);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Scan the QR code with your authenticator app',
      };

      res.status(200).json(response);
    }
  );

  enableTwoFactor = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { error, value } = enableTwoFactorSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      await authService.enableTwoFactor(req.userId, value.token);

      const response: ApiResponse = {
        success: true,
        message: 'Two-factor authentication enabled successfully',
      };

      res.status(200).json(response);
    }
  );

  verifyTwoFactor = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { error, value } = verifyTwoFactorSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const { userId, token } = value;
      const result = await authService.verifyTwoFactor(userId, token);

      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Two-factor authentication successful',
      };

      res.status(200).json(response);
    }
  );

  logout = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      await authService.logout(req.userId);

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.status(200).json(response);
    }
  );

  me = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      // This would fetch full user details
      const response: ApiResponse = {
        success: true,
        data: { userId: req.userId },
        message: 'User details retrieved',
      };

      res.status(200).json(response);
    }
  );
}

export default new AuthController();
