import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  PieChart,
  Pie
} from "recharts";
import { 
  CalendarDays, 
  Download, 
  TrendingUp, 
  Users, 
  Target, 
  MessageSquare, 
  Mail,
  Smartphone,
  Globe,
  Lightbulb,
  UserCheck,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Award,
  Activity,
  Share,
  Heart,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useLayer1Data, transformLayer1ToRFM, transformLayer1ToCLV, getChannelMatrix } from "@/hooks/useLayer1Data";
import { 
  getIndianDemographics,
  getTrafficSourceAnalysis,
  getDeviceUsageAnalysis,
  getEngagementMetrics,
  getChurnRiskSegmentation,
  getCampaignROIAnalysis,
  getSeasonalAnalysis
} from "@/hooks/useAnalyticsTransforms";
import { formatINR } from "@/utils/currency";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export default function Analytics() {
  const { data: layer1Data, isLoading, error } = useLayer1Data();
  
  const [dateRange, setDateRange] = useState({ from: new Date(2024, 0, 1), to: new Date() });
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);

  const rfmData = layer1Data ? transformLayer1ToRFM(layer1Data) : [];
  const clvData = layer1Data ? transformLayer1ToCLV(layer1Data) : [];
  const channelMatrix = layer1Data ? getChannelMatrix(layer1Data) : [];
  const demographicsData = layer1Data ? getIndianDemographics(layer1Data) : null;
  const trafficData = layer1Data ? getTrafficSourceAnalysis(layer1Data) : [];
  const deviceData = layer1Data ? getDeviceUsageAnalysis(layer1Data) : [];
  const engagementMetrics = layer1Data ? getEngagementMetrics(layer1Data) : null;
  const churnData = layer1Data ? getChurnRiskSegmentation(layer1Data) : [];
  const campaignROI = layer1Data ? getCampaignROIAnalysis(layer1Data) : [];
  const seasonalData = layer1Data ? getSeasonalAnalysis(layer1Data) : [];

  const totalRevenue = layer1Data?.reduce((sum, customer) => sum + (customer.total_spent || 0), 0) || 0;
  const activeCustomers = layer1Data?.length || 0;
  const avgCLV = layer1Data?.reduce((sum, customer) => sum + (customer.lifetime_value_predicted || customer.total_spent || 0), 0) / (layer1Data?.length || 1) || 0;
  const avgConversionRate = layer1Data?.reduce((sum, customer) => {
    const intentScore = customer.intent_score || 0;
    return sum + (intentScore * 100);
  }, 0) / (layer1Data?.length || 1) || 0;

  const handleRFMClick = (data) => {
    if (data && data.segment) {
      setSelectedSegment(data.segment);
      setCampaignModalOpen(true);
    }
  };

  const exportData = (chartType) => {
    console.log(`Exporting ${chartType} data...`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <Card className="p-6">
            <div className="text-center text-destructive">
              Failed to load analytics data. Please check your connection.
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Marketing Analytics</h1>
            <p className="text-muted-foreground">
              Deep insights into customer behavior and campaign performance
            </p>
          </div>
          
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
                  onSelect={(range) => range && setDateRange(range)}
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

            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatINR ? formatINR(totalRevenue) : `$${totalRevenue.toLocaleString()}`}</p>
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
                  <p className="text-2xl font-bold">{activeCustomers.toLocaleString('en-IN')}</p>
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
                  <p className="text-2xl font-bold">{formatINR ? formatINR(avgCLV) : `$${Math.round(avgCLV).toLocaleString()}`}</p>
                  <p className="text-xs text-muted-foreground">Customer lifetime value</p>
                </div>
                <Award className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rfm" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
            <TabsTrigger value="rfm">RFM Analysis</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="demographics">
              <UserCheck className="h-4 w-4 mr-2" />
              Demographics
            </TabsTrigger>
            <TabsTrigger value="churn">Churn Risk</TabsTrigger>
            <TabsTrigger value="channels">Channel Matrix</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign ROI</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
            <TabsTrigger value="clv">CLV Distribution</TabsTrigger>
          </TabsList>

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
                  <Button variant="outline" size="sm" onClick={() => exportData('rfm')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
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
                        formatter={(value, name, props) => [
                          `Customers: ${props.payload.customers}`,
                          `Avg Monetary: ${formatINR ? formatINR(props.payload.monetary) : `$${props.payload.monetary}`}`
                        ]}
                      />
                      <Scatter data={rfmData} fill="#3b82f6" onClick={handleRFMClick}>
                        {rfmData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Engagement Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{engagementMetrics?.avgSessionDuration || 0}s</div>
                        <div className="text-sm text-muted-foreground">Avg Session Duration</div>
                      </div>
                      <div className="text-center p-4 bg-muted/20 rounded-lg">
                        <div className="text-2xl font-bold text-secondary">{engagementMetrics?.avgScrollDepth || 0}%</div>
                        <div className="text-sm text-muted-foreground">Avg Scroll Depth</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Device Usage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="users"
                          label={({ device, percentage }) => `${device}: ${percentage}%`}
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

          <TabsContent value="demographics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>🇮🇳 Indian Market Demographics</span>
                      </CardTitle>
                      <CardDescription>
                        Customer demographic insights from Layer1 data
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportData('demographics')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {demographicsData ? (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{demographicsData.totalMalePercentage}%</div>
                            <div className="text-sm text-blue-700 font-medium">Male Customers</div>
                            <div className="text-xs text-blue-600 mt-1">Higher digital adoption</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{demographicsData.dominantAgeGroup}</div>
                            <div className="text-sm text-green-700 font-medium">Primary Age Group</div>
                            <div className="text-xs text-green-600 mt-1">{demographicsData.dominantAgePercentage}% of customer base</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{demographicsData.topState}</div>
                            <div className="text-sm text-purple-700 font-medium">Top State</div>
                            <div className="text-xs text-purple-600 mt-1">{demographicsData.topStatePercentage}% of customers</div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{demographicsData.dominantIncomeRange}</div>
                            <div className="text-sm text-yellow-700 font-medium">Peak Income Bracket</div>
                            <div className="text-xs text-yellow-600 mt-1">{demographicsData.dominantIncomePercentage}% of customers</div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5 text-red-600" />
                            <span>State-wise Distribution</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={demographicsData.stateDistribution}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ state, percentage }) => `${state}: ${percentage}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="customers"
                                >
                                  {demographicsData.stateDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Age Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={demographicsData.ageDistribution}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="ageGroup" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="customers" fill="#3b82f6" />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Gender Distribution</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={demographicsData.genderDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="customers"
                                    label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                                  >
                                    {demographicsData.genderDistribution.map((entry, index) => (
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

                      <Card>
                        <CardHeader>
                          <CardTitle>Annual Income Distribution (in Lakhs)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {demographicsData.incomeDistribution.map((income, index) => (
                              <div key={income.bracket} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{income.bracket}</span>
                                  <span className="text-sm text-gray-600">
                                    {income.percentage}% ({income.customers} customers)
                                  </span>
                                </div>
                                <Progress value={parseFloat(income.percentage)} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <UserCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg mb-2">No demographic data available</p>
                      <p className="text-sm text-gray-500">
                        Ensure your Layer1 data includes demographic fields like age, gender, city, and income_bracket
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="churn">
            <Card>
              <CardHeader>
                <CardTitle>Churn Risk Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={churnData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="customers"
                        label={({ segment, percentage }) => `${segment}: ${percentage}%`}
                      >
                        {churnData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="channels">
            <Card>
              <CardHeader>
                <CardTitle>Channel Responsiveness Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelMatrix.map((channel) => (
                    <div key={channel.channel} className="flex items-center space-x-4">
                      <div className="w-24 text-sm font-medium">{channel.channel}</div>
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        <div className="h-8 rounded flex items-center justify-center text-xs font-medium bg-green-100 text-green-800">
                          {channel.champions}%
                        </div>
                        <div className="h-8 rounded flex items-center justify-center text-xs font-medium bg-blue-100 text-blue-800">
                          {channel.loyal}%
                        </div>
                        <div className="h-8 rounded flex items-center justify-center text-xs font-medium bg-yellow-100 text-yellow-800">
                          {channel.atrisk}%
                        </div>
                        <div className="h-8 rounded flex items-center justify-center text-xs font-medium bg-red-100 text-red-800">
                          {channel.lost}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Campaign ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignROI}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="campaign" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value, name, props) => [
                        `ROI: ${value}x`,
                        `Total Spent: ${formatINR ? formatINR(props.payload.totalSpent) : `$${props.payload.totalSpent?.toLocaleString()}`}`
                      ]} />
                      <Bar dataKey="avgROI" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seasonal">
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Shopping Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value, name, props) => [
                        `Peak Shoppers: ${value}`,
                        `Avg Spent: ${formatINR ? formatINR(props.payload.avgSpent) : `$${props.payload.avgSpent}`}`
                      ]} />
                      <Line type="monotone" dataKey="peakShoppers" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clv">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={clvData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
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

        <Dialog open={campaignModalOpen} onOpenChange={setCampaignModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Campaign for {selectedSegment} Segment</DialogTitle>
              <DialogDescription>
                Suggested campaign templates based on Indian customer segment analysis
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">WhatsApp Re-engagement</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Personalized WhatsApp message with festival discount offer in regional language
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
