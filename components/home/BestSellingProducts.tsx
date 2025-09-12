'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { ArrowRight, Award, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface BestSellingProductsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showPagination?: boolean;
  className?: string;
}

export default function BestSellingProducts({ 
  title = "Best Selling Products",
  subtitle = "Discover our most popular fashion items loved by customers worldwide",
  limit = 8,
  showPagination = false,
  className = ""
}: BestSellingProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${limit}&sortBy=totalSales&sortOrder=desc&active=true`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching best selling products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-16 lg:py-24 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white/60 h-80 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/40 to-red-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/40 to-orange-200/40 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: '10%', top: '20%' }, { left: '25%', top: '40%' }, { left: '40%', top: '60%' },
              { left: '55%', top: '80%' }, { left: '70%', top: '30%' }, { left: '85%', top: '50%' },
              { left: '15%', top: '70%' }, { left: '30%', top: '10%' }, { left: '45%', top: '90%' },
              { left: '60%', top: '15%' }, { left: '75%', top: '75%' }, { left: '90%', top: '35%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-300/30 rounded-full"
                style={position}
                animate={{
                  y: [0, -25, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: (i % 4) * 0.5,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <TrendingUp className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent text-center">
              {title}
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <Award className="text-white" size={24} />
            </motion.div>
          </div>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            {subtitle}
          </p>
          
          {/* Popular Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-400/30 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"
              />
              <Users size={16} className="text-orange-600" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-orange-700">Customer Favorites</span>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{total}</div>
              <div className="text-xs sm:text-sm text-gray-500">Total Products</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">4.8</div>
              <div className="text-xs sm:text-sm text-gray-500">Avg Rating</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-pink-600">10K+</div>
              <div className="text-xs sm:text-sm text-gray-500">Happy Customers</div>
            </div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="relative">
                <ProductCard
                  product={product}
                  index={index}
                  variant="best-selling"
                  className="h-full"
                />
                
                {/* BEST SELLER Badge */}
                <motion.div
                  className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  HOT
                </motion.div>

                {/* Sales Counter */}
                <motion.div
                  className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.7 }}
                >
                  #{index + 1} Best Seller
                </motion.div>

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  initial={false}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/products/best-selling">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
              >
                <TrendingUp size={20} className="mr-3" />
                Explore All Best Sellers
                <ArrowRight size={20} className="ml-3" />
              </Button>
            </Link>
          </motion.div>
        )}

        {/* No Products */}
        {!loading && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <TrendingUp size={80} className="mx-auto text-gray-300 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Best Selling Products Found</h3>
            <p className="text-gray-500 text-lg">Check back later for our most popular items.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
