import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Layer1Customer {
  customer_id: string;
  registration_date?: string;
  age?: number;
  gender?: string;
  city?: string;
  income_bracket?: string;
  total_orders?: number;
  total_spent?: number;
  avg_order_value?: number;
  last_purchase_date?: string;
  days_since_last_purchase?: number;
  festive_purchases?: string;
  payday_purchases?: string;
  festive_purchase_ratio?: string;
  payday_purchase_ratio?: string;
  avg_discount_used?: string;
  page_views_30d?: number;
  search_queries_30d?: number;
  cart_additions_30d?: number;
  cart_abandonments_30d?: number;
  intent_score?: number;
  intent_category?: string;
  avg_session_duration_sec?: number;
  avg_scroll_depth?: number;
  mobile_usage_ratio?: number;
  primary_device?: string;
  primary_traffic_source?: string;
  preferred_channel?: string;
  best_contact_time?: string;
  whatsapp_interactions_30d?: number;
  whatsapp_response_rate?: number;
  last_whatsapp_sentiment?: number;
  emails_sent_30d?: number;
  email_open_rate?: number;
  email_click_rate?: number;
  primary_category?: string;
  electronics_affinity?: number;
  fashion_affinity?: number;
  home_affinity?: number;
  beauty_affinity?: number;
  sports_affinity?: number;
  books_affinity?: number;
  churn_risk_score?: number;
  repeat_purchase_prob_7d?: string;
  upsell_potential?: number;
  lifetime_value_predicted?: number;
  brand_preference?: string;
  peak_shopping_month?: number;
  weekend_shopper?: boolean;
  preferred_payment?: string;
  delivery_speed_preference?: string;
  assigned_cohorts?: string;
  recommended_campaign?: string;
  predicted_campaign_roi?: number;
  data_generated_date?: string;
}

export const useLayer1Data = () => {
  return useQuery({
    queryKey: ["layer1-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Layer1")
        .select("*");

      if (error) {
        throw error;
      }

      // Transform the data to match our interface, handling type conversions
      const transformedData = data?.map(row => ({
        ...row,
        cart_abandonments_30d: Number(row.cart_abandonments_30d) || 0,
        whatsapp_response_rate: Number(row.whatsapp_response_rate) || 0,
        whatsapp_interactions_30d: Number(row.whatsapp_interactions_30d) || 0,
        emails_sent_30d: Number(row.emails_sent_30d) || 0,
        page_views_30d: Number(row.page_views_30d) || 0,
        search_queries_30d: Number(row.search_queries_30d) || 0,
        cart_additions_30d: Number(row.cart_additions_30d) || 0,
        total_orders: Number(row.total_orders) || 0,
        age: Number(row.age) || 0,
        days_since_last_purchase: Number(row.days_since_last_purchase) || 0,
        peak_shopping_month: Number(row.peak_shopping_month) || 0,
      })) as Layer1Customer[];

      return transformedData || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper functions to transform Layer1 data for analytics
export const transformLayer1ToRFM = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const segments = {
    "Champions": data.filter(c => (c.churn_risk_score || 0) < 0.2 && (c.total_spent || 0) > 1000),
    "Loyal": data.filter(c => (c.churn_risk_score || 0) < 0.3 && (c.total_spent || 0) > 500),
    "Need Attention": data.filter(c => (c.churn_risk_score || 0) >= 0.3 && (c.churn_risk_score || 0) < 0.6),
    "At Risk": data.filter(c => (c.churn_risk_score || 0) >= 0.6 && (c.churn_risk_score || 0) < 0.8),
    "Lost": data.filter(c => (c.churn_risk_score || 0) >= 0.8)
  };

  return Object.entries(segments).map(([segment, customers], index) => ({
    frequency: Math.min(5, Math.max(1, Math.round(customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) / customers.length || 1))),
    recency: Math.min(5, Math.max(1, 5 - Math.round((customers.reduce((sum, c) => sum + (c.days_since_last_purchase || 0), 0) / customers.length || 0) / 30))),
    monetary: Math.round(customers.reduce((sum, c) => sum + (c.total_spent || 0), 0) / customers.length || 0),
    customers: customers.length,
    segment
  }));
};

export const transformLayer1ToCLV = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const ranges = [
    { range: "$0-100", min: 0, max: 100 },
    { range: "$100-500", min: 100, max: 500 },
    { range: "$500-1000", min: 500, max: 1000 },
    { range: "$1000-2000", min: 1000, max: 2000 },
    { range: "$2000+", min: 2000, max: Infinity }
  ];

  return ranges.map(({ range, min, max }) => {
    const customers = data.filter(c => {
      const clv = c.lifetime_value_predicted || c.total_spent || 0;
      return clv >= min && (max === Infinity ? true : clv < max);
    });
    
    return {
      range,
      customers: customers.length,
      percentage: Math.round((customers.length / data.length) * 100)
    };
  });
};

export const getChannelMatrix = (data: Layer1Customer[]) => {
  if (!data) return [];

  const channels = ["WhatsApp", "Email", "SMS", "Website"];
  const segments = ["Champions", "Loyal", "At Risk", "Lost"];

  return channels.map(channel => {
    const channelData: any = { channel };
    
    segments.forEach(segment => {
      let customers: Layer1Customer[] = [];
      
      switch (segment) {
        case "Champions":
          customers = data.filter(c => (c.churn_risk_score || 0) < 0.2 && (c.total_spent || 0) > 1000);
          break;
        case "Loyal":
          customers = data.filter(c => (c.churn_risk_score || 0) < 0.3 && (c.total_spent || 0) > 500);
          break;
        case "At Risk":
          customers = data.filter(c => (c.churn_risk_score || 0) >= 0.3 && (c.churn_risk_score || 0) < 0.6);
          break;
        case "Lost":
          customers = data.filter(c => (c.churn_risk_score || 0) >= 0.8);
          break;
      }

      // Calculate response rate based on channel preference and email rates
      let responseRate = 0;
      if (channel === "Email") {
        responseRate = customers.reduce((sum, c) => sum + (c.email_open_rate || 0), 0) / customers.length || 0;
        responseRate = Math.round(responseRate * 100);
      } else if (channel === "WhatsApp") {
        responseRate = Math.round(customers.reduce((sum, c) => sum + (c.whatsapp_response_rate || 0), 0) / customers.length || 0);
      } else {
        // Estimate based on segment quality
        const baseRate = segment === "Champions" ? 80 : segment === "Loyal" ? 60 : segment === "At Risk" ? 35 : 15;
        responseRate = baseRate + Math.random() * 10 - 5; // Add some variance
        responseRate = Math.round(Math.max(0, Math.min(100, responseRate)));
      }

      channelData[segment.toLowerCase().replace(" ", "")] = responseRate;
    });

    return channelData;
  });
};