export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_runs: {
        Row: {
          actions_taken: Json[] | null
          agent_type: string
          created_at: string | null
          findings: Json | null
          id: string
          next_run_at: string | null
          organization_id: string
          ran_at: string | null
          status: string | null
        }
        Insert: {
          actions_taken?: Json[] | null
          agent_type: string
          created_at?: string | null
          findings?: Json | null
          id?: string
          next_run_at?: string | null
          organization_id: string
          ran_at?: string | null
          status?: string | null
        }
        Update: {
          actions_taken?: Json[] | null
          agent_type?: string
          created_at?: string | null
          findings?: Json | null
          id?: string
          next_run_at?: string | null
          organization_id?: string
          ran_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          code: string
          created_at: string | null
          id: string
          level: string
          name: string
          organization_id: string
          season: number
          settings: Json | null
          status: string | null
          type: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          level: string
          name: string
          organization_id: string
          season: number
          settings?: Json | null
          status?: string | null
          type: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          level?: string
          name?: string
          organization_id?: string
          season?: number
          settings?: Json | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_queue: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          organization_id: string
          published_at: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          published_at?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          published_at?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          is_admin_session: boolean | null
          last_message_at: string | null
          member_id: string | null
          organization_id: string
          phone_number: string
          updated_at: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_admin_session?: boolean | null
          last_message_at?: string | null
          member_id?: string | null
          organization_id: string
          phone_number: string
          updated_at?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_admin_session?: boolean | null
          last_message_at?: string | null
          member_id?: string | null
          organization_id?: string
          phone_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fixtures: {
        Row: {
          away_score_goals: number | null
          away_score_points: number | null
          away_team_id: string | null
          competition_id: string | null
          created_at: string | null
          home_score_goals: number | null
          home_score_points: number | null
          home_team_id: string | null
          id: string
          man_of_match: string | null
          match_report: string | null
          organization_id: string
          scheduled_at: string
          scorers: Json | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          venue_id: string | null
          verified: boolean | null
          weather_forecast: Json | null
        }
        Insert: {
          away_score_goals?: number | null
          away_score_points?: number | null
          away_team_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          home_score_goals?: number | null
          home_score_points?: number | null
          home_team_id?: string | null
          id?: string
          man_of_match?: string | null
          match_report?: string | null
          organization_id: string
          scheduled_at: string
          scorers?: Json | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          venue_id?: string | null
          verified?: boolean | null
          weather_forecast?: Json | null
        }
        Update: {
          away_score_goals?: number | null
          away_score_points?: number | null
          away_team_id?: string | null
          competition_id?: string | null
          created_at?: string | null
          home_score_goals?: number | null
          home_score_points?: number | null
          home_team_id?: string | null
          id?: string
          man_of_match?: string | null
          match_report?: string | null
          organization_id?: string
          scheduled_at?: string
          scorers?: Json | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          venue_id?: string | null
          verified?: boolean | null
          weather_forecast?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fixtures_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fixtures_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          fixture_id: string
          id: string
          minute: number | null
          organization_id: string
          player_name: string | null
          team: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          fixture_id: string
          id?: string
          minute?: number | null
          organization_id: string
          player_name?: string | null
          team: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          fixture_id?: string
          id?: string
          minute?: number | null
          organization_id?: string
          player_name?: string | null
          team?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_fixture_id_fkey"
            columns: ["fixture_id"]
            isOneToOne: false
            referencedRelation: "fixtures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          engagement_score: number | null
          first_name: string | null
          foireann_id: string | null
          id: string
          last_interaction_at: string | null
          last_name: string | null
          membership_expires_at: string | null
          membership_status: string | null
          membership_type: string | null
          metadata: Json | null
          organization_id: string
          phone_hash: string
          phone_number: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          engagement_score?: number | null
          first_name?: string | null
          foireann_id?: string | null
          id?: string
          last_interaction_at?: string | null
          last_name?: string | null
          membership_expires_at?: string | null
          membership_status?: string | null
          membership_type?: string | null
          metadata?: Json | null
          organization_id: string
          phone_hash: string
          phone_number: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          engagement_score?: number | null
          first_name?: string | null
          foireann_id?: string | null
          id?: string
          last_interaction_at?: string | null
          last_name?: string | null
          membership_expires_at?: string | null
          membership_status?: string | null
          membership_type?: string | null
          metadata?: Json | null
          organization_id?: string
          phone_hash?: string
          phone_number?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_costs: {
        Row: {
          billed: boolean | null
          created_at: string | null
          id: string
          marketing_cost: number | null
          marketing_count: number | null
          organization_id: string
          period_end: string
          period_start: string
          service_cost: number | null
          service_count: number | null
          total_cost: number | null
          utility_cost: number | null
          utility_count: number | null
        }
        Insert: {
          billed?: boolean | null
          created_at?: string | null
          id?: string
          marketing_cost?: number | null
          marketing_count?: number | null
          organization_id: string
          period_end: string
          period_start: string
          service_cost?: number | null
          service_count?: number | null
          total_cost?: number | null
          utility_cost?: number | null
          utility_count?: number | null
        }
        Update: {
          billed?: boolean | null
          created_at?: string | null
          id?: string
          marketing_cost?: number | null
          marketing_count?: number | null
          organization_id?: string
          period_end?: string
          period_start?: string
          service_cost?: number | null
          service_count?: number | null
          total_cost?: number | null
          utility_cost?: number | null
          utility_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "message_costs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_users: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          permissions: Json | null
          phone_number: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          permissions?: Json | null
          phone_number?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          permissions?: Json | null
          phone_number?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          domain: string | null
          id: string
          name: string
          name_irish: string | null
          parent_id: string | null
          settings: Json | null
          slug: string
          stripe_connect_id: string | null
          theme: Json | null
          twilio_phone_sid: string | null
          twilio_studio_flow_sid: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name: string
          name_irish?: string | null
          parent_id?: string | null
          settings?: Json | null
          slug: string
          stripe_connect_id?: string | null
          theme?: Json | null
          twilio_phone_sid?: string | null
          twilio_studio_flow_sid?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          id?: string
          name?: string
          name_irish?: string | null
          parent_id?: string | null
          settings?: Json | null
          slug?: string
          stripe_connect_id?: string | null
          theme?: Json | null
          twilio_phone_sid?: string | null
          twilio_studio_flow_sid?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_reports: {
        Row: {
          created_at: string | null
          gross_revenue: number | null
          id: string
          net_to_organization: number | null
          organization_id: string
          period_end: string
          period_start: string
          qed_margin_amount: number | null
          qed_margin_rate: number | null
          settled: boolean | null
          settled_at: string | null
          settlement_reference: string | null
          stripe_fees: number | null
          twilio_costs: number | null
        }
        Insert: {
          created_at?: string | null
          gross_revenue?: number | null
          id?: string
          net_to_organization?: number | null
          organization_id: string
          period_end: string
          period_start: string
          qed_margin_amount?: number | null
          qed_margin_rate?: number | null
          settled?: boolean | null
          settled_at?: string | null
          settlement_reference?: string | null
          stripe_fees?: number | null
          twilio_costs?: number | null
        }
        Update: {
          created_at?: string | null
          gross_revenue?: number | null
          id?: string
          net_to_organization?: number | null
          organization_id?: string
          period_end?: string
          period_start?: string
          qed_margin_amount?: number | null
          qed_margin_rate?: number | null
          settled?: boolean | null
          settled_at?: string | null
          settlement_reference?: string | null
          stripe_fees?: number | null
          twilio_costs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          member_id: string | null
          organization_id: string
          phone_hash: string
          phone_number: string
          plan_type: string
          status: string | null
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          member_id?: string | null
          organization_id: string
          phone_hash: string
          phone_number: string
          plan_type: string
          status?: string | null
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          member_id?: string | null
          organization_id?: string
          phone_hash?: string
          phone_number?: string
          plan_type?: string
          status?: string | null
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          club_id: string | null
          code: string
          created_at: string | null
          id: string
          level: string
          manager_id: string | null
          name: string
          organization_id: string
        }
        Insert: {
          club_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          level: string
          manager_id?: string | null
          name: string
          organization_id: string
        }
        Update: {
          club_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          level?: string
          manager_id?: string | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "org_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          capacity: number | null
          created_at: string | null
          facilities: Json | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          organization_id: string
        }
        Insert: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          organization_id: string
        }
        Update: {
          address?: string | null
          capacity?: number | null
          created_at?: string | null
          facilities?: Json | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_role_on_org: {
        Args: { _org_id: string; _roles?: string[]; _user_id: string }
        Returns: boolean
      }
      increment_message_cost: {
        Args: { _category: string; _cost: number; _org_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
