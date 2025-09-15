'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function FeaturedProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/products?featured=true&limit=12&sortBy=createdAt&sortOrder=desc');
        const data = await res.json();
        if (res.ok) setItems(data.products || []);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);


  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="flex gap-6 overflow-hidden">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-200 h-80 w-72 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/20 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-gradient-to-tr from-pink-200/30 to-yellow-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
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
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl shadow-2xl"
            >
              <Sparkles className="text-white" size={32} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent text-center">
              Featured Products
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.5
              }}
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl shadow-2xl"
            >
              <Sparkles className="text-white" size={32} />
            </motion.div>
          </div>
          <p className="text-gray-600 text-lg lg:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            Discover our handpicked selection of premium products with the latest technology 
            and exceptional quality, curated just for you.
          </p>
          
          {/* Enhanced Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-12">
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{items.length}+</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Premium Items</div>
            </motion.div>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-gray-300 to-gray-400"></div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">4.8</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Avg Rating</div>
            </motion.div>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-gray-300 to-gray-400"></div>
            <motion.div 
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">100%</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">Quality</div>
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
          {items.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              variant="featured"
              className="h-full"
            />
          ))}
        </motion.div>

        {/* Enhanced View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <Link href="/products/featured">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold text-lg group"
              >
                <Sparkles size={24} className="mr-3 group-hover:rotate-12 transition-transform duration-300" />
                Explore All Featured Products
                <motion.div
                  className="ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.div>
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}