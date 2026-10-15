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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assistant_usage: {
        Row: {
          count: number
          day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consents: {
        Row: {
          created_at: string
          id: string
          kind: string
          lang: string
          user_id: string
          version: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          lang: string
          user_id: string
          version: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          lang?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      content_jobs: {
        Row: {
          last_run: string | null
          locked_until: string | null
          name: string
          paused_reason: string | null
        }
        Insert: {
          last_run?: string | null
          locked_until?: string | null
          name: string
          paused_reason?: string | null
        }
        Update: {
          last_run?: string | null
          locked_until?: string | null
          name?: string
          paused_reason?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course: string
          created_at: string
          idx: number
          lang: string
          payload: Json
        }
        Insert: {
          course: string
          created_at?: string
          idx: number
          lang: string
          payload: Json
        }
        Update: {
          course?: string
          created_at?: string
          idx?: number
          lang?: string
          payload?: Json
        }
        Relationships: []
      }
      daily_content: {
        Row: {
          created_at: string
          day: string
          lang: string
          payload: Json
        }
        Insert: {
          created_at?: string
          day: string
          lang: string
          payload: Json
        }
        Update: {
          created_at?: string
          day?: string
          lang?: string
          payload?: Json
        }
        Relationships: []
      }
      letter_feedback: {
        Row: {
          comment: string | null
          created_at: string
          error_type: string | null
          id: string
          letter_id: string
          rating: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          letter_id: string
          rating: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          error_type?: string | null
          id?: string
          letter_id?: string
          rating?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "letter_feedback_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      letters: {
        Row: {
          analysis: Json
          created_at: string
          deadline: string | null
          file_name: string
          id: string
          lang: string
          letter_date: string | null
          recipient_name: string | null
          reference: string | null
          reply_de: string
          sender: string | null
          sender_person: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          analysis: Json
          created_at?: string
          deadline?: string | null
          file_name?: string
          id?: string
          lang?: string
          letter_date?: string | null
          recipient_name?: string | null
          reference?: string | null
          reply_de?: string
          sender?: string | null
          sender_person?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          analysis?: Json
          created_at?: string
          deadline?: string | null
          file_name?: string
          id?: string
          lang?: string
          letter_date?: string | null
          recipient_name?: string | null
          reference?: string | null
          reply_de?: string
          sender?: string | null
          sender_person?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          checked_day: string
          created_at: string
          id: string
          image_path: string | null
          image_prompt: string | null
          payload: Json | null
          source_date: string | null
          source_text: string
          source_title: string
          source_url: string
          status: string
        }
        Insert: {
          checked_day: string
          created_at?: string
          id?: string
          image_path?: string | null
          image_prompt?: string | null
          payload?: Json | null
          source_date?: string | null
          source_text: string
          source_title: string
          source_url: string
          status?: string
        }
        Update: {
          checked_day?: string
          created_at?: string
          id?: string
          image_path?: string | null
          image_prompt?: string | null
          payload?: Json | null
          source_date?: string | null
          source_text?: string
          source_title?: string
          source_url?: string
          status?: string
        }
        Relationships: []
      }
      news_job_state: {
        Row: {
          checked_day: string | null
          last_error: string | null
          name: string
          paused_reason: string | null
          updated_at: string
        }
        Insert: {
          checked_day?: string | null
          last_error?: string | null
          name?: string
          paused_reason?: string | null
          updated_at?: string
        }
        Update: {
          checked_day?: string | null
          last_error?: string | null
          name?: string
          paused_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      owner_ai_events: {
        Row: {
          created_at: string
          id: string
          kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
        }
        Relationships: []
      }
      owner_push_settings: {
        Row: {
          alert_day: string | null
          alert_enabled: boolean
          analysis_threshold: number
          error_threshold: number
          lang: string
          last_attempt_at: string | null
          last_negative_at: string | null
          lease_count: number
          lease_kind: string | null
          lease_token: string | null
          lease_until: string | null
          negative_enabled: boolean
          pending_down: number
          pending_reason: string | null
          summary_day: string | null
          summary_enabled: boolean
          user_id: string
        }
        Insert: {
          alert_day?: string | null
          alert_enabled?: boolean
          analysis_threshold?: number
          error_threshold?: number
          lang?: string
          last_attempt_at?: string | null
          last_negative_at?: string | null
          lease_count?: number
          lease_kind?: string | null
          lease_token?: string | null
          lease_until?: string | null
          negative_enabled?: boolean
          pending_down?: number
          pending_reason?: string | null
          summary_day?: string | null
          summary_enabled?: boolean
          user_id: string
        }
        Update: {
          alert_day?: string | null
          alert_enabled?: boolean
          analysis_threshold?: number
          error_threshold?: number
          lang?: string
          last_attempt_at?: string | null
          last_negative_at?: string | null
          lease_count?: number
          lease_kind?: string | null
          lease_token?: string | null
          lease_until?: string | null
          negative_enabled?: boolean
          pending_down?: number
          pending_reason?: string | null
          summary_day?: string | null
          summary_enabled?: boolean
          user_id?: string
        }
        Relationships: []
      }
      owner_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          day: number
          done: boolean
          due_date: string | null
          id: string
          letter_id: string | null
          notified: string[]
          remind_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day: number
          done?: boolean
          due_date?: string | null
          id?: string
          letter_id?: string | null
          notified?: string[]
          remind_time?: string | null
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          day?: number
          done?: boolean
          due_date?: string | null
          id?: string
          letter_id?: string | null
          notified?: string[]
          remind_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_letter_id_fkey"
            columns: ["letter_id"]
            isOneToOne: false
            referencedRelation: "letters"
            referencedColumns: ["id"]
          },
        ]
      }
      reply_usage: {
        Row: {
          count: number
          day: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          day: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          body: Json
          buttons: Json
          id: string
          kind: string
          page: string
          position: number
          published: boolean
          slot: string | null
          title: Json
          updated_at: string
        }
        Insert: {
          body?: Json
          buttons?: Json
          id?: string
          kind?: string
          page?: string
          position?: number
          published?: boolean
          slot?: string | null
          title?: Json
          updated_at?: string
        }
        Update: {
          body?: Json
          buttons?: Json
          id?: string
          kind?: string
          page?: string
          position?: number
          published?: boolean
          slot?: string | null
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          current_period_end: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          current_period_end?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          current_period_end?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          letter_id: string | null
          operation_id: string
          operation_type: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          letter_id?: string | null
          operation_id: string
          operation_type?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          letter_id?: string | null
          operation_id?: string
          operation_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          lang: string
          updated_at: string
          user_id: string
        }
        Insert: {
          lang?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          lang?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_content_job: {
        Args: { _minutes: number; _name: string }
        Returns: Json
      }
      claim_owner_push: {
        Args: { _only_negative?: boolean; _user_id: string }
        Returns: Json
      }
      complete_analysis: {
        Args: { _letter: Json; _operation_id: string; _user_id: string }
        Returns: string
      }
      delete_user_data: {
        Args: { _user_id: string }
        Returns: undefined
      }
      fail_analysis: {
        Args: { _operation_id: string; _user_id: string }
        Returns: undefined
      }
      finish_owner_push: {
        Args: { _success: boolean; _token: string; _user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      owner_day_statistics: { Args: never; Returns: Json }
      owner_feedback_statistics: { Args: never; Returns: Json }
      release_assistant_question: {
        Args: { _user_id: string }
        Returns: undefined
      }
      release_reply_translation: {
        Args: { _user_id: string }
        Returns: undefined
      }
      reserve_analysis: {
        Args: {
          _daily_cap: number
          _free_limit: number
          _operation_id: string
          _user_id: string
        }
        Returns: Json
      }
      reserve_assistant_question: {
        Args: { _daily_limit: number; _user_id: string }
        Returns: Json
      }
      reserve_reply_translation: {
        Args: { _daily_limit: number; _user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
