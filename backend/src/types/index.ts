import { Request } from 'express';

// User Types
export interface User {
  user_id: string;
  email: string;
  phone?: string;
  password_hash: string;
  twofa_enabled: boolean;
  twofa_secret?: string;
  voter_registration_verified: boolean;
  verification_state?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip_code: string;
  verified_at?: Date;
}

export interface VoterVerification {
  verification_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  registration_address: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'needs_review';
  verification_date?: Date;
  state_api_response?: any;
  confidence_score?: number;
}

// Official Types
export interface Official {
  official_id: string;
  name: string;
  title: string;
  party?: string;
  level: 'federal' | 'state' | 'local';
  office_type: string;
  contact_email?: string;
  contact_phone?: string;
  office_address?: string;
  district?: string;
  state?: string;
  photo_url?: string;
  bio?: string;
  jurisdiction_data?: any;
  created_at: Date;
  updated_at: Date;
}

// Letter Types
export interface Letter {
  letter_id: string;
  user_id: string;
  official_id: string;
  subject: string;
  body: string;
  letter_type: 'letter' | 'memo';
  issue_category: string;
  seal_type?: 'state' | 'federal';
  status: 'draft' | 'sent' | 'delivered' | 'responded';
  visibility: 'private' | 'community' | 'public';
  pdf_url?: string;
  created_at: Date;
  sent_at?: Date;
  updated_at: Date;
}

// Petition Types
export interface Petition {
  petition_id: string;
  creator_user_id: string;
  title: string;
  description: string;
  target_officials: string[];
  goal_signatures: number;
  current_signatures: number;
  status: 'active' | 'closed' | 'delivered';
  created_at: Date;
  expires_at?: Date;
  updated_at: Date;
}

export interface Signature {
  signature_id: string;
  petition_id: string;
  user_id: string;
  signed_at: Date;
  ip_address: string;
  verified: boolean;
}

// Community Types
export interface Community {
  community_id: string;
  name: string;
  description: string;
  community_type: 'district' | 'state' | 'local' | 'issue';
  jurisdiction_data?: any;
  member_count: number;
  created_at: Date;
}

// Auth Types
export interface AuthRequest extends Request {
  user?: User;
  userId?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  verified: boolean;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  requiresTwoFactor?: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
