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
  limit = 6,
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



  return (
    <section className={`py-12 lg:py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white relative overflow-hidden ${className}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-300 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
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
              <Crown className="text-yellow-400" size={28} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              {title}
            </h2>
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
              <Flame className="text-orange-400" size={28} />
            </motion.div>
          </div>
          <p className="text-purple-100 text-base lg:text-lg max-w-2xl mx-auto">{subtitle}</p>
          
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-3 rounded-full shadow-lg"
          >
            <Timer size={16} />
            <span className="text-sm font-medium">Limited Time Only</span>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 lg:mb-12">
          {loading && [...Array(6)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white/20 h-72 sm:h-96 rounded-lg" />
          ))}
          {!loading && products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              variant="limited-edition"
            />
          ))}
        </div>

        {/* View All Button */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/products/limited-edition">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-400">
                <Crown size={16} className="mr-2" />
                Explore All Limited Editions
                <ArrowRight size={16} className="ml-2" />
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
            className="text-center py-12"
          >
            <Crown size={64} className="mx-auto text-purple-300 mb-4" />
            <h3 className="text-xl font-semibold text-purple-100 mb-2">No Limited Edition Items</h3>
            <p className="text-purple-200">Check back soon for exclusive limited edition releases!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
