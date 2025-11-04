import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Official } from '../types';
import logger from '../utils/logger';

interface GoogleCivicOfficial {
  name: string;
  party?: string;
  phones?: string[];
  urls?: string[];
  photoUrl?: string;
  emails?: string[];
  channels?: Array<{ type: string; id: string }>;
  address?: Array<{
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>;
}

interface GoogleCivicResponse {
  normalizedInput?: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  divisions?: any;
  offices?: Array<{
    name: string;
    divisionId: string;
    levels?: string[];
    roles?: string[];
    officialIndices: number[];
  }>;
  officials?: GoogleCivicOfficial[];
}

interface ProPublicaMember {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  party: string;
  state: string;
  district?: string;
  title: string;
  short_title: string;
  twitter_account?: string;
  facebook_account?: string;
  youtube_account?: string;
  website?: string;
  office?: string;
  phone?: string;
}

export class OfficialDirectoryService {
  /**
   * Search officials by address using Google Civic Information API
   */
  async searchByAddress(address: string): Promise<Official[]> {
    try {
      const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!apiKey) {
        logger.warn('Google Civic API key not configured');
        throw new AppError('Official directory service not available', 503);
      }

      const response = await axios.get<GoogleCivicResponse>(
        'https://www.googleapis.com/civicinfo/v2/representatives',
        {
          params: {
            key: apiKey,
            address: address,
          },
        }
      );

      const officials = this.parseGoogleCivicResponse(response.data);

      // Save or update officials in database
      for (const official of officials) {
        await this.upsertOfficial(official);
      }

      return officials;
    } catch (error: any) {
      if (error.response?.status === 404) {
        logger.warn(`No officials found for address: ${address}`);
        return [];
      }
      logger.error('Google Civic API error:', error);
      throw new AppError('Failed to fetch officials', 500);
    }
  }

  /**
   * Parse Google Civic Information API response
   */
  private parseGoogleCivicResponse(data: GoogleCivicResponse): Official[] {
    const officials: Official[] = [];

    if (!data.offices || !data.officials) {
      return officials;
    }

    for (const office of data.offices) {
      for (const index of office.officialIndices) {
        const googleOfficial = data.officials[index];
        if (!googleOfficial) continue;

        // Determine level (federal, state, local)
        let level: 'federal' | 'state' | 'local' = 'local';
        if (office.levels?.includes('country')) {
          level = 'federal';
        } else if (
          office.levels?.includes('administrativeArea1') ||
          office.name.toLowerCase().includes('state')
        ) {
          level = 'state';
        }

        // Build address string
        let officeAddress = '';
        if (googleOfficial.address && googleOfficial.address.length > 0) {
          const addr = googleOfficial.address[0];
          officeAddress = `${addr.line1 || ''}${
            addr.line2 ? ' ' + addr.line2 : ''
          }, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`.trim();
        }

        // Build social media object
        const socialMedia: any = {};
        if (googleOfficial.channels) {
          for (const channel of googleOfficial.channels) {
            socialMedia[channel.type.toLowerCase()] = channel.id;
          }
        }

        officials.push({
          official_id: uuidv4(),
          name: googleOfficial.name,
          title: office.name,
          party: googleOfficial.party,
          level: level,
          office_type: this.normalizeOfficeType(office.name),
          contact_email: googleOfficial.emails?.[0],
          contact_phone: googleOfficial.phones?.[0],
          office_address: officeAddress || undefined,
          photo_url: googleOfficial.photoUrl,
          website_url: googleOfficial.urls?.[0],
          social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
          active: true,
          created_at: new Date(),
          updated_at: new Date(),
        } as Official);
      }
    }

    return officials;
  }

  /**
   * Normalize office type for consistency
   */
  private normalizeOfficeType(officeName: string): string {
    const lower = officeName.toLowerCase();

    if (lower.includes('president')) return 'president';
    if (lower.includes('vice president')) return 'vice_president';
    if (lower.includes('senator')) return 'senator';
    if (lower.includes('representative') || lower.includes('congress'))
      return 'representative';
    if (lower.includes('governor')) return 'governor';
    if (lower.includes('lieutenant governor')) return 'lieutenant_governor';
    if (lower.includes('attorney general')) return 'attorney_general';
    if (lower.includes('secretary of state')) return 'secretary_of_state';
    if (lower.includes('mayor')) return 'mayor';
    if (lower.includes('council')) return 'council_member';
    if (lower.includes('assembly')) return 'assembly_member';
    if (lower.includes('delegate')) return 'delegate';

    return 'other';
  }

  /**
   * Fetch federal officials from ProPublica Congress API
   */
  async fetchFederalOfficials(): Promise<Official[]> {
    try {
      const apiKey = process.env.PROPUBLICA_API_KEY;
      if (!apiKey) {
        logger.warn('ProPublica API key not configured');
        return [];
      }

      // Fetch both House and Senate members
      const [senateResponse, houseResponse] = await Promise.all([
        axios.get(
          'https://api.propublica.org/congress/v1/118/senate/members.json',
          {
            headers: { 'X-API-Key': apiKey },
          }
        ),
        axios.get(
          'https://api.propublica.org/congress/v1/118/house/members.json',
          {
            headers: { 'X-API-Key': apiKey },
          }
        ),
      ]);

      const senateMembers = senateResponse.data.results[0]?.members || [];
      const houseMembers = houseResponse.data.results[0]?.members || [];
      const allMembers = [...senateMembers, ...houseMembers];

      const officials = allMembers.map((member: ProPublicaMember) =>
        this.parseProPublicaMember(member)
      );

      // Save or update officials in database
      for (const official of officials) {
        await this.upsertOfficial(official);
      }

      logger.info(`Fetched ${officials.length} federal officials from ProPublica`);
      return officials;
    } catch (error) {
      logger.error('ProPublica API error:', error);
      return [];
    }
  }

  /**
   * Parse ProPublica Congress API member
   */
  private parseProPublicaMember(member: ProPublicaMember): Official {
    const socialMedia: any = {};
    if (member.twitter_account) socialMedia.twitter = member.twitter_account;
    if (member.facebook_account) socialMedia.facebook = member.facebook_account;
    if (member.youtube_account) socialMedia.youtube = member.youtube_account;

    return {
      official_id: uuidv4(),
      name: `${member.first_name} ${member.middle_name ? member.middle_name + ' ' : ''}${member.last_name}`,
      title: member.title,
      party: member.party,
      level: 'federal',
      office_type: member.title.toLowerCase().includes('senator')
        ? 'senator'
        : 'representative',
      contact_phone: member.phone,
      office_address: member.office,
      state: member.state,
      district: member.district,
      website_url: member.website,
      social_media: Object.keys(socialMedia).length > 0 ? socialMedia : undefined,
      external_id: member.id,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    } as Official;
  }

  /**
   * Upsert official in database
   */
  private async upsertOfficial(official: Official): Promise<void> {
    try {
      // Try to find existing official by name and title
      const existing = await db('officials')
        .where({
          name: official.name,
          title: official.title,
          level: official.level,
        })
        .first();

      if (existing) {
        // Update existing official
        await db('officials')
          .where({ official_id: existing.official_id })
          .update({
            party: official.party,
            contact_email: official.contact_email,
            contact_phone: official.contact_phone,
            office_address: official.office_address,
            photo_url: official.photo_url,
            website_url: official.website_url,
            social_media: official.social_media,
            updated_at: new Date(),
          });
      } else {
        // Insert new official
        await db('officials').insert(official);
      }
    } catch (error) {
      logger.error('Error upserting official:', error);
    }
  }

  /**
   * Get officials by user's address (from their profile)
   */
  async getOfficialsByUserId(userId: string): Promise<Official[]> {
    try {
      // Get user's address from profile
      const profile = await db('user_profiles').where({ user_id: userId }).first();

      if (!profile || !profile.address_line1 || !profile.city || !profile.state) {
        throw new AppError('User address not found', 404);
      }

      const address = `${profile.address_line1}, ${profile.city}, ${profile.state} ${profile.zip_code}`;

      // Search for officials by address
      const officials = await this.searchByAddress(address);

      return officials;
    } catch (error) {
      logger.error('Get officials by user ID error:', error);
      throw error;
    }
  }

  /**
   * Get all officials with filters
   */
  async getOfficials(filters: {
    level?: 'federal' | 'state' | 'local';
    state?: string;
    officeType?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ officials: Official[]; total: number }> {
    try {
      let query = db('officials').where({ active: true });

      if (filters.level) {
        query = query.where({ level: filters.level });
      }

      if (filters.state) {
        query = query.where({ state: filters.state });
      }

      if (filters.officeType) {
        query = query.where({ office_type: filters.officeType });
      }

      // Get total count
      const [{ count }] = await query.clone().count('* as count');
      const total = parseInt(count as string);

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query.limit(limit).offset(offset).orderBy('name', 'asc');

      const officials = await query;

      return { officials, total };
    } catch (error) {
      logger.error('Get officials error:', error);
      throw error;
    }
  }

  /**
   * Get single official by ID
   */
  async getOfficialById(officialId: string): Promise<Official> {
    try {
      const official = await db('officials')
        .where({ official_id: officialId })
        .first();

      if (!official) {
        throw new AppError('Official not found', 404);
      }

      return official;
    } catch (error) {
      logger.error('Get official by ID error:', error);
      throw error;
    }
  }

  /**
   * Search officials by name
   */
  async searchOfficials(searchTerm: string): Promise<Official[]> {
    try {
      const officials = await db('officials')
        .where({ active: true })
        .where('name', 'ilike', `%${searchTerm}%`)
        .orderBy('name', 'asc')
        .limit(20);

      return officials;
    } catch (error) {
      logger.error('Search officials error:', error);
      throw error;
    }
  }
}

export default new OfficialDirectoryService();
