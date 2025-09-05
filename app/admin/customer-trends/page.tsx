'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import CustomerMap from '@/components/admin/CustomerMap';
import LocationTargetingInsights from '@/components/admin/LocationTargetingInsights';
import MLPredictionEngine from '@/components/admin/MLPredictionEngine';
import ProductDemandAnalytics from '@/components/admin/ProductDemandAnalytics';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Brain,
    Map,
    MapPin,
    Package,
    Sparkles,
    Target,
    TrendingUp,
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
                  Interactive Map Analytics
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Advanced geospatial visualization with ML-powered insights, product demand analysis, and strategic targeting recommendations
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
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Map className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">Interactive Mapping</p>
                      <p className="text-sm text-slate-500">4 visualization modes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-8">
          <Tabs defaultValue="map" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/60 backdrop-blur-md border border-white/20 p-1">
              <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">Interactive Map</span>
              </TabsTrigger>
              <TabsTrigger value="demand" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Product Demand</span>
              </TabsTrigger>
              <TabsTrigger value="targeting" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Location Targeting</span>
              </TabsTrigger>
              <TabsTrigger value="ml" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">ML Insights</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:shadow-md transition-all">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>

            {/* Interactive Map Tab */}
            <TabsContent value="map" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Bangladesh Customer Map</CardTitle>
                        <p className="text-sm text-muted-foreground">Interactive visualization with advanced filtering</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Live Data
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        MapLibre GL
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CustomerMap />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Product Demand Tab */}
            <TabsContent value="demand" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Product Demand Analytics</CardTitle>
                      <p className="text-sm text-muted-foreground">AI-powered stock recommendations and demand forecasting</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ProductDemandAnalytics />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Location Targeting Tab */}
            <TabsContent value="targeting" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Campaign Targeting Insights</CardTitle>
                      <p className="text-sm text-muted-foreground">Strategic recommendations for marketing campaigns</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <LocationTargetingInsights />
                </CardContent>
              </Card>
            </TabsContent>

            {/* ML Insights Tab */}
            <TabsContent value="ml" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Brain className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">ML Prediction Engine</CardTitle>
                      <p className="text-sm text-muted-foreground">Advanced machine learning analytics and forecasting</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <MLPredictionEngine />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-md border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Advanced Analytics Dashboard</CardTitle>
                      <p className="text-sm text-muted-foreground">Comprehensive business intelligence and insights</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Advanced analytics dashboard coming soon...</p>
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


