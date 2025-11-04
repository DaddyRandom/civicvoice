import { v4 as uuidv4 } from 'uuid';
import PDFDocument from 'pdfkit';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Letter, Official } from '../types';
import logger from '../utils/logger';
import fs from 'fs';
import path from 'path';

interface CreateLetterData {
  officialId: string;
  subject: string;
  body: string;
  letterType: 'letter' | 'memo';
  issueCategory?: string;
  sealType?: 'state' | 'federal' | 'none';
  visibility: 'private' | 'community' | 'public';
}

export class LetterService {
  /**
   * Create a new letter (draft)
   */
  async createLetter(
    userId: string,
    data: CreateLetterData
  ): Promise<Letter> {
    try {
      // Verify official exists
      const official = await db('officials')
        .where({ official_id: data.officialId })
        .first();

      if (!official) {
        throw new AppError('Official not found', 404);
      }

      // Get user profile for sender info
      const profile = await db('user_profiles')
        .where({ user_id: userId })
        .first();

      if (!profile) {
        throw new AppError('User profile not found', 404);
      }

      // Create letter
      const letterId = uuidv4();
      const [letter] = await db('letters')
        .insert({
          letter_id: letterId,
          user_id: userId,
          official_id: data.officialId,
          subject: data.subject,
          body: data.body,
          letter_type: data.letterType,
          issue_category: data.issueCategory || null,
          seal_type: data.sealType || 'none',
          status: 'draft',
          visibility: data.visibility,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      logger.info(`Letter created: ${letterId} by user ${userId}`);

      return letter;
    } catch (error) {
      logger.error('Create letter error:', error);
      throw error;
    }
  }

  /**
   * Update letter (only if still in draft status)
   */
  async updateLetter(
    userId: string,
    letterId: string,
    updates: Partial<CreateLetterData>
  ): Promise<Letter> {
    try {
      const letter = await db('letters')
        .where({ letter_id: letterId, user_id: userId })
        .first();

      if (!letter) {
        throw new AppError('Letter not found', 404);
      }

      if (letter.status !== 'draft') {
        throw new AppError('Cannot update a letter that has been sent', 400);
      }

      const [updatedLetter] = await db('letters')
        .where({ letter_id: letterId })
        .update({
          ...updates,
          updated_at: new Date(),
        })
        .returning('*');

      logger.info(`Letter updated: ${letterId}`);

      return updatedLetter;
    } catch (error) {
      logger.error('Update letter error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF for letter
   */
  async generatePDF(letterId: string): Promise<string> {
    try {
      // Get letter with official and user info
      const letter = await db('letters')
        .join('officials', 'letters.official_id', 'officials.official_id')
        .join('user_profiles', 'letters.user_id', 'user_profiles.user_id')
        .join('users', 'letters.user_id', 'users.user_id')
        .where('letters.letter_id', letterId)
        .select(
          'letters.*',
          'officials.name as official_name',
          'officials.title as official_title',
          'officials.office_address',
          'user_profiles.first_name',
          'user_profiles.last_name',
          'user_profiles.address_line1',
          'user_profiles.address_line2',
          'user_profiles.city',
          'user_profiles.state',
          'user_profiles.zip_code',
          'users.email'
        )
        .first();

      if (!letter) {
        throw new AppError('Letter not found', 404);
      }

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads', 'letters');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const pdfPath = path.join(uploadsDir, `${letterId}.pdf`);
      const pdfDoc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(pdfPath);

      pdfDoc.pipe(stream);

      // Add letterhead/seal if specified
      if (letter.seal_type && letter.seal_type !== 'none') {
        // TODO: Add actual seal images
        pdfDoc
          .fontSize(10)
          .text(`[${letter.seal_type.toUpperCase()} SEAL]`, { align: 'center' })
          .moveDown(0.5);
      }

      // Add disclaimer
      pdfDoc
        .fontSize(8)
        .fillColor('#666')
        .text('Citizen Correspondence - Not Official Government Document', {
          align: 'center',
        })
        .fillColor('#000')
        .moveDown(1);

      // Sender information (top right)
      const senderAddress = `${letter.first_name} ${letter.last_name}\n${
        letter.address_line1
      }${letter.address_line2 ? '\n' + letter.address_line2 : ''}\n${
        letter.city
      }, ${letter.state} ${letter.zip_code}\n${letter.email}`;

      pdfDoc
        .fontSize(10)
        .text(senderAddress, { align: 'left' })
        .moveDown(1);

      // Date
      pdfDoc
        .fontSize(10)
        .text(new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }), { align: 'left' })
        .moveDown(1);

      // Recipient information
      const recipientAddress = `${letter.official_name}\n${letter.official_title}${
        letter.office_address ? '\n' + letter.office_address : ''
      }`;

      pdfDoc
        .fontSize(10)
        .text(recipientAddress, { align: 'left' })
        .moveDown(1.5);

      // Subject line (for memos)
      if (letter.letter_type === 'memo') {
        pdfDoc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`RE: ${letter.subject}`, { align: 'left' })
          .font('Helvetica')
          .moveDown(1);
      }

      // Salutation
      const salutation =
        letter.letter_type === 'letter'
          ? `Dear ${this.getSalutation(letter.official_title)} ${letter.official_name.split(' ').pop()},`
          : 'To Whom It May Concern:';

      pdfDoc
        .fontSize(11)
        .text(salutation, { align: 'left' })
        .moveDown(1);

      // Body text
      pdfDoc
        .fontSize(11)
        .text(letter.body, {
          align: 'justify',
          lineGap: 5,
        })
        .moveDown(2);

      // Closing
      pdfDoc
        .fontSize(11)
        .text('Sincerely,', { align: 'left' })
        .moveDown(2)
        .text(`${letter.first_name} ${letter.last_name}`, { align: 'left' });

      // Footer
      pdfDoc
        .moveDown(3)
        .fontSize(8)
        .fillColor('#999')
        .text('Generated via Civic Voice - www.civicvoice.org', {
          align: 'center',
        });

      // Finalize PDF
      pdfDoc.end();

      // Wait for PDF to be written
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Update letter with PDF URL
      const pdfUrl = `/uploads/letters/${letterId}.pdf`;
      await db('letters')
        .where({ letter_id: letterId })
        .update({
          pdf_url: pdfUrl,
          updated_at: new Date(),
        });

      logger.info(`PDF generated for letter: ${letterId}`);

      return pdfUrl;
    } catch (error) {
      logger.error('Generate PDF error:', error);
      throw error;
    }
  }

  /**
   * Get proper salutation based on title
   */
  private getSalutation(title: string): string {
    const lower = title.toLowerCase();

    if (lower.includes('president')) return 'President';
    if (lower.includes('senator')) return 'Senator';
    if (lower.includes('representative')) return 'Representative';
    if (lower.includes('governor')) return 'Governor';
    if (lower.includes('mayor')) return 'Mayor';
    if (lower.includes('council')) return 'Council Member';

    return 'Honorable';
  }

  /**
   * Send letter (mark as sent, generate PDF if not exists)
   */
  async sendLetter(userId: string, letterId: string): Promise<Letter> {
    try {
      const letter = await db('letters')
        .where({ letter_id: letterId, user_id: userId })
        .first();

      if (!letter) {
        throw new AppError('Letter not found', 404);
      }

      if (letter.status !== 'draft') {
        throw new AppError('Letter has already been sent', 400);
      }

      // Generate PDF if not exists
      if (!letter.pdf_url) {
        await this.generatePDF(letterId);
      }

      // Update status to sent
      const [sentLetter] = await db('letters')
        .where({ letter_id: letterId })
        .update({
          status: 'sent',
          sent_at: new Date(),
          updated_at: new Date(),
        })
        .returning('*');

      // TODO: Actually send the letter via email/fax if configured

      logger.info(`Letter sent: ${letterId}`);

      return sentLetter;
    } catch (error) {
      logger.error('Send letter error:', error);
      throw error;
    }
  }

  /**
   * Get user's letters
   */
  async getUserLetters(
    userId: string,
    filters?: {
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ letters: any[]; total: number }> {
    try {
      let query = db('letters')
        .join('officials', 'letters.official_id', 'officials.official_id')
        .where('letters.user_id', userId)
        .select(
          'letters.*',
          'officials.name as official_name',
          'officials.title as official_title',
          'officials.photo_url as official_photo'
        );

      if (filters?.status) {
        query = query.where('letters.status', filters.status);
      }

      // Get total count
      const [{ count }] = await query.clone().count('* as count');
      const total = parseInt(count as string);

      // Apply pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      query = query.limit(limit).offset(offset).orderBy('letters.created_at', 'desc');

      const letters = await query;

      return { letters, total };
    } catch (error) {
      logger.error('Get user letters error:', error);
      throw error;
    }
  }

  /**
   * Get letter by ID
   */
  async getLetterById(letterId: string, userId?: string): Promise<any> {
    try {
      const letter = await db('letters')
        .join('officials', 'letters.official_id', 'officials.official_id')
        .join('user_profiles', 'letters.user_id', 'user_profiles.user_id')
        .where('letters.letter_id', letterId)
        .select(
          'letters.*',
          'officials.name as official_name',
          'officials.title as official_title',
          'officials.photo_url as official_photo',
          'user_profiles.first_name',
          'user_profiles.last_name'
        )
        .first();

      if (!letter) {
        throw new AppError('Letter not found', 404);
      }

      // Check visibility permissions
      if (letter.visibility === 'private' && letter.user_id !== userId) {
        throw new AppError('Access denied', 403);
      }

      // Increment view count if public/community and not the owner
      if (letter.user_id !== userId && letter.visibility !== 'private') {
        await db('letters')
          .where({ letter_id: letterId })
          .increment('view_count', 1);
      }

      return letter;
    } catch (error) {
      logger.error('Get letter by ID error:', error);
      throw error;
    }
  }

  /**
   * Get community letters (public and community visibility)
   */
  async getCommunityLetters(filters?: {
    issueCategory?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ letters: any[]; total: number }> {
    try {
      let query = db('letters')
        .join('officials', 'letters.official_id', 'officials.official_id')
        .join('user_profiles', 'letters.user_id', 'user_profiles.user_id')
        .whereIn('letters.visibility', ['public', 'community'])
        .where('letters.status', 'sent')
        .select(
          'letters.letter_id',
          'letters.subject',
          'letters.issue_category',
          'letters.visibility',
          'letters.view_count',
          'letters.use_count',
          'letters.sent_at',
          'officials.name as official_name',
          'officials.title as official_title',
          'officials.photo_url as official_photo',
          'user_profiles.first_name',
          'user_profiles.last_name'
        );

      if (filters?.issueCategory) {
        query = query.where('letters.issue_category', filters.issueCategory);
      }

      // Get total count
      const [{ count }] = await query.clone().count('* as count');
      const total = parseInt(count as string);

      // Apply pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      query = query
        .limit(limit)
        .offset(offset)
        .orderBy('letters.view_count', 'desc')
        .orderBy('letters.sent_at', 'desc');

      const letters = await query;

      return { letters, total };
    } catch (error) {
      logger.error('Get community letters error:', error);
      throw error;
    }
  }

  /**
   * Delete letter (only if draft)
   */
  async deleteLetter(userId: string, letterId: string): Promise<void> {
    try {
      const letter = await db('letters')
        .where({ letter_id: letterId, user_id: userId })
        .first();

      if (!letter) {
        throw new AppError('Letter not found', 404);
      }

      if (letter.status !== 'draft') {
        throw new AppError('Cannot delete a letter that has been sent', 400);
      }

      await db('letters').where({ letter_id: letterId }).delete();

      logger.info(`Letter deleted: ${letterId}`);
    } catch (error) {
      logger.error('Delete letter error:', error);
      throw error;
    }
  }
}

export default new LetterService();
