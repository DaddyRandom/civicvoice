import { Response, NextFunction } from 'express';
import letterService from '../services/letterService';
import { AuthRequest, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createLetterSchema,
  updateLetterSchema,
} from '../validators/letterValidators';
import { AppError } from '../middleware/errorHandler';

export class LetterController {
  createLetter = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { error, value } = createLetterSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const letter = await letterService.createLetter(req.userId, value);

      const response: ApiResponse = {
        success: true,
        data: letter,
        message: 'Letter created successfully',
      };

      res.status(201).json(response);
    }
  );

  updateLetter = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const { error, value } = updateLetterSchema.validate(req.body);
      if (error) {
        throw new AppError(error.details[0].message, 400);
      }

      const letter = await letterService.updateLetter(req.userId, id, value);

      const response: ApiResponse = {
        success: true,
        data: letter,
        message: 'Letter updated successfully',
      };

      res.status(200).json(response);
    }
  );

  sendLetter = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const letter = await letterService.sendLetter(req.userId, id);

      const response: ApiResponse = {
        success: true,
        data: letter,
        message: 'Letter sent successfully',
      };

      res.status(200).json(response);
    }
  );

  generatePDF = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const pdfUrl = await letterService.generatePDF(id);

      const response: ApiResponse = {
        success: true,
        data: { pdfUrl },
        message: 'PDF generated successfully',
      };

      res.status(200).json(response);
    }
  );

  getUserLetters = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { status, limit, offset } = req.query;

      const filters = {
        status: status as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const { letters, total } = await letterService.getUserLetters(
        req.userId,
        filters
      );

      const page =
        Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
      const limitValue = filters.limit || 20;

      const response: PaginatedResponse<typeof letters> = {
        success: true,
        data: letters,
        pagination: {
          page: page,
          limit: limitValue,
          total: total,
          totalPages: Math.ceil(total / limitValue),
        },
        message: `Found ${total} letters`,
      };

      res.status(200).json(response);
    }
  );

  getLetterById = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const letter = await letterService.getLetterById(id, req.userId);

      const response: ApiResponse = {
        success: true,
        data: letter,
        message: 'Letter retrieved successfully',
      };

      res.status(200).json(response);
    }
  );

  getCommunityLetters = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const { issueCategory, limit, offset } = req.query;

      const filters = {
        issueCategory: issueCategory as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const { letters, total } = await letterService.getCommunityLetters(filters);

      const page =
        Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1;
      const limitValue = filters.limit || 20;

      const response: PaginatedResponse<typeof letters> = {
        success: true,
        data: letters,
        pagination: {
          page: page,
          limit: limitValue,
          total: total,
          totalPages: Math.ceil(total / limitValue),
        },
        message: `Found ${total} community letters`,
      };

      res.status(200).json(response);
    }
  );

  deleteLetter = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      await letterService.deleteLetter(req.userId, id);

      const response: ApiResponse = {
        success: true,
        message: 'Letter deleted successfully',
      };

      res.status(200).json(response);
    }
  );
}

export default new LetterController();
