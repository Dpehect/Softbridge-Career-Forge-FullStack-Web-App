export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_path: string | null;
          locale: string | null;
          theme: string | null;
          career_goal_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_path?: string | null;
          locale?: string | null;
          theme?: string | null;
          career_goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_path?: string | null;
          locale?: string | null;
          theme?: string | null;
          career_goal_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      career_workspaces: {
        Row: {
          user_id: string;
          resume: Json;
          resume_section_order: Json;
          coach_messages: Json;
          forge_cv_text: string;
          forge_jd_text: string;
          forge_parsed_cv: Json | null;
          forge_analysis: Json | null;
          forge_tone: string;
          forge_history: Json;
          forge_backups: Json;
          saved_job_ids: Json;
          applied_job_ids: Json;
          enrolled_path_ids: Json;
          completed_module_ids: Json;
          last_analysis_meta: Json | null;
          source_file_path: string | null;
          migration_completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          resume?: Json;
          resume_section_order?: Json;
          coach_messages?: Json;
          forge_cv_text?: string;
          forge_jd_text?: string;
          forge_parsed_cv?: Json | null;
          forge_analysis?: Json | null;
          forge_tone?: string;
          forge_history?: Json;
          forge_backups?: Json;
          saved_job_ids?: Json;
          applied_job_ids?: Json;
          enrolled_path_ids?: Json;
          completed_module_ids?: Json;
          last_analysis_meta?: Json | null;
          source_file_path?: string | null;
          migration_completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          resume?: Json;
          resume_section_order?: Json;
          coach_messages?: Json;
          forge_cv_text?: string;
          forge_jd_text?: string;
          forge_parsed_cv?: Json | null;
          forge_analysis?: Json | null;
          forge_tone?: string;
          forge_history?: Json;
          forge_backups?: Json;
          saved_job_ids?: Json;
          applied_job_ids?: Json;
          enrolled_path_ids?: Json;
          completed_module_ids?: Json;
          last_analysis_meta?: Json | null;
          source_file_path?: string | null;
          migration_completed_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_usage_events: {
        Row: { id: number; user_id: string; feature: string; created_at: string };
        Insert: { id?: never; user_id: string; feature: string; created_at?: string };
        Update: { id?: never; user_id?: string; feature?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      consume_ai_quota: {
        Args: { p_feature: string; p_limit?: number; p_window_seconds?: number };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type CareerWorkspaceRow = Database["public"]["Tables"]["career_workspaces"]["Row"];
export type CareerWorkspaceInsert = Database["public"]["Tables"]["career_workspaces"]["Insert"];
export type CareerWorkspaceUpdate = Database["public"]["Tables"]["career_workspaces"]["Update"];
