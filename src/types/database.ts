/**
 * Database Types for Supabase
 *
 * These types match the database schema defined in migrations.
 * Auto-sync with: npx supabase gen types typescript --local (future)
 */

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
      profiles: {
        Row: {
          id: string;
          mother_name: string | null;
          mother_birthdate: string | null;
          weight_kg: number | null;
          height_cm: number | null;
          safety_mode: 'normal' | 'cautious';
          notifications_enabled: boolean;
          has_completed_onboarding: boolean;
          onboarding_completed_at: string | null;
          consent_version: string;
          marketing_consent: boolean;
          analytics_consent: boolean;
          created_at: string;
          updated_at: string;
          last_active_at: string;
        };
        Insert: {
          id: string;
          mother_name?: string | null;
          mother_birthdate?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          safety_mode?: 'normal' | 'cautious';
          notifications_enabled?: boolean;
          has_completed_onboarding?: boolean;
          onboarding_completed_at?: string | null;
          consent_version?: string;
          marketing_consent?: boolean;
          analytics_consent?: boolean;
          created_at?: string;
          updated_at?: string;
          last_active_at?: string;
        };
        Update: {
          id?: string;
          mother_name?: string | null;
          mother_birthdate?: string | null;
          weight_kg?: number | null;
          height_cm?: number | null;
          safety_mode?: 'normal' | 'cautious';
          notifications_enabled?: boolean;
          has_completed_onboarding?: boolean;
          onboarding_completed_at?: string | null;
          consent_version?: string;
          marketing_consent?: boolean;
          analytics_consent?: boolean;
          updated_at?: string;
          last_active_at?: string;
        };
      };
      babies: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          birthdate: string;
          weight_kg: number | null;
          length_cm: number | null;
          feeding_type: 'breast' | 'formula' | 'mix' | null;
          feeds_per_day: number | null;
          typical_amount_ml: number | null;
          pump_preference: 'yes' | 'no' | 'later' | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          birthdate: string;
          weight_kg?: number | null;
          length_cm?: number | null;
          feeding_type?: 'breast' | 'formula' | 'mix' | null;
          feeds_per_day?: number | null;
          typical_amount_ml?: number | null;
          pump_preference?: 'yes' | 'no' | 'later' | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          birthdate?: string;
          weight_kg?: number | null;
          length_cm?: number | null;
          feeding_type?: 'breast' | 'formula' | 'mix' | null;
          feeds_per_day?: number | null;
          typical_amount_ml?: number | null;
          pump_preference?: 'yes' | 'no' | 'later' | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      drink_sessions: {
        Row: {
          id: string;
          user_id: string;
          baby_id: string | null;
          started_at: string;
          completed_at: string | null;
          mode: 'now' | 'backfill' | 'plan_ahead';
          total_standard_drinks: number;
          predicted_safe_at: string | null;
          weight_kg_at_session: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          baby_id?: string | null;
          started_at: string;
          completed_at?: string | null;
          mode?: 'now' | 'backfill' | 'plan_ahead';
          total_standard_drinks?: number;
          predicted_safe_at?: string | null;
          weight_kg_at_session?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          baby_id?: string | null;
          completed_at?: string | null;
          mode?: 'now' | 'backfill' | 'plan_ahead';
          predicted_safe_at?: string | null;
          weight_kg_at_session?: number | null;
          updated_at?: string;
        };
      };
      drinks: {
        Row: {
          id: string;
          session_id: string;
          type: string;
          name: string;
          quantity: number;
          alcohol_content: number;
          standard_drinks: number;
          consumed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          type: string;
          name: string;
          quantity: number;
          alcohol_content: number;
          standard_drinks: number;
          consumed_at?: string;
          created_at?: string;
        };
        Update: {
          type?: string;
          name?: string;
          quantity?: number;
          alcohol_content?: number;
          standard_drinks?: number;
          consumed_at?: string;
        };
      };
      feeding_logs: {
        Row: {
          id: string;
          baby_id: string;
          type: 'breast' | 'bottle' | 'pump' | null;
          fed_at: string;
          duration_minutes: number | null;
          amount_ml: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          type?: 'breast' | 'bottle' | 'pump' | null;
          fed_at: string;
          duration_minutes?: number | null;
          amount_ml?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          type?: 'breast' | 'bottle' | 'pump' | null;
          fed_at?: string;
          duration_minutes?: number | null;
          amount_ml?: number | null;
          notes?: string | null;
        };
      };
      content_tips: {
        Row: {
          id: string;
          category: 'safety' | 'planning' | 'health' | 'general' | 'milestone';
          title: string;
          content: string;
          target_baby_age_min_days: number | null;
          target_baby_age_max_days: number | null;
          target_feeding_types: string[] | null;
          priority: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: 'safety' | 'planning' | 'health' | 'general' | 'milestone';
          title: string;
          content: string;
          target_baby_age_min_days?: number | null;
          target_baby_age_max_days?: number | null;
          target_feeding_types?: string[] | null;
          priority?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: 'safety' | 'planning' | 'health' | 'general' | 'milestone';
          title?: string;
          content?: string;
          target_baby_age_min_days?: number | null;
          target_baby_age_max_days?: number | null;
          target_feeding_types?: string[] | null;
          priority?: number;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      user_tip_interactions: {
        Row: {
          id: string;
          user_id: string;
          tip_id: string;
          viewed_at: string;
          helpful: boolean | null;
          dismissed: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          tip_id: string;
          viewed_at?: string;
          helpful?: boolean | null;
          dismissed?: boolean;
        };
        Update: {
          helpful?: boolean | null;
          dismissed?: boolean;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_type: string;
          event_data: Json;
          occurred_at: string;
          anonymized: boolean;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_type: string;
          event_data?: Json;
          occurred_at?: string;
          anonymized?: boolean;
        };
        Update: {
          user_id?: string | null;
          anonymized?: boolean;
        };
      };
      data_requests: {
        Row: {
          id: string;
          user_id: string;
          request_type: 'export' | 'delete';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          export_url: string | null;
          error_message: string | null;
          requested_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          request_type: 'export' | 'delete';
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          export_url?: string | null;
          error_message?: string | null;
          requested_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          export_url?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
      };
    };
    Functions: {
      export_user_data: {
        Args: Record<string, never>;
        Returns: Json;
      };
      delete_user_data: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      user_owns_baby: {
        Args: { baby_uuid: string };
        Returns: boolean;
      };
      user_owns_session: {
        Args: { session_uuid: string };
        Returns: boolean;
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Baby = Database['public']['Tables']['babies']['Row'];
export type DrinkSession = Database['public']['Tables']['drink_sessions']['Row'];
export type Drink = Database['public']['Tables']['drinks']['Row'];
export type FeedingLog = Database['public']['Tables']['feeding_logs']['Row'];
export type ContentTip = Database['public']['Tables']['content_tips']['Row'];
export type UserTipInteraction = Database['public']['Tables']['user_tip_interactions']['Row'];
export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];
export type DataRequest = Database['public']['Tables']['data_requests']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type BabyInsert = Database['public']['Tables']['babies']['Insert'];
export type DrinkSessionInsert = Database['public']['Tables']['drink_sessions']['Insert'];
export type DrinkInsert = Database['public']['Tables']['drinks']['Insert'];
export type FeedingLogInsert = Database['public']['Tables']['feeding_logs']['Insert'];
