import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { db } from '../config/database';
import { redisClient } from '../config/redis';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import { User, AuthResponse, TokenPayload } from '../types';
import logger from '../utils/logger';

export class AuthService {
  async register(
    email: string,
    password: string,
    phone: string | undefined,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db('users').where({ email }).first();
      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const userId = uuidv4();
      const [user] = await db('users')
        .insert({
          user_id: userId,
          email,
          phone,
          password_hash: passwordHash,
          twofa_enabled: false,
          voter_registration_verified: false,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Create user profile
      await db('user_profiles').insert({
        user_id: userId,
        first_name: firstName,
        last_name: lastName,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.user_id,
        email: user.email,
        verified: false,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      await redisClient.setEx(
        `refresh_token:${userId}`,
        7 * 24 * 60 * 60, // 7 days
        refreshToken
      );

      logger.info(`User registered: ${email}`);

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          phone: user.phone,
          twofa_enabled: user.twofa_enabled,
          voter_registration_verified: user.voter_registration_verified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Find user
      const user = await db('users').where({ email }).first();
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Check if 2FA is enabled
      if (user.twofa_enabled) {
        // Return temporary token that requires 2FA verification
        return {
          user: {
            user_id: user.user_id,
            email: user.email,
          },
          accessToken: '',
          refreshToken: '',
          requiresTwoFactor: true,
        };
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.user_id,
        email: user.email,
        verified: user.voter_registration_verified,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token in Redis
      await redisClient.setEx(
        `refresh_token:${user.user_id}`,
        7 * 24 * 60 * 60,
        refreshToken
      );

      logger.info(`User logged in: ${email}`);

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          phone: user.phone,
          twofa_enabled: user.twofa_enabled,
          voter_registration_verified: user.voter_registration_verified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async setupTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const user = await db('users').where({ user_id: userId }).first();
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `Civic Voice (${user.email})`,
        issuer: 'Civic Voice',
      });

      // Store secret temporarily (will be confirmed when verified)
      await redisClient.setEx(
        `2fa_setup:${userId}`,
        10 * 60, // 10 minutes
        secret.base32
      );

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

      return {
        secret: secret.base32,
        qrCode,
      };
    } catch (error) {
      logger.error('Setup 2FA error:', error);
      throw error;
    }
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    try {
      const secret = await redisClient.get(`2fa_setup:${userId}`);
      if (!secret) {
        throw new AppError('2FA setup expired or not found', 400);
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        throw new AppError('Invalid verification code', 400);
      }

      // Enable 2FA for user
      await db('users')
        .where({ user_id: userId })
        .update({
          twofa_enabled: true,
          twofa_secret: secret,
          updated_at: new Date(),
        });

      // Clean up setup token
      await redisClient.del(`2fa_setup:${userId}`);

      logger.info(`2FA enabled for user: ${userId}`);
    } catch (error) {
      logger.error('Enable 2FA error:', error);
      throw error;
    }
  }

  async verifyTwoFactor(userId: string, token: string): Promise<AuthResponse> {
    try {
      const user = await db('users').where({ user_id: userId }).first();
      if (!user || !user.twofa_enabled || !user.twofa_secret) {
        throw new AppError('Invalid request', 400);
      }

      // Verify token
      const verified = speakeasy.totp.verify({
        secret: user.twofa_secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!verified) {
        throw new AppError('Invalid verification code', 400);
      }

      // Generate tokens
      const tokenPayload: TokenPayload = {
        userId: user.user_id,
        email: user.email,
        verified: user.voter_registration_verified,
      };

      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Store refresh token
      await redisClient.setEx(
        `refresh_token:${user.user_id}`,
        7 * 24 * 60 * 60,
        refreshToken
      );

      return {
        user: {
          user_id: user.user_id,
          email: user.email,
          phone: user.phone,
          twofa_enabled: user.twofa_enabled,
          voter_registration_verified: user.voter_registration_verified,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Verify 2FA error:', error);
      throw error;
    }
  }

  async logout(userId: string): Promise<void> {
    try {
      await redisClient.del(`refresh_token:${userId}`);
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }
}

export default new AuthService();
