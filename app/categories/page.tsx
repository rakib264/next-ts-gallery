'use client';

import HorizontalCategoryList from '@/components/categories/HorizontalCategoryList';
import NestedCategoryTree from '@/components/categories/NestedCategoryTree';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/hooks/use-settings';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronRight, Grid } from 'lucide-react';
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
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedRootCategory, setSelectedRootCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];
      
      // Filter root categories (no parent)
      const rootCategories = categoriesArray.filter((cat: Category) => !cat.parent);
      setCategories(rootCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
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

  const getCategoryDisplay = (category: Category) => {
    if (category.image) {
      return (
        <div className="relative w-full h-64 overflow-hidden group">
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

    // Fallback: Luxurious gradient background with full name
    const primaryColor = settings?.primaryColor || '#3B82F6';
    
    return (
      <div className="relative w-full h-64 overflow-hidden group">
        <div 
          className="absolute inset-0 bg-gradient-to-br opacity-90 transition-all duration-700 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 50%, ${primaryColor}bb 100%)` 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-6">
          <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{category.description}</p>
        </div>
        {/* Decorative pattern */}
        <div className="absolute top-4 right-4 w-8 h-8 border-2 border-white/30 rotate-45" />
        <div className="absolute top-6 right-6 w-4 h-4 border border-white/20 rotate-45" />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Shop by Category
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore our diverse collection of categories, each carefully curated 
            to bring you the finest products in every field.
          </p>
        </motion.div>

        {/* Mobile: Horizontal Category List */}
        <div className="block lg:hidden mb-8">
          <HorizontalCategoryList 
            onCategorySelect={handleMobileCategorySelect}
            selectedCategory={null}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop: Nested Category Tree Sidebar */}
          <div className="hidden lg:block">
            <NestedCategoryTree 
              onCategorySelect={(category) => {
                if (category) {
                  window.location.href = `/products?category=${category.slug}`;
                }
              }}
              selectedCategory={null}
              className="sticky top-24"
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            {selectedRootCategory && (
              <div className="flex items-center space-x-2 mb-6 text-sm text-muted-foreground">
                <button 
                  onClick={() => {
                    setSelectedRootCategory(null);
                    setChildCategories([]);
                  }}
                  className="hover:text-primary transition-colors"
                >
                  Categories
                </button>
                <ChevronRight size={16} />
                <span className="text-foreground font-medium">{selectedRootCategory.name}</span>
              </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {(selectedRootCategory ? childCategories : categories).map((category, index) => (
                <motion.div
                  key={category._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
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
                    // Root category - show children or products
                    <div 
                      onClick={() => handleRootCategorySelect(category)}
                      className="cursor-pointer group"
                    >
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 h-full bg-white/80 backdrop-blur-sm">
                        <div className="relative">
                          {getCategoryDisplay(category)}
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-white/90 text-sm font-medium mb-1">Discover More</p>
                                  <p className="text-white text-lg font-bold">Explore Collection</p>
                                </div>
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                  <ChevronRight className="text-white" size={20} />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Count Badge */}
                          {category.productCount !== undefined && category.productCount > 0 && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-white/90 text-black font-medium backdrop-blur-sm">
                                {category.productCount} items
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center mt-16"
            >
              <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-4">Ready to Explore?</h2>
                <p className="text-blue-100 mb-6">
                  Use our advanced explore page with nested categories, filters, and smart search to find exactly what you need.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/explore">
                    <Button size="lg" variant="secondary" className="px-8">
                      <Grid className="mr-2" size={20} />
                      Explore Products
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button size="lg" variant="outline" className="px-8 border-white text-white hover:bg-white hover:text-primary">
                      Browse All Products
                      <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}