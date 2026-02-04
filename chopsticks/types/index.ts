// App types matching lean MVP schema

export interface User {
  id: string;
  phone: string;
  name: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null;
  photo_url: string | null;
  persona: 'local' | 'new_to_city' | 'expat' | 'traveler' | 'student' | null;
  city: 'hcmc';
  meal_count: number;
  verified: boolean;
  push_token: string | null;
  language: 'vi' | 'en';
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  cuisine_types: string[];
  budget_ranges: string[]; // Array of: 'under_50k', '50k_150k', '150k_500k', '500k_plus'
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  city: 'hcmc';
  cuisine: string;
  budget_range: 'under_50k' | '50k_150k' | '150k_500k' | '500k_plus';
  latitude: number;
  longitude: number;
  is_hidden_spot: boolean;
  verified: boolean;
  source: 'google_maps' | 'user_added';
  created_at: string;
}

export interface MealRequest {
  id: string;
  requester_id: string;
  restaurant_id: string;
  cuisine: string;
  cuisine_custom: string | null;
  budget_range: 'under_50k' | '50k_150k' | '150k_500k' | '500k_plus';
  time_window: string;
  expires_at: string;
  spots_total: number; // 2-4 for MVP
  spots_taken: number;
  join_type: 'open' | 'approval';
  status: 'active' | 'completed' | 'canceled' | 'expired';
  created_at: string;
}

export interface RequestParticipant {
  id: string;
  request_id: string;
  user_id: string;
  status: 'joined' | 'pending' | 'denied';
  joined_at: string;
}

export interface Chat {
  id: string;
  request_id: string | null;
  type: 'group' | 'dm';
  expires_at: string | null;
  created_at: string;
}

export interface ChatParticipant {
  chat_id: string;
  user_id: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  sent_at: string;
}

export interface PersonRating {
  id: string;
  rater_id: string;
  rated_id: string;
  request_id: string;
  showed_up: boolean;
  optional_comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'join_request' | 'join_approved' | 'new_message';
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

// Match type (alias for MealRequest - matches are requests with participants)
export type Match = MealRequest;

// Export cuisine types from constants
export { CUISINE_CATEGORIES as CUISINE_TYPES } from '@/lib/constants';
export { BUDGET_RANGES } from '@/lib/constants';

// Cities for lean MVP (HCMC only)
export const SUPPORTED_CITIES = [
  { id: 'hcmc', name: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297 },
] as const;
