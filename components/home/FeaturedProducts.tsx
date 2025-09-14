'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function FeaturedProducts() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

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

  const itemsPerView = {
    mobile: 1.2,
    tablet: 2.2,
    desktop: 3.2
  };

  const getItemWidth = () => {
    if (typeof window === 'undefined') return 300;
    if (window.innerWidth < 768) return window.innerWidth * 0.8;
    if (window.innerWidth < 1024) return window.innerWidth * 0.45;
    return window.innerWidth * 0.32;
  };

  const maxIndex = Math.max(0, items.length - Math.floor(itemsPerView.desktop));

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDragStart = (event: any) => {
    setIsDragging(true);
    setDragStart(event.clientX || event.touches?.[0]?.clientX || 0);
  };

  const handleDragMove = (event: any) => {
    if (!isDragging) return;
    const currentX = event.clientX || event.touches?.[0]?.clientX || 0;
    const diff = currentX - dragStart;
    setDragOffset(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = getItemWidth() * 0.3;
    
    if (dragOffset > threshold && currentIndex > 0) {
      prevSlide();
    } else if (dragOffset < -threshold && currentIndex < maxIndex) {
      nextSlide();
    }
    
    setDragOffset(0);
  };

  useEffect(() => {
    const itemWidth = getItemWidth();
    const translateX = -(currentIndex * itemWidth) + dragOffset;
    x.set(translateX);
  }, [currentIndex, dragOffset, x]);

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
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-100/40 to-yellow-100/40 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center gap-3 mb-6">
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
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg"
            >
              <Sparkles className="text-white" size={28} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Featured Products
            </h2>
          </div>
          <p className="text-gray-600 text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Discover our handpicked selection of premium products with the latest technology 
            and exceptional quality, curated just for you.
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{items.length}+</div>
              <div className="text-sm text-gray-500">Premium Items</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-500">Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={20} className="text-gray-700" />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={20} className="text-gray-700" />
          </motion.button>

          {/* Carousel */}
          <div className="overflow-hidden rounded-3xl">
            <motion.div
              ref={carouselRef}
              className="flex gap-6 py-4"
              style={{ x: springX }}
              drag="x"
              dragConstraints={{ left: -(items.length * getItemWidth()), right: 0 }}
              onDragStart={handleDragStart}
              onDrag={handleDragMove}
              onDragEnd={handleDragEnd}
              dragElastic={0.1}
              dragMomentum={false}
            >
              {items.map((product, index) => (
                <motion.div
                  key={product._id}
                  className="flex-shrink-0"
                  style={{ width: getItemWidth() }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                >
                  <ProductCard
                    product={product}
                    index={index}
                    variant="featured"
                    className="h-full"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-blue-500 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/products/featured">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
            >
              <Sparkles size={20} className="mr-3" />
              Explore All Featured Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}