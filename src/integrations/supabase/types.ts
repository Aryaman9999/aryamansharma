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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          content: string | null
          created_at: string | null
          description: string
          display_order: number
          id: string
          published: boolean
          read_time: string
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          description: string
          display_order?: number
          id?: string
          published?: boolean
          read_time?: string
          slug?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          description?: string
          display_order?: number
          id?: string
          published?: boolean
          read_time?: string
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      email_list: {
        Row: {
          email: string
          id: string
          metadata: Json | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          metadata?: Json | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          metadata?: Json | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          company: string
          created_at: string | null
          display_order: number
          id: string
          period: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          company: string
          created_at?: string | null
          display_order?: number
          id?: string
          period: string
          role: string
          status: string
          updated_at?: string | null
        }
        Update: {
          company?: string
          created_at?: string | null
          display_order?: number
          id?: string
          period?: string
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hero_content: {
        Row: {
          button_primary_text: string
          button_secondary_text: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          button_primary_text?: string
          button_secondary_text?: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          button_primary_text?: string
          button_secondary_text?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          case_study_url: string | null
          content: string | null
          created_at: string | null
          description: string
          display_order: number
          id: string
          image_url: string | null
          slug: string
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          case_study_url?: string | null
          content?: string | null
          created_at?: string | null
          description: string
          display_order?: number
          id?: string
          image_url?: string | null
          slug?: string
          tags?: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          case_study_url?: string | null
          content?: string | null
          created_at?: string | null
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          platform: string
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          platform: string
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          platform?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
