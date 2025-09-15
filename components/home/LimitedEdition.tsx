'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { ArrowRight, Crown, Flame, Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LimitedEditionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  className?: string;
}

export default function LimitedEdition({ 
  title = "Limited Edition",
  subtitle = "Exclusive pieces in limited quantities. Don't miss out on these rare finds before they're gone forever",
  limit = 8,
  className = ""
}: LimitedEditionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?limit=${limit}&isLimitedEdition=true&sortBy=quantity&sortOrder=asc&active=true`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching limited edition products:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <section className={`py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-white/20 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-white/20 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white/20 h-80 w-72 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 lg:py-24 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden ${className}`}>
      {/* Enhanced Premium Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-r from-yellow-400/30 to-pink-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-yellow-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
        
        {/* Enhanced Animated particles */}
        <div className="absolute inset-0">
          {[...Array(25)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: '5%', top: '10%' }, { left: '15%', top: '30%' }, { left: '25%', top: '50%' },
              { left: '35%', top: '70%' }, { left: '45%', top: '20%' }, { left: '55%', top: '80%' },
              { left: '65%', top: '40%' }, { left: '75%', top: '60%' }, { left: '85%', top: '15%' },
              { left: '95%', top: '35%' }, { left: '10%', top: '60%' }, { left: '20%', top: '80%' },
              { left: '30%', top: '25%' }, { left: '40%', top: '75%' }, { left: '50%', top: '45%' },
              { left: '60%', top: '65%' }, { left: '70%', top: '5%' }, { left: '80%', top: '85%' },
              { left: '90%', top: '55%' }, { left: '12%', top: '90%' }, { left: '8%', top: '40%' },
              { left: '22%', top: '15%' }, { left: '38%', top: '85%' }, { left: '52%', top: '10%' },
              { left: '68%', top: '90%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };
            
            return (
              <motion.div
                key={i}
                className={`absolute rounded-full ${
                  i % 3 === 0 ? 'w-1 h-1 bg-white/40' : 
                  i % 3 === 1 ? 'w-1.5 h-1.5 bg-yellow-300/30' : 
                  'w-2 h-2 bg-pink-300/20'
                }`}
                style={position}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 4 + (i % 4) * 2,
                  repeat: Infinity,
                  delay: (i % 5) * 0.8,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
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
              className="p-4 sm:p-5 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-3xl shadow-2xl"
            >
              <Crown className="text-white" size={28} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-yellow-400 via-pink-300 to-purple-300 bg-clip-text text-transparent text-center">
              {title}
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="p-4 sm:p-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl shadow-2xl"
            >
              <Flame className="text-white" size={28} />
            </motion.div>
          </div>
          <p className="text-purple-100 text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed mb-8 px-4">
            {subtitle}
          </p>
          
          {/* Enhanced Countdown Timer */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 bg-gradient-to-r from-pink-500/30 to-purple-500/30 backdrop-blur-md border border-pink-400/40 px-6 sm:px-8 lg:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <Timer size={20} className="text-pink-300" />
              <span className="text-base sm:text-lg lg:text-xl font-bold text-pink-100">Limited Time Only</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </motion.div>

          {/* Enhanced Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-10">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">{products.length}</div>
              <div className="text-sm sm:text-base text-purple-200 font-medium">Exclusive Items</div>
            </motion.div>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-purple-400/50 to-pink-400/50"></div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-400 to-pink-500 bg-clip-text text-transparent">24h</div>
              <div className="text-sm sm:text-base text-purple-200 font-medium">Left to Order</div>
            </motion.div>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-purple-400/50 to-pink-400/50"></div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">5★</div>
              <div className="text-sm sm:text-base text-purple-200 font-medium">Premium Quality</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Products Grid - Consistent with other sections */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {products.map((product, index) => (
            <div key={product._id} className="relative group h-full">
              <ProductCard
                product={product}
                variant="limited-edition"
                className="h-full"
              />
              
              {/* Limited Edition Badge */}
              <motion.div
                className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-2xl"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
              >
                LIMITED
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Enhanced View All Button */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16"
          >
            <Link href="/products/limited-edition">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 text-white px-10 py-5 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold text-lg group"
                >
                  <Crown size={24} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                  Explore All Limited Editions
                  <motion.div
                    className="ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </Button>
              </motion.div>
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
              <Crown size={80} className="mx-auto text-purple-300 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-purple-100 mb-4">No Limited Edition Items</h3>
            <p className="text-purple-200 text-lg">Check back soon for exclusive limited edition releases!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
