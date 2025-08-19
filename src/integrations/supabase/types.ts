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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      Layer1: {
        Row: {
          age: number | null
          assigned_cohorts: string | null
          avg_discount_used: string | null
          avg_order_value: number | null
          avg_scroll_depth: number | null
          avg_session_duration_sec: number | null
          beauty_affinity: number | null
          best_contact_time: string | null
          books_affinity: number | null
          brand_preference: string | null
          cart_abandonments_30d: string | null
          cart_additions_30d: number | null
          churn_risk_score: number | null
          city: string | null
          customer_id: string
          data_generated_date: string | null
          days_since_last_purchase: number | null
          delivery_speed_preference: string | null
          electronics_affinity: number | null
          email_click_rate: number | null
          email_open_rate: number | null
          emails_sent_30d: number | null
          fashion_affinity: number | null
          festive_purchase_ratio: string | null
          festive_purchases: string | null
          gender: string | null
          home_affinity: number | null
          income_bracket: string | null
          intent_category: string | null
          intent_score: number | null
          last_purchase_date: string | null
          last_whatsapp_sentiment: number | null
          lifetime_value_predicted: number | null
          mobile_usage_ratio: number | null
          page_views_30d: number | null
          payday_purchase_ratio: string | null
          payday_purchases: string | null
          peak_shopping_month: number | null
          predicted_campaign_roi: number | null
          preferred_channel: string | null
          preferred_payment: string | null
          primary_category: string | null
          primary_device: string | null
          primary_traffic_source: string | null
          recommended_campaign: string | null
          registration_date: string | null
          repeat_purchase_prob_7d: string | null
          search_queries_30d: number | null
          sports_affinity: number | null
          total_orders: number | null
          total_spent: number | null
          upsell_potential: number | null
          weekend_shopper: boolean | null
          whatsapp_interactions_30d: string | null
          whatsapp_response_rate: string | null
        }
        Insert: {
          age?: number | null
          assigned_cohorts?: string | null
          avg_discount_used?: string | null
          avg_order_value?: number | null
          avg_scroll_depth?: number | null
          avg_session_duration_sec?: number | null
          beauty_affinity?: number | null
          best_contact_time?: string | null
          books_affinity?: number | null
          brand_preference?: string | null
          cart_abandonments_30d?: string | null
          cart_additions_30d?: number | null
          churn_risk_score?: number | null
          city?: string | null
          customer_id: string
          data_generated_date?: string | null
          days_since_last_purchase?: number | null
          delivery_speed_preference?: string | null
          electronics_affinity?: number | null
          email_click_rate?: number | null
          email_open_rate?: number | null
          emails_sent_30d?: number | null
          fashion_affinity?: number | null
          festive_purchase_ratio?: string | null
          festive_purchases?: string | null
          gender?: string | null
          home_affinity?: number | null
          income_bracket?: string | null
          intent_category?: string | null
          intent_score?: number | null
          last_purchase_date?: string | null
          last_whatsapp_sentiment?: number | null
          lifetime_value_predicted?: number | null
          mobile_usage_ratio?: number | null
          page_views_30d?: number | null
          payday_purchase_ratio?: string | null
          payday_purchases?: string | null
          peak_shopping_month?: number | null
          predicted_campaign_roi?: number | null
          preferred_channel?: string | null
          preferred_payment?: string | null
          primary_category?: string | null
          primary_device?: string | null
          primary_traffic_source?: string | null
          recommended_campaign?: string | null
          registration_date?: string | null
          repeat_purchase_prob_7d?: string | null
          search_queries_30d?: number | null
          sports_affinity?: number | null
          total_orders?: number | null
          total_spent?: number | null
          upsell_potential?: number | null
          weekend_shopper?: boolean | null
          whatsapp_interactions_30d?: string | null
          whatsapp_response_rate?: string | null
        }
        Update: {
          age?: number | null
          assigned_cohorts?: string | null
          avg_discount_used?: string | null
          avg_order_value?: number | null
          avg_scroll_depth?: number | null
          avg_session_duration_sec?: number | null
          beauty_affinity?: number | null
          best_contact_time?: string | null
          books_affinity?: number | null
          brand_preference?: string | null
          cart_abandonments_30d?: string | null
          cart_additions_30d?: number | null
          churn_risk_score?: number | null
          city?: string | null
          customer_id?: string
          data_generated_date?: string | null
          days_since_last_purchase?: number | null
          delivery_speed_preference?: string | null
          electronics_affinity?: number | null
          email_click_rate?: number | null
          email_open_rate?: number | null
          emails_sent_30d?: number | null
          fashion_affinity?: number | null
          festive_purchase_ratio?: string | null
          festive_purchases?: string | null
          gender?: string | null
          home_affinity?: number | null
          income_bracket?: string | null
          intent_category?: string | null
          intent_score?: number | null
          last_purchase_date?: string | null
          last_whatsapp_sentiment?: number | null
          lifetime_value_predicted?: number | null
          mobile_usage_ratio?: number | null
          page_views_30d?: number | null
          payday_purchase_ratio?: string | null
          payday_purchases?: string | null
          peak_shopping_month?: number | null
          predicted_campaign_roi?: number | null
          preferred_channel?: string | null
          preferred_payment?: string | null
          primary_category?: string | null
          primary_device?: string | null
          primary_traffic_source?: string | null
          recommended_campaign?: string | null
          registration_date?: string | null
          repeat_purchase_prob_7d?: string | null
          search_queries_30d?: number | null
          sports_affinity?: number | null
          total_orders?: number | null
          total_spent?: number | null
          upsell_potential?: number | null
          weekend_shopper?: boolean | null
          whatsapp_interactions_30d?: string | null
          whatsapp_response_rate?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
