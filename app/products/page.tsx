'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import ProductCard from '@/components/ui/product-card';
import ProductSkeleton from '@/components/ui/product-skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { useDebounce } from '@/hooks/use-debounce';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { setSearchQuery, updateFilters } from '@/lib/store/slices/productSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    Grid,
    Heart,
    List,
    Search,
    ShoppingBasket,
    SlidersHorizontal,
    Star,
    X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const sortOptions = [
  { value: 'all', label: 'All' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A-Z' }
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { filters, searchQuery } = useSelector((state: RootState) => state.products);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [categorySlug, setCategorySlug] = useState<string>('');
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery);
  const [isManuallyClearing, setIsManuallyClearing] = useState(false);
  
  // Debounce the search query for optimal performance
  const debouncedSearchQuery = useDebounce(localSearchQuery, 500);

  const sortMapping = useMemo(() => {
    switch (filters.sortBy) {
      case 'name':
        return { sortBy: 'name', sortOrder: 'asc' };
      case 'price':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'rating':
        return { sortBy: 'averageRating', sortOrder: 'desc' };
      case 'newest':
        return { sortBy: 'createdAt', sortOrder: 'desc' };
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  }, [filters.sortBy]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = await res.json();
        const categoriesArray = data.categories || [];
        setCategories(categoriesArray.map((c: any) => ({ name: c.name, slug: c.slug })));
      } catch (e) {
        // ignore
      }
    };
    loadCategories();
  }, []);

  // Sync debounced search with Redux store
  useEffect(() => {
    // Don't sync if we're manually clearing or if the values are the same
    if (!isManuallyClearing && debouncedSearchQuery !== searchQuery) {
      dispatch(setSearchQuery(debouncedSearchQuery));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSearchQuery, searchQuery, dispatch, isManuallyClearing]);

  // Initialize local search from Redux store and sync external changes
  useEffect(() => {
    // Only update local state if Redux has a different value and local is empty
    // This prevents conflicts during typing but allows external updates
    if (searchQuery !== localSearchQuery && localSearchQuery === '') {
      setLocalSearchQuery(searchQuery);
    }
  }, [searchQuery, localSearchQuery]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set('page', String(pagination.page));
        params.set('limit', String(pagination.limit));
        // Always set search parameter, even if empty to ensure proper clearing
        params.set('search', searchQuery || '');
        if (categorySlug) params.set('category', categorySlug);
        if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
        if (priceRange[1] < 50000) params.set('maxPrice', String(priceRange[1]));
        if (minRating > 0) params.set('minRating', String(minRating));
        if (selectedColors.length > 0) params.set('color', selectedColors.join(','));
        params.set('sortBy', sortMapping.sortBy);
        params.set('sortOrder', sortMapping.sortOrder);

        const res = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        if (res.ok) {
          setProducts(data.products || []);
          setPagination((prev) => ({ ...prev, total: data.pagination.total, pages: data.pagination.pages }));
        }
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          // eslint-disable-next-line no-console
          console.error('Failed to load products', e);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchQuery, categorySlug, priceRange, minRating, selectedColors, sortMapping, pagination.page, pagination.limit]);

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

  const clearFilters = () => {
    setCategorySlug('');
    setSelectedColors([]);
    setPriceRange([0, 50000]);
    setMinRating(0);
    dispatch(setSearchQuery(''));
    dispatch(updateFilters({ sortBy: 'newest' }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const setCategory = (slug: string) => {
    setCategorySlug(slug);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const onSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const clearSearch = () => {
    // Set flag to prevent debounced sync from overriding
    setIsManuallyClearing(true);
    // Clear local state immediately
    setLocalSearchQuery('');
    // Clear Redux state immediately 
    dispatch(setSearchQuery(''));
    // Reset pagination
    setPagination((prev) => ({ ...prev, page: 1 }));
    
    // Reset the flag after a delay to allow normal operation
    setTimeout(() => {
      setIsManuallyClearing(false);
    }, 600); // Wait longer than debounce delay
  };

  const onSortChange = (value: string) => {
    if (value === 'all') {
      dispatch(updateFilters({ sortBy: 'newest' }));
    } else {
      dispatch(updateFilters({ sortBy: value as any }));
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <Header />
      
      <div className="container mx-auto px-4 py-6 md:py-12 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Enhanced Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <div className="relative inline-block mb-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-700 bg-clip-text text-transparent leading-tight">
              Our Premium Collection
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600/20 to-secondary-600/20 blur-xl opacity-30 -z-10 rounded-lg"></div>
          </div>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover handpicked premium products crafted with excellence and designed for modern living
          </p>
          <div className="mt-6 flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"></div>
          </div>
        </motion.div>

        {/* Enhanced Search and Filters Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Premium Search with Glass Effect */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-secondary-100/50 rounded-2xl blur-xl opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-primary-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500" size={22} />
                <Input
                  placeholder="Search our premium collection..."
                  value={localSearchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-12 pr-12 h-14 bg-transparent border-0 text-slate-700 placeholder:text-slate-500 text-lg focus:ring-2 focus:ring-primary-500/20 rounded-2xl"
                />
                {localSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary-100 rounded-full transition-all duration-200"
                  >
                    <X size={18} className="text-slate-500 hover:text-slate-700" />
                  </Button>
                )}
                {loading && localSearchQuery && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Premium Sort Selector */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-100/50 to-primary-100/50 rounded-2xl blur-xl opacity-60"></div>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => onSortChange(value)}
              >
                <SelectTrigger className="relative w-full lg:w-56 h-14 bg-white/80 backdrop-blur-sm border border-secondary-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-slate-700">
                  <SelectValue placeholder="Sort by" className="text-lg" />
                </SelectTrigger>
                <SelectContent className="bg-white/95 backdrop-blur-sm border border-primary-200/50 rounded-xl shadow-xl">
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value} className="text-slate-700 hover:bg-primary-50/50">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Premium View Mode Toggle - Desktop Only */}
            <div className="hidden lg:flex relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-secondary-100/50 rounded-2xl blur-xl opacity-60"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-primary-200/50 rounded-2xl p-1.5 shadow-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`px-6 py-3 transition-all duration-300 rounded-xl ${viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                    : 'hover:bg-primary-50 text-slate-600'}`}
                >
                  <Grid size={18} className="mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`px-6 py-3 transition-all duration-300 rounded-xl ${viewMode === 'list' 
                    ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg' 
                    : 'hover:bg-primary-50 text-slate-600'}`}
                >
                  <List size={18} className="mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Premium Filter Toggle - Desktop */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-100/50 to-primary-100/50 rounded-2xl blur-xl opacity-60"></div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="relative h-14 px-6 bg-white/80 backdrop-blur-sm border border-secondary-200/50 hover:border-secondary-300 hover:bg-secondary-50/50 transition-all duration-300 font-semibold text-slate-700 rounded-2xl shadow-lg hover:shadow-xl"
              >
                <SlidersHorizontal size={20} className="mr-3 text-secondary-600" />
                Filters
                <ChevronDown 
                  size={18} 
                  className={`ml-3 transition-transform duration-300 text-secondary-600 ${showFilters ? 'rotate-180' : ''}`} 
                />
              </Button>
            </div>
          </div>

          {/* Premium Mobile Action Bar */}
          <div className="flex lg:hidden gap-4">
            {/* Premium Filter Button */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-secondary-100/50 rounded-2xl blur-lg opacity-60"></div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="relative w-full h-12 bg-white/80 backdrop-blur-sm border border-primary-200/50 hover:border-primary-300 hover:bg-primary-50/50 transition-all duration-300 font-semibold text-slate-700 rounded-2xl shadow-lg"
                    >
                      <SlidersHorizontal size={20} className="mr-2 text-primary-600" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0 bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/20">
                    <SheetHeader className="p-6 pb-0 text-left">
                      <SheetTitle className="text-left text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Filters</SheetTitle>
                    </SheetHeader>
                  <div className="p-6">
                    {/* Mobile Filter Content - will be defined below */}
                    <MobileFilterContent 
                      categories={categories}
                      categorySlug={categorySlug}
                      setCategory={setCategory}
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
            </div>

            {/* Premium View Mode Toggle */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-100/50 to-primary-100/50 rounded-2xl blur-lg opacity-60"></div>
                <div className="relative flex h-12 border border-secondary-200/50 rounded-2xl p-1 bg-white/80 backdrop-blur-sm shadow-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 h-full transition-all duration-300 rounded-xl ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                        : 'hover:bg-primary-50/50 text-slate-600'
                    }`}
                  >
                    <Grid size={16} className="mr-1" />
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`flex-1 h-full transition-all duration-300 rounded-xl ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                        : 'hover:bg-primary-50/50 text-slate-600'
                    }`}
                  >
                    <List size={16} className="mr-1" />
                    List
                  </Button>
                </div>
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
                <Card className="p-6">
                  <DesktopFilterContent 
                    categories={categories}
                    categorySlug={categorySlug}
                    setCategory={setCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    formatPrice={formatPrice}
                    selectedColors={selectedColors}
                    toggleColor={toggleColor}
                    minRating={minRating}
                    setMinRating={setMinRating}
                    clearFilters={clearFilters}
                  />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Products Grid/List */}
          <div className="flex-1">
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Collection</h2>
                <div className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                  <p className="text-sm font-medium text-gray-600">
                    👉 Showing {products.length} of {pagination.total} products
                  </p>
                </div>
              </div>
              
              {(searchQuery || categorySlug !== '' || minRating > 0 || selectedColors.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Applied filters:</span>
                  {searchQuery && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={clearSearch}>
                      "{searchQuery}"
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                  {categorySlug !== '' && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setCategory('')}>
                      {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                  {selectedColors.map((c) => (
                    <Badge key={c} className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => toggleColor(c)}>
                      {c}
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  ))}
                  {minRating > 0 && (
                    <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setMinRating(0)}>
                      ⭐ {minRating}+ Stars
                      <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <motion.div
              layout
              className="mb-8"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <ProductSkeleton 
                    count={12} 
                    variant={viewMode === 'list' ? 'list' : 'grid'}
                    className="mb-6"
                  />
                ) : products.length > 0 ? (
                  viewMode === 'list' ? (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="group"
                        >
                          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                            <CardContent className="p-0">
                              <div className="flex flex-col md:flex-row">
                                {/* Image Container - Responsive */}
                                <div className="relative w-full md:w-48 h-48 md:h-32 overflow-hidden bg-gray-50">
                                  <Link href={`/products/${product.slug}`} className="block h-full">
                                    <Image
                                      src={product.thumbnailImage}
                                      alt={product.name}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 192px"
                                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                  </Link>
                                  
                                  {/* Discount Badge */}
                                  {product.comparePrice !== 0 && product.comparePrice !== undefined && product.comparePrice > product.price && (
                                    <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-sm">
                                      {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                    </Badge>
                                  )}
                                </div>
                                
                                {/* Content - Responsive */}
                                <div className="flex-1 p-4 md:p-6">
                                  <div className="flex flex-col h-full">
                                    {/* Category */}
                                    {product.category && (
                                      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                                        {product.category.name}
                                      </p>
                                    )}
                                    
                                    {/* Product Name */}
                                    <Link href={`/products/${product.slug}`} className="block flex-1">
                                      <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
                                        {product.name}
                                      </h3>
                                    </Link>
                                    
                                    {/* Rating */}
                                    <div className="flex items-center gap-2 mb-4">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            size={16}
                                            className={`${
                                              i < Math.floor(product.averageRating || 0)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        ({product.totalReviews || 0} reviews)
                                      </span>
                                    </div>
                                    
                                    {/* Price and Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                      <div className="flex flex-col">
                                        <span className="text-xl font-bold text-primary-600">
                                          {formatPrice(product.price)}
                                        </span>
                                        {product.comparePrice !== 0 && product.comparePrice !== undefined && product.comparePrice > product.price && (
                                          <span className="text-sm text-gray-500 line-through">
                                            {formatPrice(product.comparePrice)}
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleWishlistToggle(product);
                                          }}
                                          className="p-2 rounded-full hover:bg-primary-50 transition-all duration-300"
                                        >
                                          <Heart 
                                            size={16} 
                                            className={`transition-colors duration-300 ${wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : 'text-gray-500 hover:text-red-500'}`} 
                                          />
                                        </Button>
                                        
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddToCart(product);
                                          }}
                                          className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-semibold"
                                        >
                                          <ShoppingBasket size={16} className="mr-2" />
                                          Add to Cart
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="grid-view"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                      {products.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ y: -4 }}
                        >
                          <ProductCard
                            product={{
                              _id: product._id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              comparePrice: product.comparePrice,
                              thumbnailImage: product.thumbnailImage,
                              averageRating: product.averageRating,
                              totalReviews: product.totalReviews,
                              category: product.category,
                              quantity: product.quantity || 0
                            }}
                            variant="default"
                            showQuickActions={true}
                            className="h-full"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="no-products"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="col-span-full text-center py-12"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search criteria or filters
                    </p>
                    <Button onClick={clearFilters}>Clear All Filters</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                  isLoading={loading}
                  className="mb-6"
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Premium Mobile Layout */}
        <div className="lg:hidden">
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Collection</h2>
              <div className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                <p className="text-sm font-medium text-gray-600">
                  👉 Showing {products.length} of {pagination.total} products
                </p>
              </div>
            </div>
            
            {(searchQuery || categorySlug !== '' || minRating > 0 || selectedColors.length > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Applied filters:</span>
                {searchQuery && (
                  <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={clearSearch}>
                    "{searchQuery}"
                    <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}
                {categorySlug !== '' && (
                  <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setCategory('')}>
                    {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                    <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}
                {selectedColors.map((c) => (
                  <Badge key={c} className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => toggleColor(c)}>
                    {c}
                    <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                ))}
                {minRating > 0 && (
                  <Badge className="bg-gray-100 text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 group cursor-pointer" onClick={() => setMinRating(0)}>
                    ⭐ {minRating}+ Stars
                    <X size={12} className="ml-1 group-hover:text-red-500 transition-colors" />
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Premium Mobile Products Grid */}
          <motion.div
            layout
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <ProductSkeleton 
                  count={12} 
                  variant={viewMode === 'list' ? 'list' : 'grid'}
                  className="mb-6"
                />
              ) : products.length > 0 ? (
                viewMode === 'list' ? (
                  <motion.div
                    key="mobile-list-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group"
                      >
                        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                              {/* Image Container - Responsive */}
                              <div className="relative w-full md:w-48 h-48 md:h-32 overflow-hidden bg-gray-50">
                                <Link href={`/products/${product.slug}`} className="block h-full">
                                  <Image
                                    src={product.thumbnailImage}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 192px"
                                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                                  />
                                </Link>
                                
                                {/* Discount Badge */}
                                {product.comparePrice && product.comparePrice > product.price && (
                                  <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-sm">
                                    {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Content - Responsive */}
                              <div className="flex-1 p-4 md:p-6">
                                <div className="flex flex-col h-full">
                                  {/* Category */}
                                  {product.category && (
                                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">
                                      {product.category.name}
                                    </p>
                                  )}
                                  
                                  {/* Product Name */}
                                  <Link href={`/products/${product.slug}`} className="block flex-1">
                                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-3 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
                                      {product.name}
                                    </h3>
                                  </Link>
                                  
                                  {/* Rating */}
                                  <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          size={16}
                                          className={`${
                                            i < Math.floor(product.averageRating || 0)
                                              ? 'text-yellow-400 fill-yellow-400'
                                              : 'text-gray-300'
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                      ({product.totalReviews || 0} reviews)
                                    </span>
                                  </div>
                                  
                                  {/* Price and Actions */}
                                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex flex-col">
                                      <span className="text-xl font-bold text-primary-600">
                                        {formatPrice(product.price)}
                                      </span>
                                      {product.comparePrice && product.comparePrice > product.price && (
                                        <span className="text-sm text-gray-500 line-through">
                                          {formatPrice(product.comparePrice)}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleWishlistToggle(product);
                                        }}
                                        className="p-2 rounded-full hover:bg-primary-50 transition-all duration-300"
                                      >
                                        <Heart 
                                          size={16} 
                                          className={`transition-colors duration-300 ${wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : 'text-gray-500 hover:text-red-500'}`} 
                                        />
                                      </Button>
                                      
                                      <Button
                                        size="sm"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleAddToCart(product);
                                        }}
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-semibold"
                                      >
                                        <ShoppingBasket size={16} className="mr-2" />
                                        Add to Cart
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-grid-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 gap-3 sm:gap-4"
                  >
                    {products.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                      >
                        <ProductCard
                          product={{
                            _id: product._id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            comparePrice: product.comparePrice,
                            thumbnailImage: product.thumbnailImage,
                            averageRating: product.averageRating,
                            totalReviews: product.totalReviews,
                            category: product.category,
                            quantity: product.quantity || 0
                          }}
                          variant="default"
                          showQuickActions={true}
                          className="h-full"
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )
              ) : (
                <motion.div
                  key="mobile-no-products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="col-span-full text-center py-12"
                >
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Try adjusting your search or filters
                  </p>
                  <Button onClick={clearFilters} size="sm">Clear All Filters</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Mobile Pagination */}
          {pagination.pages > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={(newPage) => setPagination(prev => ({ ...prev, page: newPage }))}
                isLoading={loading}
                className="mb-6"
              />
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

// Premium Filter Components
const MobileFilterContent = ({ 
  categories, categorySlug, setCategory, priceRange, setPriceRange, formatPrice,
  selectedColors, toggleColor, minRating, setMinRating, clearFilters 
}: any) => (
  <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
    <div className="flex items-center justify-between">
      <h3 className="font-bold text-xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Filters</h3>
      <Button variant="outline" size="sm" onClick={clearFilters} className="border-primary-200 hover:border-primary-400 hover:bg-primary-50 text-primary-600 rounded-full">
        Clear All
      </Button>
    </div>

    {/* Premium Category Filter */}
    <div className="space-y-4">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Category</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="mobile-all"
            checked={categorySlug === ''}
            onCheckedChange={() => setCategory('')}
          />
          <label htmlFor="mobile-all" className="text-sm cursor-pointer text-gray-500">
            All
          </label>
        </div>
        {categories.map((category: any) => (
          <div key={category.slug} className="flex items-center space-x-2">
            <Checkbox
              id={`mobile-${category.slug}`}
              checked={categorySlug === category.slug}
              onCheckedChange={() => setCategory(category.slug)}
            />
            <label htmlFor={`mobile-${category.slug}`} className="text-sm text-gray-500 cursor-pointer">
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Premium Price Range */}
    <div className="space-y-4">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Price Range</h4>
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

    {/* Premium Color Filter */}
    <div className="space-y-4">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Color</h4>
      <div className="grid grid-cols-2 gap-2">
        {['Black','White','Blue','Red','Green','Yellow','Gray','Pink','Purple'].map((color) => (
          <div key={color} className="flex items-center space-x-2">
            <Checkbox
              id={`mobile-color-${color}`}
              checked={selectedColors.includes(color)}
              onCheckedChange={() => toggleColor(color)}
            />
            <label htmlFor={`mobile-color-${color}`} className="text-sm text-gray-500 cursor-pointer">
              {color}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Premium Rating Filter */}
    <div className="space-y-4">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Minimum Rating</h4>
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
  categories, categorySlug, setCategory, priceRange, setPriceRange, formatPrice,
  selectedColors, toggleColor, minRating, setMinRating, clearFilters 
}: any) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="font-bold text-2xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Filters</h3>
      <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-primary-50 text-primary-600 rounded-full">
        Clear All
      </Button>
    </div>

    {/* Premium Category Filter */}
    <div className="space-y-4 mb-8">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Category</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="desktop-all"
            checked={categorySlug === ''}
            onCheckedChange={() => setCategory('')}
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
              onCheckedChange={() => setCategory(category.slug)}
            />
            <label htmlFor={`desktop-${category.slug}`} className="text-sm cursor-pointer">
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Premium Price Range */}
    <div className="space-y-4 mb-8">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Price Range</h4>
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

    {/* Premium Color Filter */}
    <div className="space-y-4 mb-8">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Color</h4>
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

    {/* Premium Rating Filter */}
    <div className="space-y-4">
      <h4 className="font-bold text-lg text-slate-800 border-b border-primary-100 pb-2">Minimum Rating</h4>
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