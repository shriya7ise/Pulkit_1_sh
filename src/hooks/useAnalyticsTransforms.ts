import { Layer1Customer } from "./useLayer1Data";

// Advanced analytics transformations for Layer1 data
export const getAffinityAnalysis = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const categories = [
    { name: 'Electronics', key: 'electronics_affinity' },
    { name: 'Fashion', key: 'fashion_affinity' },
    { name: 'Home', key: 'home_affinity' },
    { name: 'Beauty', key: 'beauty_affinity' },
    { name: 'Sports', key: 'sports_affinity' },
    { name: 'Books', key: 'books_affinity' }
  ];

  return categories.map(category => {
    const avgAffinity = data.reduce((sum, customer) => 
      sum + (customer[category.key as keyof Layer1Customer] as number || 0), 0) / data.length;
    
    const highAffinityCount = data.filter(customer => 
      (customer[category.key as keyof Layer1Customer] as number || 0) > 0.7).length;
    
    return {
      category: category.name,
      avgAffinity: Math.round(avgAffinity * 100),
      highAffinityCustomers: highAffinityCount,
      percentage: Math.round((highAffinityCount / data.length) * 100)
    };
  });
};

export const getTrafficSourceAnalysis = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const sources = data.reduce((acc, customer) => {
    const source = customer.primary_traffic_source || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(sources).map(([source, count]) => ({
    source,
    customers: count,
    percentage: Math.round((count / data.length) * 100),
    avgSpent: Math.round(
      data
        .filter(c => c.primary_traffic_source === source)
        .reduce((sum, c) => sum + (c.total_spent || 0), 0) / count
    )
  }));
};

export const getDeviceUsageAnalysis = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const devices = data.reduce((acc, customer) => {
    const device = customer.primary_device || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(devices).map(([device, count]) => ({
    device,
    users: count,
    percentage: Math.round((count / data.length) * 100),
    avgMobileRatio: Math.round(
      data
        .filter(c => c.primary_device === device)
        .reduce((sum, c) => sum + (c.mobile_usage_ratio || 0), 0) / count * 100
    )
  }));
};

export const getEngagementMetrics = (data: Layer1Customer[]) => {
  if (!data) return {
    avgSessionDuration: 0,
    avgScrollDepth: 0,
    avgPageViews: 0,
    avgSearchQueries: 0,
    totalCartAdditions: 0,
    totalCartAbandonments: 0
  };

  return {
    avgSessionDuration: Math.round(
      data.reduce((sum, c) => sum + (c.avg_session_duration_sec || 0), 0) / data.length
    ),
    avgScrollDepth: Math.round(
      data.reduce((sum, c) => sum + (c.avg_scroll_depth || 0), 0) / data.length * 100
    ),
    avgPageViews: Math.round(
      data.reduce((sum, c) => sum + (c.page_views_30d || 0), 0) / data.length
    ),
    avgSearchQueries: Math.round(
      data.reduce((sum, c) => sum + (c.search_queries_30d || 0), 0) / data.length
    ),
    totalCartAdditions: data.reduce((sum, c) => sum + (c.cart_additions_30d || 0), 0),
    totalCartAbandonments: data.reduce((sum, c) => sum + (c.cart_abandonments_30d || 0), 0)
  };
};

export const getChurnRiskSegmentation = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const segments = [
    { name: 'Low Risk', min: 0, max: 0.3, color: 'hsl(142, 76%, 36%)' },
    { name: 'Medium Risk', min: 0.3, max: 0.6, color: 'hsl(32, 95%, 44%)' },
    { name: 'High Risk', min: 0.6, max: 0.8, color: 'hsl(25, 95%, 53%)' },
    { name: 'Critical Risk', min: 0.8, max: 1, color: 'hsl(0, 84%, 60%)' }
  ];

  return segments.map(segment => {
    const customers = data.filter(c => {
      const score = c.churn_risk_score || 0;
      return score >= segment.min && score < segment.max;
    });
    
    const avgCLV = customers.reduce((sum, c) => 
      sum + (c.lifetime_value_predicted || c.total_spent || 0), 0) / customers.length || 0;

    return {
      segment: segment.name,
      customers: customers.length,
      percentage: Math.round((customers.length / data.length) * 100),
      avgCLV: Math.round(avgCLV),
      color: segment.color,
      avgDaysSincePurchase: Math.round(
        customers.reduce((sum, c) => sum + (c.days_since_last_purchase || 0), 0) / customers.length || 0
      )
    };
  });
};

export const getCampaignROIAnalysis = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const campaigns = data.reduce((acc, customer) => {
    const campaign = customer.recommended_campaign || 'No Campaign';
    if (!acc[campaign]) {
      acc[campaign] = {
        customers: 0,
        totalPredictedROI: 0,
        totalSpent: 0,
        avgIntentScore: 0
      };
    }
    acc[campaign].customers += 1;
    acc[campaign].totalPredictedROI += customer.predicted_campaign_roi || 0;
    acc[campaign].totalSpent += customer.total_spent || 0;
    acc[campaign].avgIntentScore += customer.intent_score || 0;
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(campaigns).map(([campaign, data]) => ({
    campaign,
    customers: data.customers,
    avgROI: Math.round(data.totalPredictedROI / data.customers * 100) / 100,
    totalSpent: data.totalSpent,
    avgIntentScore: Math.round(data.avgIntentScore / data.customers * 100) / 100,
    efficiency: Math.round((data.totalPredictedROI / data.customers) * 10) / 10
  }));
};

export const getSeasonalAnalysis = (data: Layer1Customer[]) => {
  if (!data) return [];
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleDateString('en', { month: 'short' }),
    festiveCustomers: 0,
    paydayCustomers: 0,
    peakShoppers: 0,
    avgSpent: 0
  }));

  data.forEach(customer => {
    const peakMonth = customer.peak_shopping_month;
    if (peakMonth && peakMonth >= 1 && peakMonth <= 12) {
      months[peakMonth - 1].peakShoppers += 1;
      months[peakMonth - 1].avgSpent += customer.total_spent || 0;
    }
  });

  return months.map(month => ({
    ...month,
    avgSpent: month.peakShoppers > 0 ? Math.round(month.avgSpent / month.peakShoppers) : 0
  }));
};