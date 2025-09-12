'use client';

import { Button } from '@/components/ui/button';
import ProductCard, { Product } from '@/components/ui/product-card';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Crown, Flame, Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  const x = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 30 });

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

  const getItemWidth = () => {
    if (typeof window === 'undefined') return 300;
    if (window.innerWidth < 768) return window.innerWidth * 0.8;
    if (window.innerWidth < 1024) return window.innerWidth * 0.45;
    return window.innerWidth * 0.32;
  };

  const maxIndex = Math.max(0, products.length - Math.floor(3.2));

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
      {/* Premium Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-40 h-40 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-yellow-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => {
            // Use fixed positions to avoid hydration mismatch
            const positions = [
              { left: '5%', top: '10%' }, { left: '15%', top: '30%' }, { left: '25%', top: '50%' },
              { left: '35%', top: '70%' }, { left: '45%', top: '20%' }, { left: '55%', top: '80%' },
              { left: '65%', top: '40%' }, { left: '75%', top: '60%' }, { left: '85%', top: '15%' },
              { left: '95%', top: '35%' }, { left: '10%', top: '60%' }, { left: '20%', top: '80%' },
              { left: '30%', top: '25%' }, { left: '40%', top: '75%' }, { left: '50%', top: '45%' },
              { left: '60%', top: '65%' }, { left: '70%', top: '5%' }, { left: '80%', top: '85%' },
              { left: '90%', top: '55%' }, { left: '12%', top: '90%' }
            ];
            const position = positions[i] || { left: '50%', top: '50%' };
            
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/30 rounded-full"
                style={position}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
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
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-2xl sm:rounded-3xl shadow-2xl"
            >
              <Crown className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-pink-300 to-purple-300 bg-clip-text text-transparent text-center">
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
              className="p-3 sm:p-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl sm:rounded-3xl shadow-2xl"
            >
              <Flame className="text-white" size={24} />
            </motion.div>
          </div>
          <p className="text-purple-100 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            {subtitle}
          </p>
          
          {/* Countdown Timer */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-400/30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-pink-300" />
              <span className="text-sm sm:text-base lg:text-lg font-semibold text-pink-100">Limited Time Only</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-400 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">{products.length}</div>
              <div className="text-xs sm:text-sm text-purple-200">Exclusive Items</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-purple-400/50"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-pink-400">24h</div>
              <div className="text-xs sm:text-sm text-purple-200">Left to Order</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-purple-400/50"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">5★</div>
              <div className="text-xs sm:text-sm text-purple-200">Premium Quality</div>
            </div>
          </div>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <motion.button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft size={24} className="text-white" />
          </motion.button>

          <motion.button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full shadow-2xl border border-white/20 flex items-center justify-center hover:bg-white/20 hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight size={24} className="text-white" />
          </motion.button>

          {/* Carousel */}
          <div className="overflow-hidden rounded-3xl">
            <motion.div
              ref={carouselRef}
              className="flex gap-6 py-4"
              style={{ x: springX }}
              drag="x"
              dragConstraints={{ left: -(products.length * getItemWidth()), right: 0 }}
              onDragStart={handleDragStart}
              onDrag={handleDragMove}
              onDragEnd={handleDragEnd}
              dragElastic={0.1}
              dragMomentum={false}
            >
              {products.map((product, index) => (
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
                    y: -12,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="relative group">
                    <ProductCard
                      product={product}
                      index={index}
                      variant="limited-edition"
                      className="h-full"
                    />
                    
                    {/* Center Card Highlight */}
                    {index === currentIndex && (
                      <motion.div
                        className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-r from-yellow-400/20 to-pink-400/20 border-2 border-yellow-400/50 pointer-events-none shadow-2xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    {/* Limited Edition Badge */}
                    <motion.div
                      className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      LIMITED
                    </motion.div>
                  </div>
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
                    ? 'bg-yellow-400 w-8 shadow-lg' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* View All Button */}
        {products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Link href="/products/limited-edition">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-pink-400 hover:from-yellow-500 hover:to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 font-bold text-lg"
              >
                <Crown size={20} className="mr-3" />
                Explore All Limited Editions
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
