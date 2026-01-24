// Generated types from Supabase - will be auto-generated later
// For now, manual type definitions

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          name: string;
          age: number | null;
          bio: string | null;
          profile_image_url: string | null;
          verification_status: 'unverified' | 'pending' | 'verified';
          meal_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          name: string;
          age?: number | null;
          bio?: string | null;
          profile_image_url?: string | null;
          verification_status?: 'unverified' | 'pending' | 'verified';
          meal_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          name?: string;
          age?: number | null;
          bio?: string | null;
          profile_image_url?: string | null;
          verification_status?: 'unverified' | 'pending' | 'verified';
          meal_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          cuisine_types: string[];
          dietary_restrictions: string[];
          allergies: string[];
          budget_min: number;
          budget_max: number;
          preferred_radius_km: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cuisine_types?: string[];
          dietary_restrictions?: string[];
          allergies?: string[];
          budget_min?: number;
          budget_max?: number;
          preferred_radius_km?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cuisine_types?: string[];
          dietary_restrictions?: string[];
          allergies?: string[];
          budget_min?: number;
          budget_max?: number;
          preferred_radius_km?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          cuisine_type: string;
          price_range: 'cheap' | 'moderate' | 'expensive';
          latitude: number;
          longitude: number;
          address: string;
          city: string;
          image_urls: string[];
          visit_count: number;
          rating_avg: number | null;
          is_hidden_gem: boolean;
          submitted_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          cuisine_type: string;
          price_range?: 'cheap' | 'moderate' | 'expensive';
          latitude: number;
          longitude: number;
          address: string;
          city: string;
          image_urls?: string[];
          visit_count?: number;
          rating_avg?: number | null;
          is_hidden_gem?: boolean;
          submitted_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          cuisine_type?: string;
          price_range?: 'cheap' | 'moderate' | 'expensive';
          latitude?: number;
          longitude?: number;
          address?: string;
          city?: string;
          image_urls?: string[];
          visit_count?: number;
          rating_avg?: number | null;
          is_hidden_gem?: boolean;
          submitted_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          user_1_id: string;
          user_2_id: string;
          status: 'pending' | 'accepted' | 'expired' | 'completed';
          restaurant_id: string | null;
          scheduled_time: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_1_id: string;
          user_2_id: string;
          status?: 'pending' | 'accepted' | 'expired' | 'completed';
          restaurant_id?: string | null;
          scheduled_time?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_1_id?: string;
          user_2_id?: string;
          status?: 'pending' | 'accepted' | 'expired' | 'completed';
          restaurant_id?: string | null;
          scheduled_time?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          match_id: string;
          sender_id: string;
          content: string;
          sent_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          sender_id: string;
          content: string;
          sent_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          sender_id?: string;
          content?: string;
          sent_at?: string;
          read_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
