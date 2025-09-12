'use client';

import NestedCategoryTree from '@/components/categories/NestedCategoryTree';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Grid, Minus, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  parent?: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  children?: Category[];
  productCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedRootCategory, setSelectedRootCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];
      
      // Store all categories
      setAllCategories(categoriesArray);
      
      // Build category tree
      const rootCategories = categoriesArray.filter((cat: Category) => !cat.parent);
      const categoriesWithChildren = rootCategories.map((parent: Category) => ({
        ...parent,
        children: categoriesArray.filter((cat: Category) => 
          cat.parent && cat.parent._id === parent._id
        )
      }));
      
      setCategories(categoriesWithChildren);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
      setAllCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildCategories = async (parentId: string) => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];
      
      // Filter child categories for the selected parent
      const children = categoriesArray.filter((cat: Category) => 
        cat.parent && cat.parent._id === parentId
      );
      setChildCategories(children);
    } catch (error) {
      console.error('Error fetching child categories:', error);
      setChildCategories([]);
    }
  };

  const handleRootCategorySelect = (category: Category) => {
    setSelectedRootCategory(category);
    fetchChildCategories(category._id);
  };

  const handleMobileCategorySelect = (category: Category) => {
    // Navigate to products page with category filter
    window.location.href = `/categories/${category.slug}`;
  };

  const getCategoryImage = (slug: string) => {
    const images: { [key: string]: string } = {
      'electronics': 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=600',
      'fashion': 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600',
      'home-living': 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
      'sports-fitness': 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=600',
      'books-education': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600',
      'health-beauty': 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=600',
    };
    return images[slug] || 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-pink-500 to-rose-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-indigo-500 to-blue-600',
      'from-purple-500 to-pink-600',
    ];
    return colors[index % colors.length];
  };

  const getCategoryDisplay = (category: Category, variant: 'card' | 'icon' = 'card') => {
    if (variant === 'icon') {
      // For mobile horizontal list - circular icons
      if (category.image) {
        return (
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg ring-2 ring-white/20">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        );
      }

      // Fallback: gradient circle with first letter
      const firstChar = category.name.charAt(0).toUpperCase();
      return (
        <div className="w-16 h-16 flex items-center justify-center text-white font-bold text-lg rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg ring-2 ring-white/20">
          {firstChar}
        </div>
      );
    }

    // Card variant for main grid
    if (category.image) {
      return (
        <div className="relative w-full h-64 overflow-hidden group rounded-2xl">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
            <p className="text-white/90 text-sm line-clamp-2">{category.description}</p>
          </div>
        </div>
      );
    }

    // Fallback: Modern gradient background
    return (
      <div className="relative w-full h-64 overflow-hidden group rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-violet-600 transition-all duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{category.description}</p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rotate-45 rounded-sm" />
        <div className="absolute top-6 right-6 w-4 h-4 border border-white/20 rotate-45 rounded-sm" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
        <Header />
        <div className="pt-16 md:pt-20 mb-20 md:mb-0">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-8 h-8 text-indigo-600" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                Discover Categories
              </h1>
              <p className="text-gray-600 text-lg">Loading amazing categories for you...</p>
            </div>
            
            {/* Desktop Loading */}
            <div className="hidden lg:block mb-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl mb-4 mx-auto animate-pulse"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Mobile Loading */}
            <div className="block lg:hidden">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/80 rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-indigo-200 to-violet-200 rounded-2xl animate-pulse"></div>
                      <div className="flex-1">
                        <div className="w-32 h-5 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="w-40 h-3 bg-gray-100 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.05),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,92,246,0.05),transparent_50%)]"></div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 pt-16 md:pt-20 mb-20 md:mb-0 relative">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-full text-sm font-medium text-indigo-700 mb-6">
            <Sparkles className="w-4 h-4" />
            Curated Collections
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
            Discover Categories
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Explore our carefully curated categories, each designed to bring you the finest products 
            from trusted brands and emerging designers.
          </p>
        </motion.div>

        {/* Mobile: Expandable Parent-Child Category Display */}
        <div className="block lg:hidden mb-12">
          <div className="space-y-3">
            {categories.map((category, index) => (
              <motion.div
                key={category._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between p-4">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex items-center space-x-4 flex-1"
                  >
                    <div className="flex-shrink-0">
                      {getCategoryDisplay(category, 'icon')}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-1">
                          {category.description}
                        </p>
                      )}
                      {category.productCount && (
                        <p className="text-xs text-indigo-600 font-medium">
                          {category.productCount} items available
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  {category.children && category.children.length > 0 && (
                    <button
                      onClick={() => toggleCategoryExpansion(category._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors ml-2"
                    >
                      {expandedCategories.has(category._id) ? (
                        <Minus size={20} className="text-indigo-600" />
                      ) : (
                        <Plus size={20} className="text-gray-400" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expandable Subcategories */}
                <AnimatePresence>
                  {expandedCategories.has(category._id) && category.children && category.children.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="border-t border-gray-100 bg-gradient-to-r from-indigo-50/50 to-violet-50/50"
                    >
                      <div className="p-4 space-y-2">
                        {category.children.map((child) => (
                          <Link
                            key={child._id}
                            href={`/categories/${child.slug}`}
                            className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/80 transition-all duration-200 group"
                          >
                            <div className="flex-shrink-0">
                              {getCategoryDisplay(child, 'icon')}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {child.name}
                              </p>
                              {child.description && (
                                <p className="text-sm text-gray-500 line-clamp-1">
                                  {child.description}
                                </p>
                              )}
                              {child.productCount && (
                                <p className="text-xs text-gray-400">
                                  {child.productCount} items
                                </p>
                              )}
                            </div>
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Desktop: Modern Grid Layout */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Browse by Category</h3>
                <NestedCategoryTree 
                  onCategorySelect={(category) => {
                    if (category) {
                      window.location.href = `/products?category=${category.slug}`;
                    }
                  }}
                  selectedCategory={null}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Breadcrumb */}
              {selectedRootCategory && (
                <div className="flex items-center space-x-2 mb-6 text-sm">
                  <button 
                    onClick={() => {
                      setSelectedRootCategory(null);
                      setChildCategories([]);
                    }}
                    className="text-gray-600 hover:text-indigo-600 transition-colors px-3 py-1 rounded-lg hover:bg-indigo-50"
                  >
                    All Categories
                  </button>
                  <ChevronRight size={16} className="text-gray-400" />
                  <span className="text-gray-900 font-medium">{selectedRootCategory.name}</span>
                </div>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {(selectedRootCategory ? childCategories : categories).map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    {selectedRootCategory ? (
                      // Child category - navigate to products
                      <Link href={`/categories/${category.slug}`}>
                        <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full cursor-pointer bg-white/80 backdrop-blur-sm">
                          <div className="relative">
                            {getCategoryDisplay(category)}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white/90 text-sm font-medium mb-1">Explore Collection</p>
                                    <p className="text-white text-lg font-bold">View Products</p>
                                  </div>
                                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <ArrowRight className="text-white" size={20} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ) : (
                      // Root category - show children or navigate directly
                      <Link href={`/categories/${category.slug}`}>
                        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full bg-white/80 backdrop-blur-sm cursor-pointer group">
                          <div className="relative">
                            {getCategoryDisplay(category)}
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                              <div className="absolute bottom-0 left-0 right-0 p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-white/90 text-sm font-medium mb-1">Discover Collection</p>
                                    <p className="text-white text-lg font-bold">Browse Products</p>
                                  </div>
                                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <ArrowRight className="text-white" size={20} />
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Product Count Badge */}
                            {category.productCount !== undefined && category.productCount > 0 && (
                              <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 text-gray-900 font-medium backdrop-blur-sm shadow-sm">
                                  {category.productCount} items
                                </Badge>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
            
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="inline-block mb-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-300" />
              </motion.div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Explore?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Discover thousands of products across all our categories. From trending items to timeless classics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-indigo-600 hover:bg-white/90 hover:scale-105 transition-all duration-200 group shadow-xl px-8"
                  >
                    <Grid className="mr-2" size={20} />
                    Explore Products
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 border-2 border-white text-white hover:bg-white hover:text-indigo-600 transition-all duration-200 group"
                  >
                    Browse All Products
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}