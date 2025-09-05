'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Box,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
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
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface ProductDemand {
  _id: string;
  name: string;
  category: string;
  totalOrders: number;
  totalQuantity: number;
  revenue: number;
  avgPrice: number;
  growthRate: number;
  demandScore: number;
  stockLevel: number;
  recommendedStock: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  locations: Array<{
    division: string;
    orderCount: number;
    revenue: number;
  }>;
}

interface StockRecommendation {
  productId: string;
  productName: string;
  currentStock: number;
  recommendedStock: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedRevenue: number;
  riskLevel: number;
  category: string;
  demandTrend: 'increasing' | 'stable' | 'decreasing';
}

const ProductDemandAnalytics: React.FC = () => {
  const [productDemands, setProductDemands] = useState<ProductDemand[]>([]);
  const [stockRecommendations, setStockRecommendations] = useState<StockRecommendation[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<any[]>([]);
  const [demandTrends, setDemandTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('30');

  const fetchProductDemandData = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (timeRange) params.append('timeRange', timeRange);
      if (selectedCategory) params.append('category', selectedCategory);
      
      // Fetch product demand analytics from API
      const response = await fetch(`/api/admin/analytics/product-demand?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Process the API data
      const productDemands = data.products || [];
      setProductDemands(productDemands);

      // Generate stock recommendations from API data
      const recommendations: StockRecommendation[] = productDemands.map((product: ProductDemand) => ({
        productId: product._id,
        productName: product.name,
        currentStock: product.stockLevel,
        recommendedStock: product.recommendedStock,
        priority: product.urgency,
        expectedRevenue: (product.recommendedStock - product.stockLevel) * product.avgPrice * 0.7,
        riskLevel: product.stockLevel < 50 ? 0.8 : product.stockLevel < 100 ? 0.5 : 0.2,
        category: product.category,
        demandTrend: product.growthRate > 0.3 ? 'increasing' : product.growthRate > 0.1 ? 'stable' : 'decreasing'
      }));

      setStockRecommendations(recommendations);

      // Generate category analysis from API data
      setCategoryAnalysis(data.categoryAnalysis || []);

      // Set demand trends from API data
      setDemandTrends(data.demandTrends || []);

      // Extract unique categories for dropdown
      const uniqueCategories = [...new Set(productDemands.map((p: ProductDemand) => p.category))] as string[];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Failed to fetch product demand data:', error);
      
      // Fallback to empty data if API fails
      setProductDemands([]);
      setStockRecommendations([]);
      setCategoryAnalysis([]);
      setDemandTrends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDemandData();
  }, [timeRange, selectedCategory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const getTopProductsByDemand = () => {
    return productDemands
      .sort((a, b) => b.demandScore - a.demandScore)
      .slice(0, 5);
  };

  const getCriticalStockItems = () => {
    return stockRecommendations
      .filter(item => item.priority === 'critical' || item.priority === 'high')
      .sort((a, b) => b.expectedRevenue - a.expectedRevenue);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="p-2 border rounded-md bg-white"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-md bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <Button onClick={fetchProductDemandData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-blue-800">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{productDemands.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-green-800">Total Orders</p>
                <p className="text-2xl font-bold text-green-900">
                  {productDemands.reduce((sum, p) => sum + p.totalOrders, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-purple-800">Avg Growth Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {((productDemands.reduce((sum, p) => sum + p.growthRate, 0) / productDemands.length) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-orange-800">Critical Stock</p>
                <p className="text-2xl font-bold text-orange-900">
                  {getCriticalStockItems().length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading && (
        <Card className="p-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-200 border-t-blue-600"></div>
            <div>
              <p className="font-medium">Loading product analytics...</p>
              <p className="text-sm text-muted-foreground">Analyzing order data and generating insights</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && productDemands.length === 0 && (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Product Data Available</h3>
          <p className="text-muted-foreground mb-4">
            No orders found for the selected time range and category. Try adjusting your filters.
          </p>
          <Button onClick={fetchProductDemandData} variant="outline">
            Refresh Data
          </Button>
        </Card>
      )}

      {!loading && productDemands.length > 0 && (
        <Tabs defaultValue="demand" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demand">High Demand Products</TabsTrigger>
            <TabsTrigger value="stock">Stock Recommendations</TabsTrigger>
            <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            <TabsTrigger value="trends">Demand Trends</TabsTrigger>
          </TabsList>

        {/* High Demand Products Tab */}
        <TabsContent value="demand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Top Products by Demand Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopProductsByDemand()}>
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
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name
                      ]}
                    />
                    <Bar dataKey="demandScore" fill="#3b82f6" name="Demand Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={getTopProductsByDemand()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="name"
                    >
                      {getTopProductsByDemand().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Product Details List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Product Demand Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {productDemands.map((product) => (
                  <div key={product._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Box className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyColor(product.urgency)}>
                          {product.urgency}
                        </Badge>
                        <div className="text-right">
                          <p className="font-medium">Score: {product.demandScore}</p>
                          <p className="text-sm text-green-600">+{(product.growthRate * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Orders</div>
                        <div className="font-medium">{product.totalOrders}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Revenue</div>
                        <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current Stock</div>
                        <div className="font-medium">{product.stockLevel}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Recommended</div>
                        <div className="font-medium text-blue-600">{product.recommendedStock}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stock Recommendations Tab */}
        <TabsContent value="stock" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Powered Stock Recommendations
                <Badge variant="secondary">High Priority</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getCriticalStockItems().map((item, index) => (
                  <div key={item.productId} className="p-4 border rounded-lg bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
                          <span className="text-sm font-bold text-red-600">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="font-medium">{item.productName}</h3>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getUrgencyColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                        <div className="flex items-center gap-1">
                          {item.demandTrend === 'increasing' && <ArrowUp className="h-4 w-4 text-green-500" />}
                          <span className="text-sm text-green-600">{item.demandTrend}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Current Stock</div>
                        <div className="font-medium text-red-600">{item.currentStock}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Recommended</div>
                        <div className="font-medium text-blue-600">{item.recommendedStock}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Additional Needed</div>
                        <div className="font-medium">{item.recommendedStock - item.currentStock}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Expected Revenue</div>
                        <div className="font-medium text-green-600">{formatCurrency(item.expectedRevenue)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 p-2 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Recommendation:</strong> Increase stock by {item.recommendedStock - item.currentStock} units 
                        to capture potential revenue of {formatCurrency(item.expectedRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Category Analysis Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'totalRevenue' ? formatCurrency(value as number) : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="totalOrders" fill="#3b82f6" name="Total Orders" />
                  <Bar yAxisId="right" dataKey="avgDemandScore" fill="#10b981" name="Avg Demand Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demand Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Demand Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={demandTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : value,
                      name
                    ]}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalOrders"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Daily Orders"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Daily Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default ProductDemandAnalytics;
