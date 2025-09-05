'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
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



  return (
    <section className={`py-12 lg:py-20 bg-gradient-to-br from-gray-50 to-white ${className}`}>
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
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{title}</h2>
          </div>
          <p className="text-gray-600 text-base lg:text-lg max-w-2xl mx-auto">{subtitle}</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>{total} products found</span>
            <span>•</span>
            <span>Sorted by sales</span>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
          {loading && [...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse bg-gray-200 h-64 sm:h-80 rounded-lg" />
          ))}
          {!loading && products.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              variant="best-selling"
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
            <Link href="/products/best-selling">
              <Button size="lg" variant="outline" className="px-6 lg:px-8">
                <TrendingUp size={16} className="mr-2" />
                View All Best Sellers
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
            <TrendingUp size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Best Selling Products Found</h3>
            <p className="text-gray-500">Check back later for our most popular items.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
