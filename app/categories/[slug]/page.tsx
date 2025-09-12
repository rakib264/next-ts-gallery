'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronDown,
  Grid,
  Heart,
  List,
  Package,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  productCount?: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  averageRating?: number;
  totalReviews?: number;
  shortDescription?: string;
  description?: string;
  inStock: boolean;
  colors?: string[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' }
];

export default function CategoryPage() {
  const params = useParams();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minRating, setMinRating] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [isDesktop, setIsDesktop] = useState(false);

  const availableColors = ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Pink', 'Purple'];

  useEffect(() => {
    if (params.slug) {
      fetchCategoryAndProducts();
    }
  }, [params.slug, pagination.page, searchQuery, sortBy, priceRange, minRating, selectedColors]);

  // Safe window size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchCategoryAndProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch category details
      const categoryResponse = await fetch('/api/categories');
      const categoryData = await categoryResponse.json();
      const categoriesArray = categoryData.categories || [];
      const currentCategory = categoriesArray.find((cat: Category) => cat.slug === params.slug);
      
      if (currentCategory) {
        setCategory(currentCategory);
      }

      // Fetch products
      const productParams = new URLSearchParams();
      productParams.set('category', params.slug as string);
      productParams.set('page', String(pagination.page));
      productParams.set('limit', String(pagination.limit));
      
      if (searchQuery) productParams.set('search', searchQuery);
      if (priceRange[0] > 0) productParams.set('minPrice', String(priceRange[0]));
      if (priceRange[1] < 50000) productParams.set('maxPrice', String(priceRange[1]));
      if (minRating > 0) productParams.set('minRating', String(minRating));
      if (selectedColors.length > 0) productParams.set('color', selectedColors.join(','));
      
      const sortMapping = getSortMapping(sortBy);
      productParams.set('sortBy', sortMapping.sortBy);
      productParams.set('sortOrder', sortMapping.sortOrder);

      const productsResponse = await fetch(`/api/products?${productParams.toString()}`);
      const productsData = await productsResponse.json();
      
      setProducts(productsData.products || []);
      setPagination(prev => ({
        ...prev,
        total: productsData.total || 0,
        pages: Math.ceil((productsData.total || 0) / prev.limit)
      }));
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortMapping = (sortValue: string) => {
    switch (sortValue) {
      case 'price-low':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price-high':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'rating':
        return { sortBy: 'averageRating', sortOrder: 'desc' };
      case 'name':
        return { sortBy: 'name', sortOrder: 'asc' };
      case 'newest':
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  const handleWishlistToggle = (product: Product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product._id);
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        inStock: product.inStock
      }));
    }
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.thumbnailImage,
      quantity: 1,
      maxQuantity: 99
    }));
  };

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`;

  const clearFilters = () => {
    setSearchQuery('');
    setSortBy('newest');
    setPriceRange([0, 50000]);
    setMinRating(0);
    setSelectedColors([]);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (!category && !loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16 md:pt-20 mb-20 md:mb-0">
          <div className="container mx-auto px-4 py-12 text-center">
            <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
            <h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The category you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/categories">
              <Button>Browse All Categories</Button>
            </Link>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="pt-16 md:pt-20 mb-20 md:mb-0">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-primary transition-colors">
              Categories
            </Link>
            {category?.parent && (
              <>
                <span>/</span>
                <Link 
                  href={`/categories/${category.parent.slug}`} 
                  className="hover:text-primary transition-colors"
                >
                  {category.parent.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-foreground font-medium">{category?.name}</span>
          </div>

          {/* Category Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-900 font-bold">{category?.name}</h1>
                {category?.description && (
                  <p className="text-muted-foreground mt-2">{category.description}</p>
                )}
              </div>
              <Link href="/categories">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <ArrowLeft className="mr-2" size={16} />
                  Back to Categories
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Filters and Search - Enhanced Design */}
          <div className="mb-8">
            {/* Main Filter Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
                    <Search size={18} />
                  </div>
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 bg-white border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300"
                  />
                </div>

                {/* Sort */}
                <div className="lg:w-52">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-xl py-3 text-gray-900 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-300">
                      <SelectValue placeholder="Sort Collection" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
                      {sortOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="hover:bg-primary-50 focus:bg-primary-50 rounded-lg text-gray-900"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="hidden lg:flex bg-white border border-gray-300 rounded-xl p-1 shadow-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 border ${
                      viewMode === 'grid' 
                        ? 'bg-primary-600 text-white shadow-sm border-primary-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 border ${
                      viewMode === 'list' 
                        ? 'bg-primary-600 text-white shadow-sm border-primary-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <List size={16} />
                  </Button>
                </div>

                {/* Filters Toggle - Now visible on all devices */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-900 transition-all duration-300"
                >
                  <SlidersHorizontal className="mr-2" size={16} />
                  Filters
                  <ChevronDown className={`ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} size={16} />
                </Button>
              </div>
            </div>

            {/* Advanced Filters - Enhanced Design */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -20 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Filter Your Selection</h3>
                    <p className="text-sm text-gray-600">Discover products that match your style</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900 block">Price Range</label>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <Slider
                          value={priceRange}
                          onValueChange={setPriceRange}
                          max={50000}
                          min={0}
                          step={100}
                          className="mb-3"
                        />
                        <div className="flex justify-between text-xs font-medium text-gray-600">
                          <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">{formatPrice(priceRange[0])}</span>
                          <span className="bg-white px-2 py-1 rounded-lg border border-gray-200">{formatPrice(priceRange[1])}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900 block">Quality Rating</label>
                      <div className="bg-gray-50 rounded-xl border border-gray-200">
                        <Select value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                          <SelectTrigger className="bg-transparent border-0 py-3 text-gray-900 focus:bg-white">
                            <SelectValue placeholder="Any rating" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200 rounded-xl shadow-lg">
                            <SelectItem value="0" className="hover:bg-primary-50 rounded-lg text-gray-900">Any rating</SelectItem>
                            <SelectItem value="1" className="hover:bg-primary-50 rounded-lg text-gray-900">⭐ 1+ Stars</SelectItem>
                            <SelectItem value="2" className="hover:bg-primary-50 rounded-lg text-gray-900">⭐ 2+ Stars</SelectItem>
                            <SelectItem value="3" className="hover:bg-primary-50 rounded-lg text-gray-900">⭐ 3+ Stars</SelectItem>
                            <SelectItem value="4" className="hover:bg-primary-50 rounded-lg text-gray-900">⭐ 4+ Stars</SelectItem>
                            <SelectItem value="5" className="hover:bg-primary-50 rounded-lg text-gray-900">⭐ 5 Stars Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Color Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900 block">Available Colors</label>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="grid grid-cols-2 gap-3">
                          {availableColors.map((color) => (
                            <div key={color} className="flex items-center space-x-2">
                              <Checkbox
                                id={color}
                                checked={selectedColors.includes(color)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedColors([...selectedColors, color]);
                                  } else {
                                    setSelectedColors(selectedColors.filter(c => c !== color));
                                  }
                                }}
                                className="rounded-md border-2 data-[state=checked]:bg-primary-600 data-[state=checked]:border-primary-600"
                              />
                              <label 
                                htmlFor={color} 
                                className="text-xs font-medium text-gray-900 cursor-pointer"
                              >
                                {color}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-gray-900 block">Quick Actions</label>
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          onClick={clearFilters} 
                          className="w-full bg-red-600 text-white border border-red-600 rounded-xl hover:bg-red-700 hover:border-red-700 transition-all duration-300 shadow-sm"
                        >
                           Reset Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Products Section - Enhanced */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Collection</h2>
                <div className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    {products.length} of {pagination.total} pieces
                  </p>
                </div>
              </div>
              
              {(searchQuery || minRating > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Applied filters:</span>
                  {searchQuery && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setSearchQuery('')}>
                      "{searchQuery}"
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                  {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setPriceRange([0, 50000])}>
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                  {minRating > 0 && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setMinRating(0)}>
                      ⭐ {minRating}+ Stars
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                  {selectedColors.map((color) => (
                    <Badge 
                      key={color} 
                      className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer"
                      onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}
                    >
                      {color}
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <motion.div
            layout
            className={`grid ${
              viewMode === 'grid' 
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6' 
                : 'grid-cols-1 gap-6'
            }`}
          >
            <AnimatePresence>
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse border rounded-lg h-80 bg-muted/30" />
                ))
              ) : products.length > 0 ? (
                products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl">
                      {/* Product Card Content */}
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <Link href={`/products/${product.slug}`}>
                          <img
                            src={product.thumbnailImage}
                            alt={product.name}
                            className="w-full h-40 md:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </Link>
                        
                        {product.comparePrice && (
                          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-2 py-1 rounded-full shadow-lg text-xs">
                            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                          </Badge>
                        )}

                        {/* Mobile Add to Cart Button - Always Visible */}
                        <div className="absolute bottom-3 right-3 z-20">
                          <Button 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            className="text-xs px-3 py-2 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                          >
                            <ShoppingCart size={14} className="mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                      
                      <CardContent className="p-3">
                        <div className="flex items-center mb-1.5">
                          <div className="flex items-center space-x-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={`transition-all duration-300 ${
                                  i < Math.floor(product.averageRating || 0)
                                    ? 'text-yellow-400 fill-current drop-shadow-sm'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 ml-1 font-medium">
                            ({product.totalReviews || 0})
                          </span>
                        </div>
                        
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="font-bold text-sm mb-2 text-slate-800 group-hover:text-primary-600 transition-colors duration-300 line-clamp-2 leading-tight">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                              {formatPrice(product.price)}
                            </span>
                            {product.comparePrice && (
                              <span className="text-xs text-slate-400 line-through font-medium">
                                {formatPrice(product.comparePrice)}
                              </span>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWishlistToggle(product);
                            }}
                            className="p-1.5 h-7 w-7 rounded-full hover:bg-primary-50 transition-all duration-300"
                          >
                            <Heart 
                              size={14} 
                              className={`transition-colors duration-300 ${wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : 'text-slate-500 hover:text-red-500'}`} 
                            />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Package className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    No products are available in this category with your current filters.
                  </p>
                  <Button onClick={clearFilters}>Clear All Filters</Button>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Pagination - Enhanced Design */}
          {pagination.pages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-4 mt-12"
            >
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1 || loading}
                    className="bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                      if (pageNum > pagination.pages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === pagination.page ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                          className={`w-8 h-8 rounded-lg transition-all duration-300 border ${
                            pageNum === pagination.page 
                              ? 'bg-primary-600 text-white shadow-sm border-primary-600' 
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent hover:border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages || loading}
                    className="bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 text-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next
                  </Button>
                </div>
                
                <div className="text-center mt-3">
                  <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
