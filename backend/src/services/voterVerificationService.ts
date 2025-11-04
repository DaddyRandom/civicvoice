import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { VoterVerification } from '../types';
import logger from '../utils/logger';

interface AddressValidationResult {
  valid: boolean;
  standardizedAddress?: string;
  confidence?: number;
}

interface StateVerificationResult {
  verified: boolean;
  confidence: number;
  data?: any;
  error?: string;
}

export class VoterVerificationService {
  /**
   * Validate address using USPS API
   */
  async validateAddress(
    addressLine1: string,
    addressLine2: string | undefined,
    city: string,
    state: string,
    zipCode: string
  ): Promise<AddressValidationResult> {
    try {
      // If USPS API key is not configured, skip validation
      if (!process.env.USPS_API_KEY) {
        logger.warn('USPS API key not configured, skipping address validation');
        return {
          valid: true,
          standardizedAddress: `${addressLine1}, ${city}, ${state} ${zipCode}`,
          confidence: 0.5,
        };
      }

      // TODO: Implement actual USPS API call
      // For now, return a mock response
      const standardizedAddress = `${addressLine1}${
        addressLine2 ? ' ' + addressLine2 : ''
      }, ${city}, ${state} ${zipCode}`;

      return {
        valid: true,
        standardizedAddress,
        confidence: 0.8,
      };
    } catch (error) {
      logger.error('Address validation error:', error);
      return {
        valid: false,
        confidence: 0,
      };
    }
  }

  /**
   * Verify voter registration with state API
   * This is a placeholder - each state has different APIs
   */
  async verifyWithStateAPI(
    state: string,
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    address: string
  ): Promise<StateVerificationResult> {
    try {
      // State-specific API implementation would go here
      // For now, return a mock response based on state configuration

      switch (state) {
        case 'CA':
          // California - mock implementation
          return await this.verifyCalifornia(
            firstName,
            lastName,
            dateOfBirth,
            address
          );
        case 'FL':
          // Florida - mock implementation
          return await this.verifyFlorida(
            firstName,
            lastName,
            dateOfBirth,
            address
          );
        case 'TX':
          // Texas - mock implementation
          return await this.verifyTexas(
            firstName,
            lastName,
            dateOfBirth,
            address
          );
        default:
          // State API not available
          logger.info(`No state API available for ${state}`);
          return {
            verified: false,
            confidence: 0,
            error: 'State API not available',
          };
      }
    } catch (error) {
      logger.error('State API verification error:', error);
      return {
        verified: false,
        confidence: 0,
        error: 'State API verification failed',
      };
    }
  }

  /**
   * California voter verification (mock)
   */
  private async verifyCalifornia(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    address: string
  ): Promise<StateVerificationResult> {
    // TODO: Implement actual California voter registration API
    logger.info('California voter verification requested');
    return {
      verified: false,
      confidence: 0,
      error: 'California API not yet implemented',
    };
  }

  /**
   * Florida voter verification (mock)
   */
  private async verifyFlorida(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    address: string
  ): Promise<StateVerificationResult> {
    // TODO: Implement actual Florida voter registration API
    logger.info('Florida voter verification requested');
    return {
      verified: false,
      confidence: 0,
      error: 'Florida API not yet implemented',
    };
  }

  /**
   * Texas voter verification (mock)
   */
  private async verifyTexas(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    address: string
  ): Promise<StateVerificationResult> {
    // TODO: Implement actual Texas voter registration API
    logger.info('Texas voter verification requested');
    return {
      verified: false,
      confidence: 0,
      error: 'Texas API not yet implemented',
    };
  }

  /**
   * Fuzzy match algorithm for name comparison
   */
  private calculateNameMatch(name1: string, name2: string): number {
    // Simple Levenshtein distance-based matching
    // Returns a score between 0 and 1
    const normalize = (str: string) =>
      str.toLowerCase().trim().replace(/[^a-z]/g, '');

    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return 1.0;

    const maxLen = Math.max(n1.length, n2.length);
    const distance = this.levenshteinDistance(n1, n2);
    return 1 - distance / maxLen;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Submit voter verification request
   */
  async submitVerification(
    userId: string,
    data: {
      firstName: string;
      lastName: string;
      dateOfBirth: Date;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      zipCode: string;
    }
  ): Promise<VoterVerification> {
    try {
      // Check if user already has a pending or verified verification
      const existingVerification = await db('voter_verification')
        .where({ user_id: userId })
        .whereIn('verification_status', ['pending', 'verified'])
        .first();

      if (existingVerification) {
        if (existingVerification.verification_status === 'verified') {
          throw new AppError('User is already verified', 400);
        }
        throw new AppError('Verification request already pending', 400);
      }

      // Validate address
      const addressValidation = await this.validateAddress(
        data.addressLine1,
        data.addressLine2,
        data.city,
        data.state,
        data.zipCode
      );

      if (!addressValidation.valid) {
        throw new AppError('Invalid address', 400);
      }

      // Attempt state API verification
      const stateVerification = await this.verifyWithStateAPI(
        data.state,
        data.firstName,
        data.lastName,
        data.dateOfBirth,
        addressValidation.standardizedAddress || ''
      );

      // Determine verification status and confidence
      let verificationStatus: 'pending' | 'verified' | 'needs_review' =
        'pending';
      let confidenceScore = 0;
      let verificationMethod = 'pending';

      if (stateVerification.verified && stateVerification.confidence >= 0.9) {
        verificationStatus = 'verified';
        confidenceScore = stateVerification.confidence;
        verificationMethod = 'state_api';
      } else if (
        stateVerification.verified &&
        stateVerification.confidence >= 0.7
      ) {
        verificationStatus = 'needs_review';
        confidenceScore = stateVerification.confidence;
        verificationMethod = 'state_api';
      } else {
        // Will require manual review or alternate verification
        verificationStatus = 'needs_review';
        confidenceScore = addressValidation.confidence || 0;
        verificationMethod = 'manual';
      }

      // Create verification record
      const verificationId = uuidv4();
      const [verification] = await db('voter_verification')
        .insert({
          verification_id: verificationId,
          user_id: userId,
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          registration_address: addressValidation.standardizedAddress,
          verification_status: verificationStatus,
          verification_date:
            verificationStatus === 'verified' ? new Date() : null,
          state_api_response: stateVerification.data || null,
          confidence_score: confidenceScore,
          verification_method: verificationMethod,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // Update user profile
      await db('user_profiles').where({ user_id: userId }).update({
        first_name: data.firstName,
        last_name: data.lastName,
        date_of_birth: data.dateOfBirth,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        zip_code: data.zipCode,
        verified_at: verificationStatus === 'verified' ? new Date() : null,
        updated_at: new Date(),
      });

      // If verified, update user's verification status
      if (verificationStatus === 'verified') {
        await db('users').where({ user_id: userId }).update({
          voter_registration_verified: true,
          verification_state: data.state,
          updated_at: new Date(),
        });
      }

      logger.info(
        `Voter verification submitted for user ${userId}: ${verificationStatus}`
      );

      return verification;
    } catch (error) {
      logger.error('Submit verification error:', error);
      throw error;
    }
  }

  /**
   * Get verification status for a user
   */
  async getVerificationStatus(userId: string): Promise<VoterVerification | null> {
    try {
      const verification = await db('voter_verification')
        .where({ user_id: userId })
        .orderBy('created_at', 'desc')
        .first();

      return verification || null;
    } catch (error) {
      logger.error('Get verification status error:', error);
      throw error;
    }
  }

  /**
   * Get all pending verifications (admin only)
   */
  async getPendingVerifications(): Promise<VoterVerification[]> {
    try {
      const verifications = await db('voter_verification')
        .where({ verification_status: 'needs_review' })
        .orderBy('created_at', 'asc');

      return verifications;
    } catch (error) {
      logger.error('Get pending verifications error:', error);
      throw error;
    }
  }

  /**
   * Manual verification approval/rejection (admin only)
   */
  async manualVerification(
    verificationId: string,
    approved: boolean,
    rejectionReason?: string
  ): Promise<void> {
    try {
      const verification = await db('voter_verification')
        .where({ verification_id: verificationId })
        .first();

      if (!verification) {
        throw new AppError('Verification not found', 404);
      }

      const newStatus = approved ? 'verified' : 'rejected';

      await db('voter_verification')
        .where({ verification_id: verificationId })
        .update({
          verification_status: newStatus,
          verification_date: approved ? new Date() : null,
          rejection_reason: rejectionReason || null,
          verification_method: 'manual',
          updated_at: new Date(),
        });

      if (approved) {
        // Update user verification status
        await db('users').where({ user_id: verification.user_id }).update({
          voter_registration_verified: true,
          verification_state: verification.registration_address
            .split(',')
            .pop()
            ?.trim()
            .split(' ')[0],
          updated_at: new Date(),
        });

        // Update user profile
        await db('user_profiles')
          .where({ user_id: verification.user_id })
          .update({
            verified_at: new Date(),
            updated_at: new Date(),
          });
      }

      logger.info(
        `Manual verification ${approved ? 'approved' : 'rejected'} for verification ${verificationId}`
      );
    } catch (error) {
      logger.error('Manual verification error:', error);
      throw error;
    }
  }
}

export default new VoterVerificationService();
