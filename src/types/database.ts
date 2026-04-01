// Placeholder — regenerate after pushing migrations to Supabase:
// npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          name_irish: string | null;
          slug: string;
          type: "county_board" | "club";
          parent_id: string | null;
          domain: string | null;
          twilio_phone_sid: string | null;
          twilio_studio_flow_sid: string | null;
          stripe_connect_id: string | null;
          theme: Record<string, unknown>;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_irish?: string | null;
          slug: string;
          type: "county_board" | "club";
          parent_id?: string | null;
          domain?: string | null;
          twilio_phone_sid?: string | null;
          twilio_studio_flow_sid?: string | null;
          stripe_connect_id?: string | null;
          theme?: Record<string, unknown>;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_irish?: string | null;
          slug?: string;
          type?: "county_board" | "club";
          parent_id?: string | null;
          domain?: string | null;
          twilio_phone_sid?: string | null;
          twilio_studio_flow_sid?: string | null;
          stripe_connect_id?: string | null;
          theme?: Record<string, unknown>;
          settings?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      org_users: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "super_admin" | "owner" | "admin" | "secretary" | "treasurer" | "registrar" | "pro" | "manager";
          phone_number: string | null;
          permissions: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: "super_admin" | "owner" | "admin" | "secretary" | "treasurer" | "registrar" | "pro" | "manager";
          phone_number?: string | null;
          permissions?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          user_id?: string;
          role?: "super_admin" | "owner" | "admin" | "secretary" | "treasurer" | "registrar" | "pro" | "manager";
          phone_number?: string | null;
          permissions?: Record<string, unknown>;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          phone_number: string;
          phone_hash: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          date_of_birth: string | null;
          membership_type: "adult" | "youth" | "student" | "family" | "social" | null;
          membership_status: "pending" | "active" | "expired" | "suspended";
          membership_expires_at: string | null;
          foireann_id: string | null;
          stripe_customer_id: string | null;
          engagement_score: number;
          last_interaction_at: string | null;
          metadata: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          phone_number: string;
          phone_hash: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          membership_type?: "adult" | "youth" | "student" | "family" | "social" | null;
          membership_status?: "pending" | "active" | "expired" | "suspended";
          membership_expires_at?: string | null;
          foireann_id?: string | null;
          stripe_customer_id?: string | null;
          engagement_score?: number;
          last_interaction_at?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          phone_number?: string;
          phone_hash?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          date_of_birth?: string | null;
          membership_type?: "adult" | "youth" | "student" | "family" | "social" | null;
          membership_status?: "pending" | "active" | "expired" | "suspended";
          membership_expires_at?: string | null;
          foireann_id?: string | null;
          stripe_customer_id?: string | null;
          engagement_score?: number;
          last_interaction_at?: string | null;
          metadata?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      venues: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          capacity: number | null;
          facilities: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          capacity?: number | null;
          facilities?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          capacity?: number | null;
          facilities?: Record<string, unknown>;
          created_at?: string;
        };
      };
      competitions: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          code: "football" | "hurling" | "camogie" | "lgfa";
          level: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          type: "championship" | "league" | "cup";
          season: number;
          status: "upcoming" | "active" | "completed";
          settings: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          code: "football" | "hurling" | "camogie" | "lgfa";
          level: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          type: "championship" | "league" | "cup";
          season: number;
          status?: "upcoming" | "active" | "completed";
          settings?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          code?: "football" | "hurling" | "camogie" | "lgfa";
          level?: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          type?: "championship" | "league" | "cup";
          season?: number;
          status?: "upcoming" | "active" | "completed";
          settings?: Record<string, unknown>;
          created_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          organization_id: string;
          club_id: string | null;
          name: string;
          code: "football" | "hurling" | "camogie" | "lgfa";
          level: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          manager_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          club_id?: string | null;
          name: string;
          code: "football" | "hurling" | "camogie" | "lgfa";
          level: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          manager_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          club_id?: string | null;
          name?: string;
          code?: "football" | "hurling" | "camogie" | "lgfa";
          level?: "senior" | "intermediate" | "junior" | "u21" | "minor" | "u16" | "u14" | "u12";
          manager_id?: string | null;
          created_at?: string;
        };
      };
      fixtures: {
        Row: {
          id: string;
          organization_id: string;
          competition_id: string | null;
          home_team_id: string | null;
          away_team_id: string | null;
          venue_id: string | null;
          scheduled_at: string;
          status: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
          home_score_goals: number;
          home_score_points: number;
          away_score_goals: number;
          away_score_points: number;
          match_report: string | null;
          scorers: Record<string, unknown> | null;
          man_of_match: string | null;
          weather_forecast: Record<string, unknown> | null;
          submitted_by: string | null;
          submitted_at: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          competition_id?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          venue_id?: string | null;
          scheduled_at: string;
          status?: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
          home_score_goals?: number;
          home_score_points?: number;
          away_score_goals?: number;
          away_score_points?: number;
          match_report?: string | null;
          scorers?: Record<string, unknown> | null;
          man_of_match?: string | null;
          weather_forecast?: Record<string, unknown> | null;
          submitted_by?: string | null;
          submitted_at?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          competition_id?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          venue_id?: string | null;
          scheduled_at?: string;
          status?: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
          home_score_goals?: number;
          home_score_points?: number;
          away_score_goals?: number;
          away_score_points?: number;
          match_report?: string | null;
          scorers?: Record<string, unknown> | null;
          man_of_match?: string | null;
          weather_forecast?: Record<string, unknown> | null;
          submitted_by?: string | null;
          submitted_at?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      match_events: {
        Row: {
          id: string;
          fixture_id: string;
          organization_id: string;
          event_type: "goal" | "point" | "wide" | "yellow_card" | "red_card" | "substitution" | "half_time" | "full_time";
          team: "home" | "away";
          player_name: string | null;
          minute: number | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fixture_id: string;
          organization_id: string;
          event_type: "goal" | "point" | "wide" | "yellow_card" | "red_card" | "substitution" | "half_time" | "full_time";
          team: "home" | "away";
          player_name?: string | null;
          minute?: number | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fixture_id?: string;
          organization_id?: string;
          event_type?: "goal" | "point" | "wide" | "yellow_card" | "red_card" | "substitution" | "half_time" | "full_time";
          team?: "home" | "away";
          player_name?: string | null;
          minute?: number | null;
          description?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string | null;
          phone_number: string;
          phone_hash: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan_type: "monthly" | "annual" | "family";
          status: "active" | "past_due" | "cancelled" | "expired";
          current_period_start: string | null;
          current_period_end: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id?: string | null;
          phone_number: string;
          phone_hash: string;
          stripe_customer_id: string;
          stripe_subscription_id: string;
          plan_type: "monthly" | "annual" | "family";
          status?: "active" | "past_due" | "cancelled" | "expired";
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string | null;
          phone_number?: string;
          phone_hash?: string;
          stripe_customer_id?: string;
          stripe_subscription_id?: string;
          plan_type?: "monthly" | "annual" | "family";
          status?: "active" | "past_due" | "cancelled" | "expired";
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          member_id: string | null;
          phone_number: string;
          is_admin_session: boolean;
          context: Record<string, unknown>;
          last_message_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          member_id?: string | null;
          phone_number: string;
          is_admin_session?: boolean;
          context?: Record<string, unknown>;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          member_id?: string | null;
          phone_number?: string;
          is_admin_session?: boolean;
          context?: Record<string, unknown>;
          last_message_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      agent_runs: {
        Row: {
          id: string;
          organization_id: string;
          agent_type: "registration_guardian" | "revenue_sentinel" | "fixture_intelligence" | "member_retention" | "content_engine" | "smart_scheduler";
          status: "running" | "completed" | "failed";
          findings: Record<string, unknown>;
          actions_taken: Record<string, unknown>[];
          ran_at: string;
          next_run_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          agent_type: "registration_guardian" | "revenue_sentinel" | "fixture_intelligence" | "member_retention" | "content_engine" | "smart_scheduler";
          status?: "running" | "completed" | "failed";
          findings?: Record<string, unknown>;
          actions_taken?: Record<string, unknown>[];
          ran_at?: string;
          next_run_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          agent_type?: "registration_guardian" | "revenue_sentinel" | "fixture_intelligence" | "member_retention" | "content_engine" | "smart_scheduler";
          status?: "running" | "completed" | "failed";
          findings?: Record<string, unknown>;
          actions_taken?: Record<string, unknown>[];
          ran_at?: string;
          next_run_at?: string | null;
          created_at?: string;
        };
      };
      content_queue: {
        Row: {
          id: string;
          organization_id: string;
          type: "match_report" | "social_post" | "weekly_roundup" | "press_release";
          content: string;
          metadata: Record<string, unknown>;
          status: "draft" | "pending_approval" | "approved" | "published" | "rejected";
          approved_by: string | null;
          approved_at: string | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: "match_report" | "social_post" | "weekly_roundup" | "press_release";
          content: string;
          metadata?: Record<string, unknown>;
          status?: "draft" | "pending_approval" | "approved" | "published" | "rejected";
          approved_by?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          type?: "match_report" | "social_post" | "weekly_roundup" | "press_release";
          content?: string;
          metadata?: Record<string, unknown>;
          status?: "draft" | "pending_approval" | "approved" | "published" | "rejected";
          approved_by?: string | null;
          approved_at?: string | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      message_costs: {
        Row: {
          id: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          marketing_count: number;
          marketing_cost: number;
          utility_count: number;
          utility_cost: number;
          service_count: number;
          service_cost: number;
          total_cost: number;
          billed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          marketing_count?: number;
          marketing_cost?: number;
          utility_count?: number;
          utility_cost?: number;
          service_count?: number;
          service_cost?: number;
          total_cost?: number;
          billed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          period_start?: string;
          period_end?: string;
          marketing_count?: number;
          marketing_cost?: number;
          utility_count?: number;
          utility_cost?: number;
          service_count?: number;
          service_cost?: number;
          total_cost?: number;
          billed?: boolean;
          created_at?: string;
        };
      };
      revenue_reports: {
        Row: {
          id: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          gross_revenue: number;
          stripe_fees: number;
          twilio_costs: number;
          qed_margin_rate: number;
          qed_margin_amount: number;
          net_to_organization: number;
          settled: boolean;
          settled_at: string | null;
          settlement_reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          period_start: string;
          period_end: string;
          gross_revenue?: number;
          stripe_fees?: number;
          twilio_costs?: number;
          qed_margin_rate?: number;
          qed_margin_amount?: number;
          net_to_organization?: number;
          settled?: boolean;
          settled_at?: string | null;
          settlement_reference?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          period_start?: string;
          period_end?: string;
          gross_revenue?: number;
          stripe_fees?: number;
          twilio_costs?: number;
          qed_margin_rate?: number;
          qed_margin_amount?: number;
          net_to_organization?: number;
          settled?: boolean;
          settled_at?: string | null;
          settlement_reference?: string | null;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          organization_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string | null;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Record<string, unknown> | null;
          new_values?: Record<string, unknown> | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_org_ids: {
        Args: { _user_id: string };
        Returns: string[];
      };
      has_role_on_org: {
        Args: { _user_id: string; _org_id: string; _roles?: string[] };
        Returns: boolean;
      };
      increment_message_cost: {
        Args: { _org_id: string; _category: string; _cost: number };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
};
