import { Response, NextFunction } from 'express';
import voterVerificationService from '../services/voterVerificationService';
import { AuthRequest, ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import {
  voterVerificationSchema,
  manualVerificationSchema,
} from '../validators/voterValidators';
import { AppError } from '../middleware/errorHandler';

export class VoterVerificationController {
  submitVerification = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { error, value } = voterVerificationSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const verification = await voterVerificationService.submitVerification(
        req.userId,
        {
          firstName: value.firstName,
          lastName: value.lastName,
          dateOfBirth: new Date(value.dateOfBirth),
          addressLine1: value.addressLine1,
          addressLine2: value.addressLine2,
          city: value.city,
          state: value.state,
          zipCode: value.zipCode,
        }
      );

      const response: ApiResponse = {
        success: true,
        data: {
          verificationId: verification.verification_id,
          status: verification.verification_status,
          confidenceScore: verification.confidence_score,
          message:
            verification.verification_status === 'verified'
              ? 'Voter registration verified successfully'
              : verification.verification_status === 'needs_review'
              ? 'Your verification is under review'
              : 'Verification request submitted',
        },
        message: 'Verification submitted successfully',
      };

      res.status(201).json(response);
    }
  );

  getVerificationStatus = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const verification = await voterVerificationService.getVerificationStatus(
        req.userId
      );

      const response: ApiResponse = {
        success: true,
        data: verification,
        message: verification
          ? 'Verification status retrieved'
          : 'No verification found',
      };

      res.status(200).json(response);
    }
  );

  getPendingVerifications = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      // TODO: Add admin role check
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const verifications =
        await voterVerificationService.getPendingVerifications();

      const response: ApiResponse = {
        success: true,
        data: verifications,
        message: `Found ${verifications.length} pending verifications`,
      };

      res.status(200).json(response);
    }
  );

  manualVerification = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      // TODO: Add admin role check
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { error, value } = manualVerificationSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      await voterVerificationService.manualVerification(
        value.verificationId,
        value.approved,
        value.rejectionReason
      );

      const response: ApiResponse = {
        success: true,
        message: `Verification ${
          value.approved ? 'approved' : 'rejected'
        } successfully`,
      };

      res.status(200).json(response);
    }
  );
}

export default new VoterVerificationController();
