'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    DollarSign,
    MapPin,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

interface LocationInsight {
  division: string;
  district: string;
  lat: number;
  lng: number;
  marketScore: number;
  penetrationRate: number;
  competitionLevel: 'low' | 'medium' | 'high';
  customerAcquisitionCost: number;
  averageOrderValue: number;
  conversionRate: number;
  seasonalTrends: Array<{
    month: string;
    orderMultiplier: number;
  }>;
  demographics: {
    ageGroups: Array<{ group: string; percentage: number }>;
    incomeLevels: Array<{ level: string; percentage: number }>;
  };
  recommendations: {
    campaignType: string[];
    budget: number;
    expectedROI: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeline: string;
  };
}

interface CampaignOpportunity {
  id: string;
  name: string;
  targetLocations: string[];
  estimatedReach: number;
  estimatedCost: number;
  expectedRevenue: number;
  roi: number;
  confidence: number;
  timeline: string;
  campaignType: 'awareness' | 'conversion' | 'retention' | 'expansion';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const LocationTargetingInsights: React.FC = () => {
  const [locationInsights, setLocationInsights] = useState<LocationInsight[]>([]);
  const [campaignOpportunities, setCampaignOpportunities] = useState<CampaignOpportunity[]>([]);
  const [marketAnalysis, setMarketAnalysis] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [budgetRange, setBudgetRange] = useState<string>('medium');

  const fetchLocationTargetingData = async () => {
    setLoading(true);
    try {
      // Mock data for location targeting insights
      const mockLocationInsights: LocationInsight[] = [
        {
          division: 'Dhaka Division',
          district: 'Dhaka',
          lat: 23.8103,
          lng: 90.4125,
          marketScore: 92,
          penetrationRate: 0.34,
          competitionLevel: 'high',
          customerAcquisitionCost: 150,
          averageOrderValue: 2800,
          conversionRate: 0.078,
          seasonalTrends: [
            { month: 'Jan', orderMultiplier: 1.2 },
            { month: 'Feb', orderMultiplier: 0.9 },
            { month: 'Mar', orderMultiplier: 1.1 },
            { month: 'Apr', orderMultiplier: 1.3 },
            { month: 'May', orderMultiplier: 1.4 },
            { month: 'Jun', orderMultiplier: 1.1 }
          ],
          demographics: {
            ageGroups: [
              { group: '18-25', percentage: 28 },
              { group: '26-35', percentage: 42 },
              { group: '36-45', percentage: 20 },
              { group: '46+', percentage: 10 }
            ],
            incomeLevels: [
              { level: 'High', percentage: 35 },
              { level: 'Medium', percentage: 45 },
              { level: 'Low', percentage: 20 }
            ]
          },
          recommendations: {
            campaignType: ['Digital Ads', 'Social Media', 'Influencer Marketing'],
            budget: 250000,
            expectedROI: 3.2,
            priority: 'high',
            timeline: '3-6 months'
          }
        },
        {
          division: 'Chittagong Division',
          district: 'Chittagong',
          lat: 22.3569,
          lng: 91.7832,
          marketScore: 78,
          penetrationRate: 0.22,
          competitionLevel: 'medium',
          customerAcquisitionCost: 120,
          averageOrderValue: 2400,
          conversionRate: 0.085,
          seasonalTrends: [
            { month: 'Jan', orderMultiplier: 1.0 },
            { month: 'Feb', orderMultiplier: 0.8 },
            { month: 'Mar', orderMultiplier: 1.2 },
            { month: 'Apr', orderMultiplier: 1.5 },
            { month: 'May', orderMultiplier: 1.3 },
            { month: 'Jun', orderMultiplier: 1.1 }
          ],
          demographics: {
            ageGroups: [
              { group: '18-25', percentage: 32 },
              { group: '26-35', percentage: 38 },
              { group: '36-45', percentage: 22 },
              { group: '46+', percentage: 8 }
            ],
            incomeLevels: [
              { level: 'High', percentage: 25 },
              { level: 'Medium', percentage: 50 },
              { level: 'Low', percentage: 25 }
            ]
          },
          recommendations: {
            campaignType: ['Local Events', 'Digital Ads', 'Community Outreach'],
            budget: 180000,
            expectedROI: 3.8,
            priority: 'high',
            timeline: '2-4 months'
          }
        },
        {
          division: 'Sylhet Division',
          district: 'Sylhet',
          lat: 24.8949,
          lng: 91.8687,
          marketScore: 85,
          penetrationRate: 0.18,
          competitionLevel: 'low',
          customerAcquisitionCost: 95,
          averageOrderValue: 2600,
          conversionRate: 0.092,
          seasonalTrends: [
            { month: 'Jan', orderMultiplier: 0.9 },
            { month: 'Feb', orderMultiplier: 0.7 },
            { month: 'Mar', orderMultiplier: 1.0 },
            { month: 'Apr', orderMultiplier: 1.6 },
            { month: 'May', orderMultiplier: 1.4 },
            { month: 'Jun', orderMultiplier: 1.2 }
          ],
          demographics: {
            ageGroups: [
              { group: '18-25', percentage: 35 },
              { group: '26-35', percentage: 40 },
              { group: '36-45', percentage: 18 },
              { group: '46+', percentage: 7 }
            ],
            incomeLevels: [
              { level: 'High', percentage: 30 },
              { level: 'Medium', percentage: 55 },
              { level: 'Low', percentage: 15 }
            ]
          },
          recommendations: {
            campaignType: ['Local Partnerships', 'Digital Ads', 'Word of Mouth'],
            budget: 140000,
            expectedROI: 4.2,
            priority: 'critical',
            timeline: '1-3 months'
          }
        },
        {
          division: 'Rajshahi Division',
          district: 'Rajshahi',
          lat: 24.3745,
          lng: 88.6042,
          marketScore: 72,
          penetrationRate: 0.15,
          competitionLevel: 'low',
          customerAcquisitionCost: 85,
          averageOrderValue: 2200,
          conversionRate: 0.088,
          seasonalTrends: [
            { month: 'Jan', orderMultiplier: 1.1 },
            { month: 'Feb', orderMultiplier: 0.9 },
            { month: 'Mar', orderMultiplier: 1.3 },
            { month: 'Apr', orderMultiplier: 1.4 },
            { month: 'May', orderMultiplier: 1.2 },
            { month: 'Jun', orderMultiplier: 1.0 }
          ],
          demographics: {
            ageGroups: [
              { group: '18-25', percentage: 30 },
              { group: '26-35', percentage: 35 },
              { group: '36-45', percentage: 25 },
              { group: '46+', percentage: 10 }
            ],
            incomeLevels: [
              { level: 'High', percentage: 20 },
              { level: 'Medium', percentage: 60 },
              { level: 'Low', percentage: 20 }
            ]
          },
          recommendations: {
            campaignType: ['Local Media', 'Community Events', 'Digital Ads'],
            budget: 120000,
            expectedROI: 3.9,
            priority: 'medium',
            timeline: '2-5 months'
          }
        }
      ];

      setLocationInsights(mockLocationInsights);

      // Generate campaign opportunities
      const opportunities: CampaignOpportunity[] = [
        {
          id: '1',
          name: 'Sylhet Youth Engagement Campaign',
          targetLocations: ['Sylhet Division'],
          estimatedReach: 45000,
          estimatedCost: 140000,
          expectedRevenue: 588000,
          roi: 4.2,
          confidence: 0.87,
          timeline: '8-12 weeks',
          campaignType: 'awareness',
          priority: 'critical'
        },
        {
          id: '2',
          name: 'Chittagong Port City Digital Push',
          targetLocations: ['Chittagong Division'],
          estimatedReach: 62000,
          estimatedCost: 180000,
          expectedRevenue: 684000,
          roi: 3.8,
          confidence: 0.83,
          timeline: '6-10 weeks',
          campaignType: 'conversion',
          priority: 'high'
        },
        {
          id: '3',
          name: 'Dhaka Premium Customer Retention',
          targetLocations: ['Dhaka Division'],
          estimatedReach: 28000,
          estimatedCost: 250000,
          expectedRevenue: 800000,
          roi: 3.2,
          confidence: 0.91,
          timeline: '12-16 weeks',
          campaignType: 'retention',
          priority: 'high'
        },
        {
          id: '4',
          name: 'Rajshahi Market Entry Campaign',
          targetLocations: ['Rajshahi Division'],
          estimatedReach: 38000,
          estimatedCost: 120000,
          expectedRevenue: 468000,
          roi: 3.9,
          confidence: 0.79,
          timeline: '10-14 weeks',
          campaignType: 'expansion',
          priority: 'medium'
        }
      ];

      setCampaignOpportunities(opportunities);

      // Generate market analysis data
      const marketData = mockLocationInsights.map(location => ({
        location: `${location.district}, ${location.division.replace(' Division', '')}`,
        marketScore: location.marketScore,
        penetrationRate: location.penetrationRate * 100,
        cac: location.customerAcquisitionCost,
        aov: location.averageOrderValue,
        conversionRate: location.conversionRate * 100,
        roi: location.recommendations.expectedROI
      }));

      setMarketAnalysis(marketData);

      // Generate performance metrics
      const performanceData = mockLocationInsights.map(location => ({
        division: location.division.replace(' Division', ''),
        marketScore: location.marketScore,
        penetrationRate: location.penetrationRate * 100,
        customerAcquisitionCost: location.customerAcquisitionCost,
        averageOrderValue: location.averageOrderValue,
        conversionRate: location.conversionRate * 100,
        expectedROI: location.recommendations.expectedROI
      }));

      setPerformanceMetrics(performanceData);

    } catch (error) {
      console.error('Failed to fetch location targeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocationTargetingData();
  }, [selectedDivision, budgetRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getTopOpportunities = () => {
    return campaignOpportunities
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3);
  };

  const getHighValueLocations = () => {
    return locationInsights
      .sort((a, b) => b.marketScore - a.marketScore)
      .slice(0, 4);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="p-2 border rounded-md bg-white"
          >
            <option value="">All Divisions</option>
            <option value="Dhaka Division">Dhaka</option>
            <option value="Chittagong Division">Chittagong</option>
            <option value="Sylhet Division">Sylhet</option>
            <option value="Rajshahi Division">Rajshahi</option>
          </select>
          <select
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            className="p-2 border rounded-md bg-white"
          >
            <option value="low">Low Budget (50K-150K)</option>
            <option value="medium">Medium Budget (150K-300K)</option>
            <option value="high">High Budget (300K+)</option>
          </select>
        </div>
        <Button onClick={fetchLocationTargetingData} disabled={loading}>
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-800">Campaign Opportunities</p>
                <p className="text-2xl font-bold text-purple-900">{campaignOpportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800">Avg Expected ROI</p>
                <p className="text-2xl font-bold text-green-900">
                  {(campaignOpportunities.reduce((sum, c) => sum + c.roi, 0) / campaignOpportunities.length).toFixed(1)}x
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Total Reach</p>
                <p className="text-2xl font-bold text-blue-900">
                  {(campaignOpportunities.reduce((sum, c) => sum + c.estimatedReach, 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-orange-800">Expected Revenue</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatCurrency(campaignOpportunities.reduce((sum, c) => sum + c.expectedRevenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Campaign Opportunities</TabsTrigger>
          <TabsTrigger value="locations">Location Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Strategic Recommendations</TabsTrigger>
        </TabsList>

        {/* Campaign Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROI vs Cost Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Campaign ROI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignOpportunities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'estimatedCost' || name === 'expectedRevenue' 
                          ? formatCurrency(value as number) 
                          : value,
                        name
                      ]}
                    />
                    <Bar dataKey="roi" fill="#3b82f6" name="ROI Multiplier" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reach vs Investment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Reach vs Investment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={campaignOpportunities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'estimatedCost' 
                          ? formatCurrency(value as number) 
                          : value,
                        name
                      ]}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="estimatedReach"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Estimated Reach"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="estimatedCost" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Investment Required"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Campaign Opportunities List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Top Campaign Opportunities
                <Badge variant="secondary">AI Recommended</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTopOpportunities().map((opportunity, index) => (
                  <div key={opportunity.id} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{opportunity.name}</h3>
                          <p className="text-sm text-muted-foreground">{opportunity.targetLocations.join(', ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(opportunity.priority)}>
                          {opportunity.priority} priority
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {opportunity.roi}x ROI
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground">Estimated Reach</div>
                        <div className="font-medium">{opportunity.estimatedReach.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Investment</div>
                        <div className="font-medium">{formatCurrency(opportunity.estimatedCost)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Revenue</div>
                        <div className="font-medium text-green-600">{formatCurrency(opportunity.expectedRevenue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Timeline</div>
                        <div className="font-medium">{opportunity.timeline}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-white/60 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          <strong>Campaign Type:</strong> {opportunity.campaignType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">
                          {(opportunity.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Analysis Tab */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Score Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Market Score by Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={marketAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="marketScore" fill="#3b82f6" name="Market Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Penetration Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Market Penetration Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketAnalysis}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="penetrationRate"
                      nameKey="location"
                    >
                      {marketAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 90}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Location Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                High-Value Location Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getHighValueLocations().map((location, index) => (
                  <div key={`${location.division}-${location.district}`} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full">
                          <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{location.district}, {location.division.replace(' Division', '')}</h3>
                          <p className="text-sm text-muted-foreground">Market Score: {location.marketScore}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={location.competitionLevel === 'low' ? 'text-green-600 bg-green-50 border-green-200' : 
                                        location.competitionLevel === 'medium' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                        'text-red-600 bg-red-50 border-red-200'}>
                          {location.competitionLevel} competition
                        </Badge>
                        <Badge className={getPriorityColor(location.recommendations.priority)}>
                          {location.recommendations.priority} priority
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <div className="text-muted-foreground">Penetration Rate</div>
                        <div className="font-medium">{(location.penetrationRate * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CAC</div>
                        <div className="font-medium">{formatCurrency(location.customerAcquisitionCost)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">AOV</div>
                        <div className="font-medium">{formatCurrency(location.averageOrderValue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Conversion Rate</div>
                        <div className="font-medium">{(location.conversionRate * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Recommended Campaigns:</strong> {location.recommendations.campaignType.join(', ')}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        <strong>Budget:</strong> {formatCurrency(location.recommendations.budget)} | 
                        <strong> Expected ROI:</strong> {location.recommendations.expectedROI}x | 
                        <strong> Timeline:</strong> {location.recommendations.timeline}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Metrics Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceMetrics}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="division" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Market Score"
                    dataKey="marketScore"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name="Conversion Rate"
                    dataKey="conversionRate"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategic Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Immediate Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Critical Priority
                    </h4>
                    <ul className="space-y-1 text-sm text-red-700">
                      <li>• Launch Sylhet youth engagement campaign within 2 weeks</li>
                      <li>• Increase marketing budget for high-ROI locations</li>
                      <li>• Implement retention campaigns in Dhaka immediately</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      High Priority (1-2 months)
                    </h4>
                    <ul className="space-y-1 text-sm text-orange-700">
                      <li>• Expand digital presence in Chittagong</li>
                      <li>• Partner with local influencers in key markets</li>
                      <li>• Optimize customer acquisition costs</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Medium Priority (2-6 months)
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Develop localized marketing materials</li>
                      <li>• Establish community partnerships</li>
                      <li>• Implement market-specific pricing strategies</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget Allocation Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium">Sylhet Division - 30%</h4>
                    <p className="text-sm text-muted-foreground">
                      Highest ROI potential (4.2x), low competition, excellent conversion rates
                    </p>
                    <p className="text-sm font-medium text-green-600">Recommended: 210K BDT</p>
                  </div>
                  
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-medium">Chittagong Division - 25%</h4>
                    <p className="text-sm text-muted-foreground">
                      Strong growth potential, medium competition, good conversion rates
                    </p>
                    <p className="text-sm font-medium text-green-600">Recommended: 175K BDT</p>
                  </div>
                  
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium">Dhaka Division - 25%</h4>
                    <p className="text-sm text-muted-foreground">
                      High market score, retention focus, premium customer base
                    </p>
                    <p className="text-sm font-medium text-green-600">Recommended: 175K BDT</p>
                  </div>
                  
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-medium">Rajshahi Division - 20%</h4>
                    <p className="text-sm text-muted-foreground">
                      Emerging market, low competition, cost-effective acquisition
                    </p>
                    <p className="text-sm font-medium text-green-600">Recommended: 140K BDT</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationTargetingInsights;
