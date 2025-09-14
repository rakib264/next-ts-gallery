'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NewArrivalsProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export default function NewArrivals({ 
  title = "New Arrivals",
  subtitle = "Fresh styles just landed! Be the first to discover our latest fashion collections",
  limit = 8,
  className = ""
}: NewArrivalsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${limit}&isNewArrival=true&sortBy=createdAt&sortOrder=desc&active=true`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className={`py-16 lg:py-24 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 relative overflow-hidden ${className}`}>
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
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50 relative overflow-hidden ${className}`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/40 to-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-200/40 to-indigo-200/40 rounded-full blur-3xl"></div>
        
        {/* Floating elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: '8%', top: '15%' }, { left: '18%', top: '35%' }, { left: '28%', top: '55%' },
              { left: '38%', top: '75%' }, { left: '48%', top: '25%' }, { left: '58%', top: '85%' },
              { left: '68%', top: '45%' }, { left: '78%', top: '65%' }, { left: '88%', top: '20%' },
              { left: '12%', top: '70%' }, { left: '22%', top: '40%' }, { left: '32%', top: '90%' },
              { left: '42%', top: '30%' }, { left: '52%', top: '80%' }, { left: '62%', top: '50%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-300/30 rounded-full"
                style={position}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 4 + (i % 3) * 2,
                  repeat: Infinity,
                  delay: (i % 4) * 0.8,
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
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <Sparkles className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
              {title}
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <Zap className="text-white" size={24} />
            </motion.div>
          </div>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            {subtitle}
          </p>
          
          {/* Live Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 backdrop-blur-sm border border-emerald-400/30 px-4 sm:px-6 py-3 rounded-xl sm:rounded-2xl shadow-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-500 rounded-full"
              />
              <Clock size={16} className="text-emerald-600" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-emerald-700">Updated Daily</span>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">{products.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">New Items</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">Today</div>
              <div className="text-xs sm:text-sm text-gray-500">Just Added</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">4.9</div>
              <div className="text-xs sm:text-sm text-gray-500">Avg Rating</div>
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
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              variant="new-arrival"
              className="h-full"
            />
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
            <Link href="/products/new-arrivals">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
              >
                <Sparkles size={20} className="mr-3" />
                Explore All New Arrivals
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
              <Sparkles size={80} className="mx-auto text-gray-300 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No New Arrivals Yet</h3>
            <p className="text-gray-500 text-lg">Stay tuned for exciting new products coming soon!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
