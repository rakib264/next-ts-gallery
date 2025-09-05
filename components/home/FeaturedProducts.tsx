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
        const res = await fetch('/api/products?featured=true&limit=8&sortBy=createdAt&sortOrder=desc');
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

  return (
    <section className="py-12 lg:py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 lg:mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Featured Products
            </h2>
          </div>
          <p className="text-muted-foreground text-base lg:text-lg max-w-2xl mx-auto">
            Discover our handpicked selection of premium products with the latest technology 
            and exceptional quality.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {loading && [...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse bg-muted/30 h-64 sm:h-80 rounded-lg" />
          ))}
          {!loading && items.map((product, index) => (
            <ProductCard
              key={product._id}
              product={product}
              index={index}
              variant="featured"
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8 lg:mt-12"
        >
          <Link href="/products/featured">
            <Button size="lg" variant="outline" className="px-6 lg:px-8">
              <Sparkles size={16} className="mr-2" />
              View All Featured Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}