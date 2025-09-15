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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useDebounce } from '@/hooks/use-debounce';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Crown, Flame, Grid, Heart, List, Search, ShoppingBasket, SlidersHorizontal, Star, Timer, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const sortOptions = [
  { value: 'stock', label: 'Lowest Stock First' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' }
];

export default function LimitedEditionPage() {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isManuallyClearing, setIsManuallyClearing] = useState(false);
  const [sortBy, setSortBy] = useState('stock');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [categorySlug, setCategorySlug] = useState<string>('');

  // Debounce the search query for optimal performance
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  // Sync debounced search with local state
  useEffect(() => {
    if (!isManuallyClearing && debouncedSearchQuery !== searchQuery) {
      setSearchQuery(debouncedSearchQuery);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearchQuery, searchQuery, isManuallyClearing]);

  // Initialize local search
  useEffect(() => {
    if (searchQuery !== localSearchQuery && localSearchQuery === '') {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery, localSearchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, pagination.page, priceRange, minRating, selectedColors, categorySlug]);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set('isLimitedEdition', 'true');
        params.set('page', String(pagination.page));
        params.set('limit', String(pagination.limit));
        // Always set search parameter, even if empty to ensure proper clearing
        params.set('search', searchQuery || '');
        if (categorySlug) params.set('category', categorySlug);
        if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
        if (priceRange[1] < 50000) params.set('maxPrice', String(priceRange[1]));
        if (minRating > 0) params.set('minRating', String(minRating));
        if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
        
        // Handle sorting
        switch (sortBy) {
          case 'stock':
            params.set('sortBy', 'quantity');
            params.set('sortOrder', 'asc');
            break;
          case 'price-asc':
            params.set('sortBy', 'price');
            params.set('sortOrder', 'asc');
            break;
          case 'price-desc':
            params.set('sortBy', 'price');
            params.set('sortOrder', 'desc');
            break;
          case 'rating':
            params.set('sortBy', 'averageRating');
            params.set('sortOrder', 'desc');
            break;
          case 'name':
            params.set('sortBy', 'name');
            params.set('sortOrder', 'asc');
            break;
          default:
            params.set('sortBy', 'quantity');
            params.set('sortOrder', 'asc');
        }

        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        
        if (res.ok) {
          setProducts(data.products || []);
          setPagination(prev => ({ 
            ...prev, 
            total: data.pagination?.total || 0, 
            pages: data.pagination?.totalPages || 0 
          }));
        }
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          console.error('Error fetching limited edition products:', e);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocalSearchQuery('');
    setCategorySlug('');
    setSelectedColors([]);
    setPriceRange([0, 50000]);
    setMinRating(0);
    setSortBy('stock');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const onSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const clearSearch = () => {
    setIsManuallyClearing(true);
    setLocalSearchQuery('');
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    setTimeout(() => {
      setIsManuallyClearing(false);
    }, 600);
  };

  const handleAddToCart = (product: any) => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.thumbnailImage,
      maxQuantity: product.quantity ?? 99
    }));
  };

  const handleWishlistToggle = (product: any) => {
    const isInWishlist = wishlistItems.some(item => item.id === product._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        comparePrice: product.comparePrice,
        inStock: (product.quantity ?? 0) > 0
      }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const hasActiveFilters = searchQuery || categorySlug || minRating > 0 || selectedColors.length > 0 || 
    priceRange[0] > 0 || priceRange[1] < 50000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0 relative z-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Crown className="text-yellow-400" size={32} />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Limited Edition
            </h1>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Flame className="text-orange-400" size={32} />
            </motion.div>
          </div>
          <p className="text-purple-100 text-center mb-6">
            Exclusive pieces in limited quantities. Don't miss out on these rare finds before they're gone forever
          </p>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-full shadow-lg">
              <Timer size={16} />
              <span className="text-sm font-medium">Limited Time Only</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Enhanced Search with Clear Icon */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search limited edition products..."
                value={localSearchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-10 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-300 transition-all duration-200 focus:border-white/40 focus:ring-1 focus:ring-white/40"
              />
              {localSearchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10 rounded-full transition-all duration-200"
                >
                  <X size={16} className="text-gray-300 hover:text-white" />
                </Button>
              )}
              {loading && localSearchQuery && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode - Desktop Only */}
            <div className="hidden lg:flex border border-white/20 rounded-lg p-1 bg-white/10 backdrop-blur-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-4 py-2 text-white transition-all duration-200 hover:bg-white/20"
              >
                <Grid size={16} className="mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 text-white transition-all duration-200 hover:bg-white/20"
              >
                <List size={16} className="mr-2" />
                List
              </Button>
            </div>

            {/* Filter Toggle - Desktop */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="hidden lg:flex h-12 px-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200 font-medium"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
              <ChevronDown 
                size={16} 
                className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} 
              />
            </Button>
          </div>

          {/* Mobile Action Bar */}
          <div className="flex lg:hidden gap-3">
            {/* Filter Button - 50% width */}
            <div className="flex-1">
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-200 font-medium"
                  >
                    <SlidersHorizontal size={18} className="mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-white">
                  <SheetHeader className="p-6 pb-0 text-left">
                    <SheetTitle className="text-left text-xl font-semibold text-gray-900">Filters</SheetTitle>
                  </SheetHeader>
                  <div className="p-6">
                    <MobileFilterContent 
                      categories={categories}
                      categorySlug={categorySlug}
                      setCategorySlug={setCategorySlug}
                      priceRange={priceRange}
                      setPriceRange={setPriceRange}
                      formatPrice={formatPrice}
                      selectedColors={selectedColors}
                      toggleColor={toggleColor}
                      minRating={minRating}
                      setMinRating={setMinRating}
                      clearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* View Mode Toggle - 50% width */}
            <div className="flex-1">
              <div className="flex h-12 border border-white/20 rounded-lg p-1 bg-white/10 backdrop-blur-sm">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 h-full transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <Grid size={16} className="mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`flex-1 h-full transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <List size={16} className="mr-1" />
                  List
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Desktop Layout */}
        <div className="hidden lg:flex gap-8">
          {/* Desktop Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 space-y-6"
              >
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-white/20">
                  <DesktopFilterContent 
                    categories={categories}
                    categorySlug={categorySlug}
                    setCategorySlug={setCategorySlug}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    formatPrice={formatPrice}
                    selectedColors={selectedColors}
                    toggleColor={toggleColor}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    clearFilters={clearFilters}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Products Grid/List */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-purple-100">
                Showing {products.length} of {pagination.total} limited edition products
              </p>
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-purple-200">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                      "{searchQuery}"
                      <X 
                        size={12} 
                        className="cursor-pointer" 
                        onClick={clearSearch}
                      />
                    </Badge>
                  )}
                  {categorySlug !== '' && (
                    <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                      {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                      <X 
                        size={12} 
                        className="cursor-pointer" 
                        onClick={() => setCategorySlug('')}
                      />
                    </Badge>
                  )}
                  {selectedColors.map((c) => (
                    <Badge key={c} variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                      {c}
                      <X 
                        size={12} 
                        className="cursor-pointer" 
                        onClick={() => toggleColor(c)}
                      />
                    </Badge>
                  ))}
                  {minRating > 0 && (
                    <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                      {minRating}+ stars
                      <X 
                        size={12} 
                        className="cursor-pointer" 
                        onClick={() => setMinRating(0)}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <motion.div
              layout
              className={`grid gap-6 md:gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
            >
              <AnimatePresence>
                {loading ? (
                  [...Array(6)].map((_, index) => (
                    <div key={index} className="animate-pulse bg-white/20 h-96 rounded-lg" />
                  ))
                ) : products.map((product: any, index: number) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
                      {viewMode === 'grid' ? (
                        // Grid View
                        <>
                          <div className="relative overflow-hidden">
                            <Link href={`/products/${product.slug}`}>
                              <img
                                src={product.thumbnailImage}
                                alt={product.name}
                                className="w-full h-40 md:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </Link>
                            
                            {product.comparePrice && (
                              <Badge className="absolute top-3 right-3 bg-red-500">
                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                              </Badge>
                            )}

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="p-2"
                                onClick={() => handleWishlistToggle(product)}
                              >
                                <Heart 
                                  size={16} 
                                  className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : ''} 
                                />
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleAddToCart(product)}
                              >
                                <ShoppingBasket size={16} className="mr-2" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>

                          <CardContent className="p-4 text-white">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={14}
                                    className={`${
                                      i < Math.floor(product.averageRating || 0)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-300 ml-2">
                                ({product.totalReviews || 0})
                              </span>
                            </div>
                            
                            <Link href={`/products/${product.slug}`}>
                              <h3 className="font-semibold text-sm md:text-base mb-2 group-hover:text-yellow-300 transition-colors line-clamp-2">
                                {product.name}
                              </h3>
                            </Link>
                            
                            <p className="text-xs md:text-sm text-gray-300 mb-3 line-clamp-2 hidden md:block">
                              {product.shortDescription || product.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-base md:text-lg font-bold text-yellow-300">
                                  {formatPrice(product.price)}
                                </span>
                                {product.comparePrice && (
                                  <span className="text-xs md:text-sm text-gray-400 line-through">
                                    {formatPrice(product.comparePrice)}
                                  </span>
                                )}
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddToCart(product)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity lg:flex hidden border-white/20 text-white hover:bg-white/10"
                              >
                                <ShoppingBasket size={14} />
                              </Button>
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        // List View
                        <div className="flex">
                          <div className="relative w-48 flex-shrink-0">
                            <Link href={`/products/${product.slug}`}>
                              <img
                                src={product.thumbnailImage}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                              />
                            </Link>
                            {product.comparePrice && (
                              <Badge className="absolute top-3 right-3 bg-red-500">
                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                              </Badge>
                            )}
                          </div>
                          
                          <CardContent className="flex-1 p-6 text-white">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        size={14}
                                        className={`${
                                          i < Math.floor(product.averageRating || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-300 ml-2">
                                    ({product.totalReviews || 0})
                                  </span>
                                  {product.category?.name && (
                                    <Badge variant="outline" className="ml-4 border-white/20 text-white">
                                      {product.category.name}
                                    </Badge>
                                  )}
                                </div>
                                
                                <Link href={`/products/${product.slug}`}>
                                  <h3 className="text-xl font-semibold mb-2 hover:text-yellow-300 transition-colors">
                                    {product.name}
                                  </h3>
                                </Link>
                                
                                <p className="text-gray-300 mb-4">
                                  {product.shortDescription || product.description}
                                </p>
                                
                                <div className="flex items-center space-x-2 mb-4">
                                  <span className="text-2xl font-bold text-yellow-300">
                                    {formatPrice(product.price)}
                                  </span>
                                  {product.comparePrice && (
                                    <span className="text-lg text-gray-400 line-through">
                                      {formatPrice(product.comparePrice)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2 ml-6">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="p-2 border-white/20 text-white hover:bg-white/10"
                                  onClick={() => handleWishlistToggle(product)}
                                >
                                  <Heart 
                                    size={16} 
                                    className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : ''} 
                                  />
                                </Button>
                                <Button 
                                  onClick={() => handleAddToCart(product)}
                                  className="px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  <ShoppingBasket size={16} className="mr-2" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {!loading && products.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Crown size={64} className="mx-auto text-purple-300 mb-4" />
                <h3 className="text-xl font-semibold text-purple-100 mb-2">No Limited Edition Items Found</h3>
                <p className="text-purple-200 mb-4">Try adjusting your search criteria or filters</p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  Clear All Filters
                </Button>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1 || loading}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Prev
                </Button>
                <span className="text-sm text-purple-100 px-4">Page {pagination.page} of {pagination.pages}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages || loading}
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-purple-100 text-sm">
              Showing {products.length} of {pagination.total} limited edition products
            </p>
          </div>

          {/* Mobile Active Filters */}
          {hasActiveFilters && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-purple-200">Filters:</span>
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                    "{searchQuery}"
                    <X 
                      size={12} 
                      className="cursor-pointer" 
                      onClick={clearSearch}
                    />
                  </Badge>
                )}
                {categorySlug !== '' && (
                  <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                    {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                    <X 
                      size={12} 
                      className="cursor-pointer" 
                      onClick={() => setCategorySlug('')}
                    />
                  </Badge>
                )}
                {selectedColors.map((c) => (
                  <Badge key={c} variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                    {c}
                    <X 
                      size={12} 
                      className="cursor-pointer" 
                      onClick={() => toggleColor(c)}
                    />
                  </Badge>
                ))}
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1 bg-white/20 text-white border-white/30">
                    {minRating}+ stars
                    <X 
                      size={12} 
                      className="cursor-pointer" 
                      onClick={() => setMinRating(0)}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Mobile Products Grid */}
          <motion.div
            layout
            className={`grid gap-4 ${
              viewMode === 'grid' 
                ? 'grid-cols-2' 
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence>
              {loading ? (
                [...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse bg-white/20 h-64 sm:h-80 rounded-lg" />
                ))
              ) : products.map((product: any, index: number) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="group overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white/10 backdrop-blur-sm border border-white/20">
                    {viewMode === 'grid' ? (
                      // Mobile Grid View
                      <>
                        <div className="relative overflow-hidden">
                          <Link href={`/products/${product.slug}`}>
                            <img
                              src={product.thumbnailImage}
                              alt={product.name}
                              className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </Link>
                          
                          {product.comparePrice && (
                            <Badge className="absolute top-2 right-2 bg-red-500 text-xs">
                              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                            </Badge>
                          )}

                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button 
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600"
                            >
                              <ShoppingBasket size={14} className="mr-1" />
                              Add to Cart
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-3 text-white">
                          <div className="flex items-center mb-1">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={`${
                                    i < Math.floor(product.averageRating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-gray-300 ml-1">
                              ({product.totalReviews || 0})
                            </span>
                          </div>
                          
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="font-semibold text-sm mb-2 group-hover:text-yellow-300 transition-colors line-clamp-2">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-yellow-300">
                                {formatPrice(product.price)}
                              </span>
                              {product.comparePrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.comparePrice)}
                                </span>
                              )}
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleWishlistToggle(product)}
                              className="p-1 h-8 w-8 text-white hover:bg-white/10"
                            >
                              <Heart 
                                size={14} 
                                className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : ''} 
                              />
                            </Button>
                          </div>
                        </CardContent>
                      </>
                    ) : (
                      // Mobile List View
                      <div className="flex">
                        <div className="relative w-24 sm:w-32 flex-shrink-0">
                          <Link href={`/products/${product.slug}`}>
                            <img
                              src={product.thumbnailImage}
                              alt={product.name}
                              className="w-full h-24 sm:h-32 object-cover"
                            />
                          </Link>
                          {product.comparePrice && (
                            <Badge className="absolute top-1 right-1 bg-red-500 text-xs">
                              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                            </Badge>
                          )}
                        </div>
                        
                        <CardContent className="flex-1 p-3 text-white">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center mb-1">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      size={12}
                                      className={`${
                                        i < Math.floor(product.averageRating || 0)
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-300 ml-1">
                                  ({product.totalReviews || 0})
                                </span>
                              </div>
                              
                              <Link href={`/products/${product.slug}`}>
                                <h3 className="text-sm font-semibold mb-1 line-clamp-2 hover:text-yellow-300 transition-colors">
                                  {product.name}
                                </h3>
                              </Link>
                              
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-bold text-yellow-300">
                                  {formatPrice(product.price)}
                                </span>
                                {product.comparePrice && (
                                  <span className="text-xs text-gray-400 line-through">
                                    {formatPrice(product.comparePrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="p-1 h-8 w-8 text-white hover:bg-white/10"
                                onClick={() => handleWishlistToggle(product)}
                              >
                                <Heart 
                                  size={14} 
                                  className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : ''} 
                                />
                              </Button>
                              <Button 
                                onClick={() => handleAddToCart(product)}
                                size="sm"
                                className="text-xs px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600"
                              >
                                <ShoppingBasket size={12} className="mr-1" />
                                Add to Cart
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {!loading && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Crown size={48} className="mx-auto text-purple-300 mb-4" />
              <h3 className="text-lg font-semibold text-purple-100 mb-2">No Limited Edition Items Found</h3>
              <p className="text-purple-200 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={clearFilters} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                Clear All Filters
              </Button>
            </motion.div>
          )}

          {/* Mobile Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1 || loading}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Prev
              </Button>
              <span className="text-sm text-purple-100 px-4">Page {pagination.page} of {pagination.pages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages || loading}
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

// Filter Components (using same structure but adapted for Limited Edition theme)
const MobileFilterContent = ({ 
  categories, categorySlug, setCategorySlug, priceRange, setPriceRange, formatPrice,
  selectedColors, toggleColor, minRating, setMinRating, clearFilters 
}: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Filters</h3>
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear All
      </Button>
    </div>

    {/* Category Filter */}
    <div className="space-y-3">
      <h4 className="font-medium">Category</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="mobile-all"
            checked={categorySlug === ''}
            onCheckedChange={() => setCategorySlug('')}
          />
          <label htmlFor="mobile-all" className="text-sm cursor-pointer">
            All
          </label>
        </div>
        {categories.map((category: any) => (
          <div key={category.slug} className="flex items-center space-x-2">
            <Checkbox
              id={`mobile-${category.slug}`}
              checked={categorySlug === category.slug}
              onCheckedChange={() => setCategorySlug(category.slug)}
            />
            <label htmlFor={`mobile-${category.slug}`} className="text-sm cursor-pointer">
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div className="space-y-3">
      <h4 className="font-medium">Price Range</h4>
      <Slider
        value={priceRange}
        onValueChange={(value) => setPriceRange([value[0] ?? 0, value[1] ?? 50000])}
        max={50000}
        step={1000}
        className="py-4"
      />
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{formatPrice(priceRange[0])}</span>
        <span>{formatPrice(priceRange[1])}</span>
      </div>
    </div>

    {/* Color Filter */}
    <div className="space-y-3">
      <h4 className="font-medium">Color</h4>
      <div className="grid grid-cols-2 gap-2">
        {['Black','White','Blue','Red','Green','Yellow','Gray','Pink','Purple'].map((color) => (
          <div key={color} className="flex items-center space-x-2">
            <Checkbox
              id={`mobile-color-${color}`}
              checked={selectedColors.includes(color)}
              onCheckedChange={() => toggleColor(color)}
            />
            <label htmlFor={`mobile-color-${color}`} className="text-sm cursor-pointer">
              {color}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Rating Filter */}
    <div className="space-y-3">
      <h4 className="font-medium">Minimum Rating</h4>
      <div className="space-y-2">
        {[4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center space-x-2">
            <Checkbox
              id={`mobile-rating-${rating}`}
              checked={minRating === rating}
              onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
            />
            <label htmlFor={`mobile-rating-${rating}`} className="flex items-center space-x-1 text-sm cursor-pointer">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span>& up</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DesktopFilterContent = ({ 
  categories, categorySlug, setCategorySlug, priceRange, setPriceRange, formatPrice,
  selectedColors, toggleColor, minRating, setMinRating, clearFilters 
}: any) => (
  <div className="space-y-6 text-white">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold">Filters</h3>
      <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/10">
        Clear All
      </Button>
    </div>

    {/* Category Filter */}
    <div className="space-y-3 mb-6">
      <h4 className="font-medium">Category</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="desktop-all"
            checked={categorySlug === ''}
            onCheckedChange={() => setCategorySlug('')}
          />
          <label htmlFor="desktop-all" className="text-sm cursor-pointer">
            All
          </label>
        </div>
        {categories.map((category: any) => (
          <div key={category.slug} className="flex items-center space-x-2">
            <Checkbox
              id={`desktop-${category.slug}`}
              checked={categorySlug === category.slug}
              onCheckedChange={() => setCategorySlug(category.slug)}
            />
            <label htmlFor={`desktop-${category.slug}`} className="text-sm cursor-pointer">
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Price Range */}
    <div className="space-y-3 mb-6">
      <h4 className="font-medium">Price Range</h4>
      <Slider
        value={priceRange}
        onValueChange={(value) => setPriceRange([value[0] ?? 0, value[1] ?? 50000])}
        max={50000}
        step={1000}
        className="py-4"
      />
      <div className="flex items-center justify-between text-sm text-gray-300">
        <span>{formatPrice(priceRange[0])}</span>
        <span>{formatPrice(priceRange[1])}</span>
      </div>
    </div>

    {/* Color Filter */}
    <div className="space-y-3 mb-6">
      <h4 className="font-medium">Color</h4>
      <div className="grid grid-cols-3 gap-2">
        {['Black','White','Blue','Red','Green','Yellow','Gray','Pink','Purple'].map((color) => (
          <div key={color} className="flex items-center space-x-2">
            <Checkbox
              id={`desktop-color-${color}`}
              checked={selectedColors.includes(color)}
              onCheckedChange={() => toggleColor(color)}
            />
            <label htmlFor={`desktop-color-${color}`} className="text-sm cursor-pointer">
              {color}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Rating Filter */}
    <div className="space-y-3">
      <h4 className="font-medium">Minimum Rating</h4>
      <div className="space-y-2">
        {[4, 3, 2, 1].map(rating => (
          <div key={rating} className="flex items-center space-x-2">
            <Checkbox
              id={`desktop-rating-${rating}`}
              checked={minRating === rating}
              onCheckedChange={() => setMinRating(minRating === rating ? 0 : rating)}
            />
            <label htmlFor={`desktop-rating-${rating}`} className="flex items-center space-x-1 text-sm cursor-pointer">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span>& up</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  </div>
);