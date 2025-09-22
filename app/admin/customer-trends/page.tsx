'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import CustomerMapHeatmap from '@/components/admin/CustomerMapHeatmap';
import LocationTargetingInsights from '@/components/admin/LocationTargetingInsights';
import MLPredictionEngine from '@/components/admin/MLPredictionEngine';
import ProductDemandAnalytics from '@/components/admin/ProductDemandAnalytics';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  BarChart3,
  Brain,
  MapPin,
  Package,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

export default function CustomerTrendsPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Customer Trends & Analytics
                </h1>
                <p className="text-lg text-slate-600 max-w-3xl">
                  Comprehensive customer analytics with geographic heatmaps, AI-powered demand forecasting, location targeting insights, and advanced ML predictions
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <Zap className="h-3 w-3 mr-1" />
                    Real-time Data
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Interactive
                  </Badge>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <Brain className="h-3 w-3 mr-1" />
                    ML Insights
                  </Badge>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Heatmap</p>
                        <p className="text-xs text-slate-500">Geographic insights</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-purple-100 rounded-lg">
                        <Target className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Targeting</p>
                        <p className="text-xs text-slate-500">Campaign insights</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">Demand</p>
                        <p className="text-xs text-slate-500">Product analytics</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-100 rounded-lg">
                        <Brain className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-700 text-sm">ML Engine</p>
                        <p className="text-xs text-slate-500">AI predictions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          <Tabs defaultValue="heatmap" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-md border border-white/20 p-1">
              <TabsTrigger value="heatmap" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Geographic Heatmap</span>
              </TabsTrigger>
              <TabsTrigger value="demand" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Product Demand</span>
              </TabsTrigger>
              <TabsTrigger value="targeting" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Campaign Targeting</span>
              </TabsTrigger>
              <TabsTrigger value="ml" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">ML Predictions</span>
              </TabsTrigger>
            </TabsList>

            {/* Geographic Heatmap Tab */}
            <TabsContent value="heatmap" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Customer Geographic Heatmap</CardTitle>
                        <p className="text-sm text-muted-foreground">Interactive Bangladesh district visualization with customer density and order analytics</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Activity className="h-3 w-3 mr-1" />
                        Live Data
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Users className="h-3 w-3 mr-1" />
                        Customer Insights
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        amCharts5
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CustomerMapHeatmap />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Demand Analytics Tab */}
            <TabsContent value="demand" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">AI Product Demand Analytics</CardTitle>
                        <p className="text-sm text-muted-foreground">Advanced ML-powered demand forecasting, stock optimization, and scenario analysis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Powered
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Stock Insights
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        XGBoost + LSTM
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6">
                    <ProductDemandAnalytics />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Targeting Insights Tab */}
            <TabsContent value="targeting" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">AI Location Targeting Insights</CardTitle>
                        <p className="text-sm text-muted-foreground">Smart geographic targeting with ML-powered campaign optimization and ROI predictions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        <Target className="h-3 w-3 mr-1" />
                        Geo-Targeting
                      </Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        ROI Optimization
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Campaign AI
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6">
                    <LocationTargetingInsights />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ML Prediction Engine Tab */}
            <TabsContent value="ml" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">ML Prediction Engine</CardTitle>
                        <p className="text-sm text-muted-foreground">Advanced machine learning analytics with explainable AI and customer lifetime value predictions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        <Brain className="h-3 w-3 mr-1" />
                        Deep Learning
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <Activity className="h-3 w-3 mr-1" />
                        Model Monitoring
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Explainable AI
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="p-6">
                    <MLPredictionEngine />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}


