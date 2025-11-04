import { Request, Response, NextFunction } from 'express';
import officialDirectoryService from '../services/officialDirectoryService';
import { AuthRequest, ApiResponse, PaginatedResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class OfficialController {
  searchByAddress = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { address } = req.query;

      if (!address || typeof address !== 'string') {
        throw new AppError('Address parameter is required', 400);
      }

      const officials = await officialDirectoryService.searchByAddress(address);

      const response: ApiResponse = {
        success: true,
        data: officials,
        message: `Found ${officials.length} officials`,
      };

      res.status(200).json(response);
    }
  );

  getMyOfficials = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const officials = await officialDirectoryService.getOfficialsByUserId(
        req.userId
      );

      const response: ApiResponse = {
        success: true,
        data: officials,
        message: `Found ${officials.length} officials`,
      };

      res.status(200).json(response);
    }
  );

  getOfficials = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { level, state, officeType, limit, offset } = req.query;

      const filters = {
        level: level as 'federal' | 'state' | 'local' | undefined,
        state: state as string | undefined,
        officeType: officeType as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      };

      const { officials, total } = await officialDirectoryService.getOfficials(
        filters
      );

      const page = Math.floor((filters.offset || 0) / (filters.limit || 50)) + 1;
      const limitValue = filters.limit || 50;

      const response: PaginatedResponse<typeof officials> = {
        success: true,
        data: officials,
        pagination: {
          page: page,
          limit: limitValue,
          total: total,
          totalPages: Math.ceil(total / limitValue),
        },
        message: `Found ${total} officials`,
      };

      res.status(200).json(response);
    }
  );

  getOfficialById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;

      const official = await officialDirectoryService.getOfficialById(id);

      const response: ApiResponse = {
        success: true,
        data: official,
        message: 'Official retrieved successfully',
      };

      res.status(200).json(response);
    }
  );

  searchOfficials = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        throw new AppError('Search query parameter (q) is required', 400);
      }

      const officials = await officialDirectoryService.searchOfficials(q);

      const response: ApiResponse = {
        success: true,
        data: officials,
        message: `Found ${officials.length} officials`,
      };

      res.status(200).json(response);
    }
  );

  // Admin endpoint to sync federal officials
  syncFederalOfficials = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      // TODO: Add admin role check
      if (!req.userId) {
        throw new AppError('Unauthorized', 401);
      }

      const officials = await officialDirectoryService.fetchFederalOfficials();

      const response: ApiResponse = {
        success: true,
        data: { count: officials.length },
        message: `Synced ${officials.length} federal officials`,
      };

      res.status(200).json(response);
    }
  );
}

export default new OfficialController();
