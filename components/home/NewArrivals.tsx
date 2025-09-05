'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
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



  return (
    <section className={`py-12 lg:py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-primary" size={24} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h2>
          </div>
          <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">{subtitle}</p>
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md"
          >
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Updated Daily</span>
          </motion.div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
          {loading && [...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white/50 h-64 sm:h-80 rounded-lg" />
          ))}
          {!loading && products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              variant="new-arrival"
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
            <Link href="/products/new-arrivals">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                View All New Arrivals
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
            <Sparkles size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No New Arrivals Yet</h3>
            <p className="text-gray-500">Stay tuned for exciting new products coming soon!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
