'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  ArrowUp,
  BarChart3,
  Box,
  Brain,
  Calculator,
  ChevronRight,
  Clock,
  Download,
  Lightbulb,
  Package,
  RefreshCw,
  Share2,
  ShoppingBasket,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
  confidence: number; // ML model confidence (0-1)
  seasonalityFactor: number; // Seasonal adjustment factor
  priceElasticity: number; // Price sensitivity
  competitorImpact: number; // Competitor influence score
  marketSaturation: number; // Market saturation level (0-1)
  forecastAccuracy: number; // Historical prediction accuracy
  lastUpdated: string;
  mlFeatures: {
    trendStrength: number;
    volatility: number;
    cyclicalPattern: boolean;
    externalFactors: string[];
  };
  locations: Array<{
    division: string;
    orderCount: number;
    revenue: number;
    growthPotential: number;
    confidence: number;
  }>;
  timeSeries: Array<{
    date: string;
    actual: number;
    predicted: number;
    confidence: number;
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
  confidence: number;
  leadTime: number; // Days to restock
  safetyStock: number;
  reorderPoint: number;
  costOfStockout: number;
  probabilityOfStockout: number;
  seasonalAdjustment: number;
  mlRecommendation: {
    algorithm: string;
    factors: string[];
    confidence: number;
    reasoning: string;
  };
}

interface ScenarioSimulation {
  name: string;
  parameters: {
    marketingSpendIncrease?: number;
    priceChange?: number;
    seasonalAdjustment?: number;
    competitorAction?: string;
  };
  results: {
    expectedDemandChange: number;
    revenueImpact: number;
    profitImpact: number;
    confidence: number;
  };
}

interface AIInsight {
  type: 'recommendation' | 'warning' | 'opportunity' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionRequired: boolean;
  timeframe: string;
  estimatedValue: number;
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
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioSimulation[]>([]);
  const [isMLTraining, setIsMLTraining] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.8);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [simulationParams, setSimulationParams] = useState({
    marketingSpend: 0,
    priceChange: 0,
    seasonalAdjustment: 0
  });

  const generateRealisticMLData = useCallback(() => {
    const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Books', 'Sports', 'Beauty', 'Food & Beverages'];
    const products = [
      'Wireless Bluetooth Headphones', 'Smart Watch Pro', 'Organic Cotton T-Shirt', 'Ceramic Plant Pot',
      'Best Seller Novel', 'Yoga Mat Premium', 'Anti-Aging Serum', 'Artisan Coffee Beans',
      'Laptop Stand', 'Designer Jeans', 'LED Desk Lamp', 'Protein Powder', 'Skincare Set',
      'Kitchen Knife Set', 'Running Shoes', 'Bluetooth Speaker', 'Winter Jacket', 'Smart Phone Case'
    ];

    const divisions = ['Dhaka Division', 'Chittagong Division', 'Sylhet Division', 'Rajshahi Division', 'Khulna Division'];
    
    // Generate realistic time series data with seasonal patterns
    const generateTimeSeries = (baseValue: number, volatility: number, trend: number) => {
      const series = [];
      const days = parseInt(timeRange);
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i));
        
        // Add seasonal pattern (higher on weekends)
        const seasonalFactor = date.getDay() === 0 || date.getDay() === 6 ? 1.2 : 1.0;
        
        // Add trend and noise
        const actual = Math.max(0, Math.round(
          baseValue * (1 + trend * i / days) * seasonalFactor * (1 + (Math.random() - 0.5) * volatility)
        ));
        
        // ML prediction with slight error
        const predicted = Math.round(actual * (0.95 + Math.random() * 0.1));
        const confidence = 0.85 + Math.random() * 0.15; // 85-100% confidence
        
        series.push({
          date: date.toISOString().split('T')[0],
          actual,
          predicted,
          confidence
        });
      }
      return series;
    };

    return products.slice(0, 12).map((productName, index) => {
      const category = categories[index % categories.length];
      const baseOrders = 50 + Math.random() * 200;
      const volatility = 0.1 + Math.random() * 0.3;
      const trendFactor = -0.2 + Math.random() * 0.6; // -20% to +40% trend
      const confidence = 0.75 + Math.random() * 0.25; // 75-100% confidence
      
      const currentStock = Math.floor(20 + Math.random() * 200);
      const avgPrice = 500 + Math.random() * 4500;
      const totalOrders = Math.floor(baseOrders * parseInt(timeRange));
      const revenue = totalOrders * avgPrice;
      
      // Advanced ML features
      const seasonalityFactor = 0.1 + Math.random() * 0.4;
      const priceElasticity = -0.5 - Math.random() * 1.5; // Negative elasticity
      const competitorImpact = Math.random() * 0.8;
      const marketSaturation = Math.random() * 0.9;
      const forecastAccuracy = 0.8 + Math.random() * 0.2;
      
      const timeSeries = generateTimeSeries(baseOrders, volatility, trendFactor);
      const demandScore = Math.round((confidence * 50) + (Math.abs(trendFactor) * 30) + (Math.random() * 20));
      
      return {
        _id: `product-${index}`,
        name: productName,
        category,
        totalOrders,
        totalQuantity: totalOrders * (1 + Math.random()),
        revenue,
        avgPrice,
        growthRate: trendFactor,
        demandScore,
        stockLevel: currentStock,
        recommendedStock: Math.round(currentStock * (1 + Math.abs(trendFactor) + seasonalityFactor)),
        urgency: demandScore > 80 ? 'critical' : demandScore > 60 ? 'high' : demandScore > 40 ? 'medium' : 'low',
        confidence,
        seasonalityFactor,
        priceElasticity,
        competitorImpact,
        marketSaturation,
        forecastAccuracy,
        lastUpdated: new Date().toISOString(),
        mlFeatures: {
          trendStrength: Math.abs(trendFactor),
          volatility,
          cyclicalPattern: seasonalityFactor > 0.25,
          externalFactors: ['Seasonality', 'Competition', 'Market Trends'].filter(() => Math.random() > 0.5)
        },
        locations: divisions.map(division => ({
          division,
          orderCount: Math.floor(totalOrders * (0.1 + Math.random() * 0.3)),
          revenue: revenue * (0.1 + Math.random() * 0.3),
          growthPotential: Math.random(),
          confidence: 0.7 + Math.random() * 0.3
        })),
        timeSeries
      } as ProductDemand;
    });
  }, [timeRange]);

  const generateAIInsights = useCallback((products: ProductDemand[]) => {
    const insights: AIInsight[] = [];
    
    // High confidence opportunities
    const highConfidenceProducts = products.filter(p => p.confidence > 0.9 && p.growthRate > 0.2);
    if (highConfidenceProducts.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'High-Confidence Growth Opportunities',
        description: `${highConfidenceProducts.length} products show strong growth potential with 90%+ confidence. Consider increasing inventory for ${highConfidenceProducts[0].name}.`,
        impact: 'high',
        confidence: 0.92,
        actionRequired: true,
        timeframe: 'Next 2 weeks',
        estimatedValue: highConfidenceProducts.reduce((sum, p) => sum + p.revenue * 0.3, 0)
      });
    }
    
    // Stockout warnings
    const stockoutRisk = products.filter(p => p.stockLevel < p.recommendedStock * 0.3);
    if (stockoutRisk.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Critical Stock Levels Detected',
        description: `${stockoutRisk.length} products at risk of stockout. Immediate restocking required for ${stockoutRisk[0].name}.`,
        impact: 'high',
        confidence: 0.96,
        actionRequired: true,
        timeframe: 'Immediate',
        estimatedValue: -stockoutRisk.reduce((sum, p) => sum + p.revenue * 0.15, 0)
      });
    }
    
    // Seasonal trends
    const seasonalProducts = products.filter(p => p.seasonalityFactor > 0.3);
    if (seasonalProducts.length > 0) {
      insights.push({
        type: 'trend',
        title: 'Seasonal Demand Pattern Identified',
        description: `${seasonalProducts.length} products show strong seasonal patterns. Adjust inventory 2-3 weeks before peak season.`,
        impact: 'medium',
        confidence: 0.87,
        actionRequired: false,
        timeframe: 'Next month',
        estimatedValue: seasonalProducts.reduce((sum, p) => sum + p.revenue * 0.1, 0)
      });
    }
    
    // Price optimization
    const priceOptimizable = products.filter(p => Math.abs(p.priceElasticity) < 1);
    if (priceOptimizable.length > 0) {
      insights.push({
        type: 'recommendation',
        title: 'Price Optimization Opportunity',
        description: `${priceOptimizable.length} products have low price sensitivity. Consider 5-10% price increase to boost revenue.`,
        impact: 'medium',
        confidence: 0.81,
        actionRequired: false,
        timeframe: 'Next quarter',
        estimatedValue: priceOptimizable.reduce((sum, p) => sum + p.revenue * 0.07, 0)
      });
    }
    
    return insights;
  }, []);

  const fetchProductDemandData = async () => {
    setLoading(true);
    try {
      // Simulate ML training
      setIsMLTraining(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate realistic ML-powered data
      const mockProducts = generateRealisticMLData();
      const filteredProducts = selectedCategory 
        ? mockProducts.filter(p => p.category === selectedCategory)
        : mockProducts;
      
      setProductDemands(filteredProducts);
      
      // Generate enhanced stock recommendations
      const recommendations: StockRecommendation[] = filteredProducts.map(product => {
        const leadTime = 7 + Math.floor(Math.random() * 14); // 7-21 days
        const safetyStock = Math.round(product.recommendedStock * 0.15);
        const reorderPoint = Math.round((product.totalOrders / 30) * leadTime + safetyStock);
        
        return {
          productId: product._id,
          productName: product.name,
          currentStock: product.stockLevel,
          recommendedStock: product.recommendedStock,
          priority: product.urgency,
          expectedRevenue: (product.recommendedStock - product.stockLevel) * product.avgPrice * 0.7,
          riskLevel: product.stockLevel < 50 ? 0.8 : product.stockLevel < 100 ? 0.5 : 0.2,
          category: product.category,
          demandTrend: product.growthRate > 0.1 ? 'increasing' : product.growthRate > -0.1 ? 'stable' : 'decreasing',
          confidence: product.confidence,
          leadTime,
          safetyStock,
          reorderPoint,
          costOfStockout: product.avgPrice * 5, // Lost sales cost
          probabilityOfStockout: product.stockLevel < reorderPoint ? 0.7 : 0.1,
          seasonalAdjustment: product.seasonalityFactor,
          mlRecommendation: {
            algorithm: 'XGBoost + LSTM',
            factors: ['Historical sales', 'Seasonality', 'Market trends', 'Competition'],
            confidence: product.confidence,
            reasoning: `Based on ${Math.round(product.forecastAccuracy * 100)}% historical accuracy, recommend increasing stock by ${Math.round(((product.recommendedStock - product.stockLevel) / product.stockLevel) * 100)}%`
          }
        };
      });
      
      setStockRecommendations(recommendations);
      
      // Generate AI insights
      const insights = generateAIInsights(filteredProducts);
      setAiInsights(insights);
      
      // Generate category analysis
      const categoryData = [...new Set(filteredProducts.map(p => p.category))].map(category => {
        const categoryProducts = filteredProducts.filter(p => p.category === category);
        return {
          category,
          totalOrders: categoryProducts.reduce((sum, p) => sum + p.totalOrders, 0),
          totalRevenue: categoryProducts.reduce((sum, p) => sum + p.revenue, 0),
          avgDemandScore: categoryProducts.reduce((sum, p) => sum + p.demandScore, 0) / categoryProducts.length,
          avgConfidence: categoryProducts.reduce((sum, p) => sum + p.confidence, 0) / categoryProducts.length,
          growthRate: categoryProducts.reduce((sum, p) => sum + p.growthRate, 0) / categoryProducts.length
        };
      });
      setCategoryAnalysis(categoryData);
      
      // Generate demand trends
      const trendData = [];
      for (let i = 0; i < parseInt(timeRange); i++) {
        const date = new Date();
        date.setDate(date.getDate() - (parseInt(timeRange) - i));
        
        trendData.push({
          date: date.toISOString().split('T')[0],
          totalOrders: filteredProducts.reduce((sum, p) => {
            const dayData = p.timeSeries.find(ts => ts.date === date.toISOString().split('T')[0]);
            return sum + (dayData?.actual || 0);
          }, 0),
          revenue: filteredProducts.reduce((sum, p) => {
            const dayData = p.timeSeries.find(ts => ts.date === date.toISOString().split('T')[0]);
            return sum + ((dayData?.actual || 0) * p.avgPrice);
          }, 0),
          confidence: filteredProducts.reduce((sum, p) => sum + p.confidence, 0) / filteredProducts.length
        });
      }
      setDemandTrends(trendData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(mockProducts.map(p => p.category))];
      setCategories(uniqueCategories);
      
    } catch (error) {
      console.error('Failed to fetch product demand data:', error);
      // Reset to empty state on error
      setProductDemands([]);
      setStockRecommendations([]);
      setCategoryAnalysis([]);
      setDemandTrends([]);
      setAiInsights([]);
    } finally {
      setLoading(false);
      setIsMLTraining(false);
    }
  };

  useEffect(() => {
    fetchProductDemandData();
  }, [timeRange, selectedCategory]);

  // Scenario simulation
  const runScenarioSimulation = useCallback((params: typeof simulationParams) => {
    const scenarios: ScenarioSimulation[] = [];
    
    // Marketing spend increase scenario
    if (params.marketingSpend > 0) {
      const demandIncrease = params.marketingSpend * 0.002; // 2% increase per 1% marketing spend
      scenarios.push({
        name: `${params.marketingSpend}% Marketing Increase`,
        parameters: { marketingSpendIncrease: params.marketingSpend },
        results: {
          expectedDemandChange: demandIncrease,
          revenueImpact: productDemands.reduce((sum, p) => sum + p.revenue, 0) * demandIncrease,
          profitImpact: productDemands.reduce((sum, p) => sum + p.revenue, 0) * demandIncrease * 0.3,
          confidence: 0.85
        }
      });
    }
    
    // Price change scenario
    if (params.priceChange !== 0) {
      const avgElasticity = productDemands.reduce((sum, p) => sum + p.priceElasticity, 0) / productDemands.length;
      const demandChange = params.priceChange * avgElasticity / 100;
      const revenueChange = (params.priceChange / 100) + demandChange;
      
      scenarios.push({
        name: `${params.priceChange > 0 ? '+' : ''}${params.priceChange}% Price Change`,
        parameters: { priceChange: params.priceChange },
        results: {
          expectedDemandChange: demandChange,
          revenueImpact: productDemands.reduce((sum, p) => sum + p.revenue, 0) * revenueChange,
          profitImpact: productDemands.reduce((sum, p) => sum + p.revenue, 0) * revenueChange * 0.35,
          confidence: 0.78
        }
      });
    }
    
    setScenarios(scenarios);
  }, [productDemands, simulationParams]);

  // Export functionality
  const exportReport = useCallback((format: 'csv' | 'pdf') => {
    const data = productDemands.map(p => ({
      Product: p.name,
      Category: p.category,
      'Current Stock': p.stockLevel,
      'Recommended Stock': p.recommendedStock,
      'Growth Rate': `${(p.growthRate * 100).toFixed(1)}%`,
      'Confidence': `${(p.confidence * 100).toFixed(1)}%`,
      'Revenue': p.revenue,
      'Demand Score': p.demandScore
    }));
    
    if (format === 'csv') {
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-demand-analysis-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  }, [productDemands]);

  // Memoized calculations
  const analytics = useMemo(() => {
    if (!productDemands.length) return null;
    
    const highConfidenceProducts = productDemands.filter(p => p.confidence >= confidenceThreshold);
    const totalRevenue = productDemands.reduce((sum, p) => sum + p.revenue, 0);
    const averageConfidence = productDemands.reduce((sum, p) => sum + p.confidence, 0) / productDemands.length;
    const totalOrders = productDemands.reduce((sum, p) => sum + p.totalOrders, 0);
    const criticalStock = productDemands.filter(p => p.urgency === 'critical' || p.urgency === 'high').length;
    
    return {
      highConfidenceProducts,
      totalRevenue,
      averageConfidence,
      totalOrders,
      criticalStock,
      mlModelAccuracy: productDemands.reduce((sum, p) => sum + p.forecastAccuracy, 0) / productDemands.length
    };
  }, [productDemands, confidenceThreshold]);

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
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              AI Product Demand Analytics
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Sparkles className="h-3 w-3 mr-1" />
                {analytics?.mlModelAccuracy ? `${(analytics.mlModelAccuracy * 100).toFixed(1)}% Accuracy` : 'ML Powered'}
              </Badge>
            </h1>
            <p className="text-gray-600 mt-2">
              Advanced machine learning insights for demand forecasting and inventory optimization
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportReport('csv')}
              className="bg-white/80 hover:bg-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/80 hover:bg-white"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Report
            </Button>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Time Range</Label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="p-2 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Category Filter</Label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border rounded-md bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">ML Confidence Threshold</Label>
              <div className="flex items-center gap-2 w-32">
                <Slider
                  value={[confidenceThreshold * 100]}
                  onValueChange={(value) => setConfidenceThreshold(value[0] / 100)}
                  max={100}
                  min={50}
                  step={5}
                  className="flex-1"
                />
                <span className="text-xs text-gray-500 min-w-fit">
                  {(confidenceThreshold * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="advanced-metrics"
                checked={showAdvancedMetrics}
                onCheckedChange={setShowAdvancedMetrics}
              />
              <Label htmlFor="advanced-metrics" className="text-sm font-medium text-gray-700">
                Advanced Metrics
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={fetchProductDemandData} 
              disabled={loading || isMLTraining}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMLTraining ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Training Models...
                </>
              ) : loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      {aiInsights.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-amber-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">AI Insights & Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiInsights.slice(0, 2).map((insight, index) => (
                    <div key={index} className="p-3 bg-white/60 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {insight.type}
                        </Badge>
                        <span className="text-xs text-gray-600">{(insight.confidence * 100).toFixed(0)}% confidence</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      {insight.actionRequired && (
                        <Badge variant="outline" className="mt-2 text-xs bg-red-50 text-red-700 border-red-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Action Required: {insight.timeframe}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700 mb-1">Total Products Analyzed</p>
                <p className="text-3xl font-bold text-blue-900">{productDemands.length}</p>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    {analytics?.highConfidenceProducts.length || 0} high confidence
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                    {analytics?.totalOrders || 0} orders
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <ShoppingBasket className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700 mb-1">ML Model Confidence</p>
                <p className="text-3xl font-bold text-purple-900">
                  {((analytics?.averageConfidence || 0) * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-2">
                  <Progress 
                    value={(analytics?.averageConfidence || 0) * 100} 
                    className="w-20 h-2 bg-purple-200"
                  />
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs ml-2">
                    {((analytics?.mlModelAccuracy || 0) * 100).toFixed(0)}% accuracy
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Brain className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700 mb-1">Critical Stock Items</p>
                <p className="text-3xl font-bold text-orange-900">
                  {analytics?.criticalStock || 0}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant="destructive" className="text-xs">
                    Immediate attention needed
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-orange-500 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-white" />
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="demand" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              High Demand Products
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              AI Stock Recommendations
            </TabsTrigger>
            <TabsTrigger value="scenarios" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Scenario Simulation
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Category Analysis
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Demand Trends
            </TabsTrigger>
          </TabsList>

        {/* High Demand Products Tab */}
        <TabsContent value="demand" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ML Confidence vs Demand Score */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  ML Confidence vs Demand Score
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    AI Powered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart
                    data={productDemands.map(p => ({
                      name: p.name,
                      confidence: p.confidence * 100,
                      demandScore: p.demandScore,
                      revenue: p.revenue
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="demandScore" 
                      name="Demand Score"
                      label={{ value: 'Demand Score', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      dataKey="confidence" 
                      name="ML Confidence %"
                      label={{ value: 'ML Confidence %', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value, name) => {
                        const label = typeof name === 'string' ? name : String(name);
                        const formatted = label === 'revenue' 
                          ? formatCurrency(value as number) 
                          : `${value}${label.includes('confidence') ? '%' : ''}`;
                        return [formatted, label];
                      }}
                      labelFormatter={(value) => `Product: ${value}`}
                    />
                    <Scatter dataKey="confidence" fill="#8b5cf6" />
                    <ReferenceLine x={70} stroke="#ef4444" strokeDasharray="2 2" />
                    <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="2 2" />
                  </ScatterChart>
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

        {/* Scenario Simulation Tab */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Simulation Controls */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  What-If Scenario Builder
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Interactive
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Marketing Spend Increase (%)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[simulationParams.marketingSpend]}
                        onValueChange={(value) => setSimulationParams(prev => ({ ...prev, marketingSpend: value[0] }))}
                        max={50}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="min-w-fit text-sm font-medium">
                        {simulationParams.marketingSpend}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Expected demand increase: {(simulationParams.marketingSpend * 0.2).toFixed(1)}%
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Price Change (%)</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[simulationParams.priceChange]}
                        onValueChange={(value) => setSimulationParams(prev => ({ ...prev, priceChange: value[0] }))}
                        max={25}
                        min={-25}
                        step={1}
                        className="flex-1"
                      />
                      <span className="min-w-fit text-sm font-medium">
                        {simulationParams.priceChange > 0 ? '+' : ''}{simulationParams.priceChange}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Avg price elasticity: -1.2 (10% price increase = 12% demand decrease)
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Seasonal Adjustment</Label>
                    <div className="flex items-center gap-3">
                      <Slider
                        value={[simulationParams.seasonalAdjustment]}
                        onValueChange={(value) => setSimulationParams(prev => ({ ...prev, seasonalAdjustment: value[0] }))}
                        max={40}
                        min={-20}
                        step={5}
                        className="flex-1"
                      />
                      <span className="min-w-fit text-sm font-medium">
                        {simulationParams.seasonalAdjustment > 0 ? '+' : ''}{simulationParams.seasonalAdjustment}%
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => runScenarioSimulation(simulationParams)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Run Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Simulation Results */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-green-600" />
                  Simulation Results
                  {scenarios.length > 0 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {scenarios.length} scenario{scenarios.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scenarios.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Run a simulation to see projected results</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scenarios.map((scenario, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
                        <h4 className="font-medium text-gray-900 mb-3">{scenario.name}</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Demand Change:</span>
                              <span className={`font-medium ${scenario.results.expectedDemandChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {scenario.results.expectedDemandChange >= 0 ? '+' : ''}{(scenario.results.expectedDemandChange * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Revenue Impact:</span>
                              <span className={`font-medium ${scenario.results.revenueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(scenario.results.revenueImpact)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Profit Impact:</span>
                              <span className={`font-medium ${scenario.results.profitImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(scenario.results.profitImpact)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Confidence:</span>
                              <span className="font-medium text-blue-600">
                                {(scenario.results.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Recommended Action:</span>
                            <Badge variant={scenario.results.profitImpact > 0 ? 'default' : 'destructive'}>
                              {scenario.results.profitImpact > 0 ? 'Implement' : 'Avoid'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scenario Comparison Chart */}
          {scenarios.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Scenario Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarios.map(s => ({
                    name: s.name,
                    revenueImpact: s.results.revenueImpact,
                    profitImpact: s.results.profitImpact,
                    confidence: s.results.confidence * 100
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => {
                      const label = typeof name === 'string' ? name : String(name);
                      const formatted = label.includes('Impact')
                        ? formatCurrency(value as number)
                        : `${value}%`;
                      return [formatted, label];
                    }} />
                    <Legend />
                    <Bar dataKey="revenueImpact" fill="#3b82f6" name="Revenue Impact" />
                    <Bar dataKey="profitImpact" fill="#10b981" name="Profit Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
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
