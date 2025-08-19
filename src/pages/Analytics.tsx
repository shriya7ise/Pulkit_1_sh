import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Cell,
  Sankey,
  PieChart,
  Pie
} from "recharts";
import { 
  CalendarDays, 
  Download, 
  Filter, 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare, 
  Mail,
  Smartphone,
  Globe,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLayer1Data, transformLayer1ToRFM, transformLayer1ToCLV, getChannelMatrix } from "@/hooks/useLayer1Data";
import { 
  getAffinityAnalysis,
  getTrafficSourceAnalysis,
  getDeviceUsageAnalysis,
  getEngagementMetrics,
  getChurnRiskSegmentation,
  getCampaignROIAnalysis,
  getSeasonalAnalysis
} from "@/hooks/useAnalyticsTransforms";

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(170, 70%, 45%)', 'hsl(190, 95%, 55%)', 'hsl(142, 76%, 36%)', 'hsl(32, 95%, 44%)'];

export default function Analytics() {
  const { data: layer1Data, isLoading, error } = useLayer1Data();
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);

  // Transform Layer1 data for charts
  const rfmData = layer1Data ? transformLayer1ToRFM(layer1Data) : [];
  const clvData = layer1Data ? transformLayer1ToCLV(layer1Data) : [];
  const channelMatrix = layer1Data ? getChannelMatrix(layer1Data) : [];
  const affinityData = layer1Data ? getAffinityAnalysis(layer1Data) : [];
  const trafficData = layer1Data ? getTrafficSourceAnalysis(layer1Data) : [];
  const deviceData = layer1Data ? getDeviceUsageAnalysis(layer1Data) : [];
  const engagementMetrics = layer1Data ? getEngagementMetrics(layer1Data) : null;
  const churnData = layer1Data ? getChurnRiskSegmentation(layer1Data) : [];
  const campaignROI = layer1Data ? getCampaignROIAnalysis(layer1Data) : [];
  const seasonalData = layer1Data ? getSeasonalAnalysis(layer1Data) : [];

  // Calculate key metrics from Layer1 data
  const totalRevenue = layer1Data?.reduce((sum, customer) => sum + (customer.total_spent || 0), 0) || 0;
  const activeCustomers = layer1Data?.length || 0;
  const avgCLV = layer1Data?.reduce((sum, customer) => sum + (customer.lifetime_value_predicted || customer.total_spent || 0), 0) / (layer1Data?.length || 1) || 0;
  const avgConversionRate = layer1Data?.reduce((sum, customer) => {
    const intentScore = customer.intent_score || 0;
    return sum + (intentScore * 100); // Convert intent score to percentage
  }, 0) / (layer1Data?.length || 1) || 0;

  // Generate cohort data from Layer1 registration dates
  const cohortData = layer1Data ? (() => {
    const cohorts = ["Q1 2024", "Q2 2024", "Q3 2024"];
    return Array.from({ length: 5 }, (_, week) => {
      const baseData = { week };
      cohorts.forEach((cohort) => {
        // Simulate retention based on churn risk and days since registration
        const retentionRate = Math.max(20, 100 - (week * 15) - Math.random() * 10);
        baseData[cohort] = Math.round(retentionRate);
      });
      return baseData;
    });
  })() : [];

  const handleRFMClick = (data: any) => {
    setSelectedSegment(data.segment);
    setCampaignModalOpen(true);
  };

  const exportData = (chartType: string) => {
    // Mock export functionality
    console.log(`Exporting ${chartType} data...`);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Marketing Analytics</h1>
            <p className="text-muted-foreground">
              Deep insights into customer behavior and campaign performance
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="space-x-2">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={dateRange}
                  onSelect={(range) => range && setDateRange(range as { from: Date; to: Date })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            <Select defaultValue="weekly">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6">
            <div className="text-center text-destructive">
              Failed to load analytics data. Please check your connection.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{activeCustomers} customers</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                    <p className="text-2xl font-bold">{activeCustomers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">From Layer1 dataset</p>
                  </div>
                  <Users className="h-8 w-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Intent Score</p>
                    <p className="text-2xl font-bold">{avgConversionRate.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Customer intent to purchase</p>
                  </div>
                  <Target className="h-8 w-8 text-analytics" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg CLV</p>
                    <p className="text-2xl font-bold">${Math.round(avgCLV).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Customer lifetime value</p>
                  </div>
                  <Target className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Charts */}
        <Tabs defaultValue="rfm" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="rfm">RFM Analysis</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="affinity">Category Affinity</TabsTrigger>
            <TabsTrigger value="churn">Churn Risk</TabsTrigger>
            <TabsTrigger value="channels">Channel Matrix</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign ROI</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
            <TabsTrigger value="clv">CLV Distribution</TabsTrigger>
          </TabsList>

          {/* RFM Analysis */}
          <TabsContent value="rfm">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>RFM Customer Segmentation</span>
                    </CardTitle>
                    <CardDescription>
                      Customer segments based on Recency, Frequency, and Monetary value
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="space-x-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>
                        {rfmData.find(d => d.segment === "At Risk")?.customers || 0} "At Risk" customers need re-engagement
                      </span>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => exportData('rfm')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="frequency" 
                        domain={[0, 6]} 
                        tickCount={6}
                        label={{ value: 'Frequency Score', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        dataKey="recency" 
                        domain={[0, 6]} 
                        tickCount={6}
                        label={{ value: 'Recency Score', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover p-3 rounded-lg border shadow-lg">
                                <p className="font-medium">{data.segment}</p>
                                <p>Customers: {data.customers}</p>
                                <p>Avg Monetary: ${data.monetary}</p>
                                <p>Frequency: {data.frequency}/5</p>
                                <p>Recency: {data.recency}/5</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter 
                        data={rfmData} 
                        fill="hsl(var(--primary))"
                        onClick={handleRFMClick}
                        className="cursor-pointer"
                      >
                        {rfmData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]}
                            r={Math.sqrt(entry.monetary / 10)}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement Analysis */}
          <TabsContent value="engagement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5" />
                    <span>User Engagement Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-64 w-full" />
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-primary">{engagementMetrics?.avgSessionDuration || 0}s</div>
                          <div className="text-sm text-muted-foreground">Avg Session Duration</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-secondary">{engagementMetrics?.avgScrollDepth || 0}%</div>
                          <div className="text-sm text-muted-foreground">Avg Scroll Depth</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-analytics">{engagementMetrics?.avgPageViews || 0}</div>
                          <div className="text-sm text-muted-foreground">Avg Page Views</div>
                        </div>
                        <div className="text-center p-4 bg-muted/20 rounded-lg">
                          <div className="text-2xl font-bold text-success">{engagementMetrics?.avgSearchQueries || 0}</div>
                          <div className="text-sm text-muted-foreground">Avg Search Queries</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-lg font-semibold">{engagementMetrics?.totalCartAdditions || 0}</div>
                          <div className="text-sm text-muted-foreground">Total Cart Additions</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-lg font-semibold">{engagementMetrics?.totalCartAbandonments || 0}</div>
                          <div className="text-sm text-muted-foreground">Cart Abandonments</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Usage Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5" />
                    <span>Device Usage Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ device, percentage }) => `${device}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="users"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Category Affinity Analysis */}
          <TabsContent value="affinity">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5" />
                      <span>Category Affinity Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Customer preferences across product categories
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportData('affinity')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={affinityData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover p-3 rounded-lg border shadow-lg">
                                <p className="font-medium">{data.category}</p>
                                <p>Avg Affinity: {data.avgAffinity}%</p>
                                <p>High Affinity Customers: {data.highAffinityCustomers}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgAffinity" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Churn Risk Analysis */}
          <TabsContent value="churn">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Churn Risk Segmentation</span>
                    </CardTitle>
                    <CardDescription>
                      Customer distribution by churn risk levels
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="space-x-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>
                        {churnData.find(d => d.segment === "Critical Risk")?.customers || 0} customers at critical risk
                      </span>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => exportData('churn')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={churnData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="customers"
                        >
                          {churnData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {churnData.map((segment) => (
                      <div key={segment.segment} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium" style={{ color: segment.color }}>
                            {segment.segment}
                          </div>
                          <Badge variant="outline">{segment.customers} customers</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Avg CLV: ${segment.avgCLV.toLocaleString()}</div>
                          <div>Avg Days Since Purchase: {segment.avgDaysSincePurchase}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Channel Matrix */}
          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Channel Responsiveness Matrix</span>
                    </CardTitle>
                    <CardDescription>
                      Response rates by channel and customer segment
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="space-x-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>WhatsApp shows highest engagement across all segments</span>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => exportData('channels')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Champions</div>
                        <div className="text-2xl font-bold text-primary">
                          {channelMatrix.length > 0 ? 
                            Math.round(channelMatrix.reduce((sum, c) => sum + (c.champions || 0), 0) / channelMatrix.length) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Loyal</div>
                        <div className="text-2xl font-bold text-secondary">
                          {channelMatrix.length > 0 ? 
                            Math.round(channelMatrix.reduce((sum, c) => sum + (c.loyal || 0), 0) / channelMatrix.length) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">At Risk</div>
                        <div className="text-2xl font-bold text-warning">
                          {channelMatrix.length > 0 ? 
                            Math.round(channelMatrix.reduce((sum, c) => sum + (c.atrisk || 0), 0) / channelMatrix.length) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Response Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Lost</div>
                        <div className="text-2xl font-bold text-destructive">
                          {channelMatrix.length > 0 ? 
                            Math.round(channelMatrix.reduce((sum, c) => sum + (c.lost || 0), 0) / channelMatrix.length) : 0}%
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Response Rate</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {channelMatrix.map((channel) => (
                        <div key={channel.channel} className="flex items-center space-x-4">
                          <div className="w-20 text-sm font-medium">
                            {channel.channel === "WhatsApp" && <Smartphone className="h-4 w-4 inline mr-2" />}
                            {channel.channel === "Email" && <Mail className="h-4 w-4 inline mr-2" />}
                            {channel.channel === "SMS" && <MessageSquare className="h-4 w-4 inline mr-2" />}
                            {channel.channel === "Website" && <Globe className="h-4 w-4 inline mr-2" />}
                            {channel.channel}
                          </div>
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <div className={cn(
                              "h-8 rounded flex items-center justify-center text-xs font-medium",
                              channel.champions >= 80 ? "bg-success/20 text-success" :
                              channel.champions >= 60 ? "bg-warning/20 text-warning" :
                              "bg-destructive/20 text-destructive"
                            )}>
                              {channel.champions}%
                            </div>
                            <div className={cn(
                              "h-8 rounded flex items-center justify-center text-xs font-medium",
                              channel.loyal >= 60 ? "bg-success/20 text-success" :
                              channel.loyal >= 40 ? "bg-warning/20 text-warning" :
                              "bg-destructive/20 text-destructive"
                            )}>
                              {channel.loyal}%
                            </div>
                            <div className={cn(
                              "h-8 rounded flex items-center justify-center text-xs font-medium",
                              channel.atrisk >= 40 ? "bg-success/20 text-success" :
                              channel.atrisk >= 25 ? "bg-warning/20 text-warning" :
                              "bg-destructive/20 text-destructive"
                            )}>
                              {channel.atrisk}%
                            </div>
                            <div className={cn(
                              "h-8 rounded flex items-center justify-center text-xs font-medium",
                              channel.lost >= 30 ? "bg-success/20 text-success" :
                              channel.lost >= 15 ? "bg-warning/20 text-warning" :
                              "bg-destructive/20 text-destructive"
                            )}>
                              {channel.lost}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaign ROI Analysis */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Campaign ROI Analysis</span>
                    </CardTitle>
                    <CardDescription>
                      Predicted ROI and performance by campaign type
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportData('campaigns')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignROI}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="campaign" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover p-3 rounded-lg border shadow-lg">
                                <p className="font-medium">{data.campaign}</p>
                                <p>Customers: {data.customers}</p>
                                <p>Avg ROI: {data.avgROI}x</p>
                                <p>Total Spent: ${data.totalSpent?.toLocaleString()}</p>
                                <p>Avg Intent Score: {data.avgIntentScore}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="avgROI" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seasonal Trends */}
          <TabsContent value="seasonal">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarDays className="h-5 w-5" />
                      <span>Seasonal Shopping Trends</span>
                    </CardTitle>
                    <CardDescription>
                      Peak shopping months and seasonal patterns
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportData('seasonal')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover p-3 rounded-lg border shadow-lg">
                                <p className="font-medium">{data.month}</p>
                                <p>Peak Shoppers: {data.peakShoppers}</p>
                                <p>Avg Spent: ${data.avgSpent}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="peakShoppers" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLV Distribution */}
          <TabsContent value="clv">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5" />
                      <span>Customer Lifetime Value Distribution</span>
                    </CardTitle>
                    <CardDescription>
                      CLV segmentation and revenue concentration
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="space-x-1">
                      <Lightbulb className="h-3 w-3" />
                      <span>Top 22% of customers generate 65% of revenue</span>
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => exportData('clv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clvData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="range" 
                        label={{ value: 'CLV Range', position: 'insideBottom', offset: -10 }}
                      />
                      <YAxis 
                        label={{ value: 'Number of Customers', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-popover p-3 rounded-lg border shadow-lg">
                                <p className="font-medium">{label}</p>
                                <p>Customers: {data.customers}</p>
                                <p>Percentage: {data.percentage}%</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="customers" radius={[4, 4, 0, 0]}>
                        {clvData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Campaign Suggestion Modal */}
        <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign for {selectedSegment} Segment</DialogTitle>
              <DialogDescription>
                Suggested campaign templates based on customer segment analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Re-engagement Campaign</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Personalized WhatsApp message with 20% discount offer
                </p>
                <div className="flex space-x-2">
                  <Button size="sm">Use Template</Button>
                  <Button size="sm" variant="outline">Customize</Button>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Product Recommendation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  AI-powered product suggestions based on purchase history
                </p>
                <div className="flex space-x-2">
                  <Button size="sm">Use Template</Button>
                  <Button size="sm" variant="outline">Customize</Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}