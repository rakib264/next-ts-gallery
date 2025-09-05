'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Grid } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
  children?: Category[];
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      const categoriesArray = data.categories || [];
      
      // Store all categories for mobile
      setAllCategories(categoriesArray);
      
      // Build category tree for desktop
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
      setLoadingCategories(false);
    }
  };

  const getCategoryDisplay = (category: Category, isMobile: boolean = false) => {
    const sizeClass = isMobile ? 'w-16 h-16' : 'w-12 h-12';
    const textSizeClass = isMobile ? 'text-lg' : 'text-sm';
    const borderRadius = isMobile ? 'rounded-full' : 'rounded-lg';

    if (category.image) {
      return (
        <img
          src={category.image}
          alt={category.name}
          className={`${sizeClass} object-cover ${borderRadius}`}
        />
      );
    }

    // Fallback: Primary color background + first character
    const firstChar = category.name.charAt(0).toUpperCase();
    const primaryColor = settings?.primaryColor || '#3B82F6';
    
    return (
      <div 
        className={`${sizeClass} flex items-center justify-center text-white font-bold ${textSizeClass} ${borderRadius}`}
        style={{ backgroundColor: primaryColor }}
      >
        {firstChar}
      </div>
    );
  };

  if (loadingCategories) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
          
          {/* Desktop Loading */}
          <div className="hidden md:flex justify-center mb-8">
            <div className="flex space-x-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-24 h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile Loading */}
          <div className="block md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 animate-pulse text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-2"></div>
                  <div className="w-12 h-3 bg-gray-300 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our diverse collection of categories, each carefully curated 
            to bring you the finest products in every field.
          </p>
        </motion.div>

        {/* Desktop: Navigation Bar Style with Hover Dropdowns */}
        <div className="hidden md:block mb-8">
          <div className="bg-white/80 backdrop-blur-sm border border-border rounded-lg p-4 shadow-sm">
            <div className="flex justify-center items-center space-x-8">
              {categories.map((category, index) => (
                <div
                  key={category._id}
                  className="relative group"
                  onMouseEnter={() => setHoveredCategory(category._id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-primary/10 transition-all duration-200 cursor-pointer group"
                    >
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                      {category.children && category.children.length > 0 && (
                        <ChevronDown 
                          size={14} 
                          className="text-muted-foreground group-hover:text-primary transition-colors"
                        />
                      )}
                    </motion.div>
                  </Link>

                  {/* Hover Dropdown */}
                  <AnimatePresence>
                    {hoveredCategory === category._id && category.children && category.children.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-sm border border-border rounded-lg shadow-lg z-50 p-4"
                      >
                        <div className="grid grid-cols-1 gap-2">
                          {category.children.map((child) => (
                            <Link
                              key={child._id}
                              href={`/categories/${child.slug}`}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
                            >
                              <div className="flex-shrink-0">
                                {getCategoryDisplay(child, false)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                  {child.name}
                                </p>
                                {child.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {child.description}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-border">
                          <Link
                            href={`/categories/${category.slug}`}
                            className="block text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            View All {category.name} →
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal Circular Categories */}
        <div className="block md:hidden mb-8">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {allCategories.map((category, index) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="flex-shrink-0"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-center cursor-pointer group"
                >
                  <div className="mb-2 transform group-hover:scale-110 transition-transform duration-200">
                    {getCategoryDisplay(category, true)}
                  </div>
                  <p className="text-xs font-medium text-center w-16 truncate group-hover:text-primary transition-colors">
                    {category.name}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/categories">
            <Button size="lg" className="group">
              <Grid className="mr-2" size={20} />
              Browse All Categories
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
