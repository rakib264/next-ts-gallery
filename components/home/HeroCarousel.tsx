'use client';

import { Button } from '@/components/ui/button';
import CarouselSkeleton, { CarouselBackgroundSkeleton } from '@/components/ui/carousel-skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CTAButton {
  label: string;
  url: string;
}

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: string;
  image: string;
  ctaButtons?: CTAButton[];
  // Legacy fields for backward compatibility
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  isActive: boolean;
  order: number;
}


export default function HeroCarousel() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchBanners();
  }, []);

  useEffect(() => {
    if (!mounted || !isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [mounted, banners.length, isAutoPlaying]);

  const fetchBanners = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/banners?limit=10');
      if (response.ok) {
        const data = await response.json();
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
          // Minimal loading time for smooth experience
          setTimeout(() => {
            setIsLoading(false);
          }, 800);
        } else {
          // Quick loading even if no data
          setTimeout(() => {
            setIsLoading(false);
          }, 600);
        }
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      setTimeout(() => {
        setIsLoading(false);
      }, 600);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const handleCTAClick = (ctaButton?: CTAButton) => {
    const currentBanner = banners[currentSlide];
    
    if (ctaButton) {
      router.push(ctaButton.url);
    } else if (currentBanner.ctaButtons && currentBanner.ctaButtons.length > 0) {
      router.push(currentBanner.ctaButtons[0].url);
    } else if (currentBanner.ctaButtonUrl) {
      router.push(currentBanner.ctaButtonUrl);
    } else {
      router.push('/products');
    }
  };

  // Helper function to get effective CTA buttons (with fallback support)
  const getEffectiveCTAButtons = (banner: Banner): CTAButton[] => {
    if (banner.ctaButtons && banner.ctaButtons.length > 0) {
      return banner.ctaButtons;
    }
    
    // Fallback to legacy fields
    if (banner.ctaButtonLabel) {
      return [{ label: banner.ctaButtonLabel, url: banner.ctaButtonUrl || '/products' }];
    }
    
    return [{ label: 'Shop Now', url: '/products' }];
  };

  const currentBanner = banners[currentSlide];

  // Show loading skeleton while data is being fetched
  if (!mounted || isLoading) {
    return (
      <section className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900" style={{ marginTop: '-64px', paddingTop: '64px' }}>
        {/* Background Skeleton */}
        <CarouselBackgroundSkeleton />
        
        {/* Content Container with Skeleton */}
        <div className="relative z-30 h-full flex flex-col justify-end md:justify-center">
          {/* Mobile Skeleton */}
          <div className="md:hidden px-4 pb-24 pt-8">
            <CarouselSkeleton variant="mobile" />
          </div>

          {/* Desktop Skeleton */}
          <div className="hidden md:block">
            <div className="container mx-auto px-8 lg:px-12">
              <div className="max-w-2xl">
                <CarouselSkeleton variant="desktop" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state only if no banners are available after loading
  if (banners.length === 0) {
    return (
      <section className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900 flex items-center justify-center" style={{ marginTop: '-64px', paddingTop: '64px' }}>
        <div className="text-white text-center">
          <h1 className="text-4xl font-light">No banners available</h1>
        </div>
      </section>
    );
  }

  return (
    <motion.section 
      className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden bg-gray-900" 
      style={{ marginTop: '-64px', paddingTop: '64px' }}
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      {/* Background Images with Ken Burns effect */}
      {mounted && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { duration: 1.5, ease: "easeOut" }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              transition: { duration: 1, ease: "easeIn" }
            }}
            className="absolute inset-0"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentBanner.image})`
              }}
            />
          </motion.div>
        </AnimatePresence>
      )}
      

      {/* Sophisticated Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />
      </div>

      {/* Content Container - Fashion-focused positioning */}
      <div className="relative z-30 h-full flex flex-col justify-end md:justify-center">
        {/* Mobile: Bottom positioned content */}
        <div className="md:hidden px-4 pb-24 pt-8">
          {mounted ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-4"
              >
                {/* Mobile Subtitle */}
                {currentBanner.subtitle && (
                  <motion.div 
                    className="flex items-center justify-center space-x-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/60" />
                    <span className="text-white/90 font-light text-xs uppercase tracking-[3px]">
                      {currentBanner.subtitle}
                    </span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/60" />
                  </motion.div>
                )}
                
                {/* Mobile Title */}
                <motion.h1 
                  className="text-3xl sm:text-4xl font-light text-white leading-tight tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentBanner.title}
                </motion.h1>

                {/* Mobile Accent Line */}
                <motion.div 
                  className="flex justify-center"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <div className="h-0.5 w-16 bg-gradient-to-r from-white to-white/40" />
                </motion.div>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-4"
                >
                  {(() => {
                    const ctaButtons = getEffectiveCTAButtons(currentBanner);
                    return (
                      <Button 
                        onClick={() => handleCTAClick(ctaButtons[0])}
                        size="lg"
                        className="bg-white text-black hover:bg-white/90 px-6 sm:px-8 py-3 text-sm font-medium tracking-wide uppercase transition-all duration-300 group border-0"
                      >
                        {ctaButtons[0].label}
                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    );
                  })()}
                </motion.div>

                {/* Mobile Quality Indicators */}
                {/* <motion.div 
                  className="flex justify-center items-center space-x-4 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-white/70 text-xs tracking-wide">Premium Quality</span>
                </motion.div> */}
              </motion.div>
            </AnimatePresence>
          ) : (
            // Mobile Loading State
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/60" />
                <span className="text-white/90 font-light text-xs uppercase tracking-[3px]">
                  Loading...
                </span>
                <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/60" />
              </div>
              <h1 className="text-4xl font-light text-white leading-tight tracking-wide">
                Loading...
              </h1>
              <div className="flex justify-center">
                <div className="h-0.5 w-16 bg-gradient-to-r from-white to-white/40" />
              </div>
              <div className="pt-4">
                <button className="bg-white text-black hover:bg-white/90 px-8 py-3 text-sm font-medium tracking-wide uppercase" disabled>
                  Loading...
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Left-aligned content */}
        <div className="hidden md:block">
          <div className="container mx-auto px-8 lg:px-12">
            <div className="max-w-2xl">
              {mounted ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="space-y-8"
                  >
                    {/* Desktop Subtitle */}
                    {currentBanner.subtitle && (
                      <motion.div 
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Sparkles className="text-yellow-400 w-5 h-5" />
                        <span className="text-white/90 font-light text-sm uppercase tracking-[2px] border-l border-white/30 pl-3">
                          {currentBanner.subtitle}
                        </span>
                      </motion.div>
                    )}
                    
                    {/* Desktop Title */}
                    <motion.h1 
                      className="text-6xl lg:text-7xl xl:text-8xl font-thin text-white leading-tight tracking-tight"
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {currentBanner.title}
                    </motion.h1>

                    {/* Desktop Description */}
                    {currentBanner.description && (
                      <motion.p 
                        className="text-lg text-white/80 font-light leading-relaxed max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        {currentBanner.description}
                      </motion.p>
                    )}

                    {/* Desktop CTAs */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-6"
                    >
                      {(() => {
                        const ctaButtons = getEffectiveCTAButtons(currentBanner);
                        return (
                          <>
                            <Button 
                              onClick={() => handleCTAClick(ctaButtons[0])}
                              size="lg"
                              className="bg-white text-black hover:bg-white/90 px-10 py-4 text-base font-medium tracking-wide uppercase transition-all duration-300 group border-0"
                            >
                              {ctaButtons[0].label}
                              <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            
                            {ctaButtons.length > 1 && (
                              <button 
                                onClick={() => handleCTAClick(ctaButtons[1])}
                                className="text-white border-b border-white/40 hover:border-white pb-1 text-sm uppercase tracking-wide transition-all duration-300"
                              >
                                {ctaButtons[1].label}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </motion.div>

                    {/* Desktop Quality Badge */}
                    <motion.div 
                      className="flex items-center space-x-4 pt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-white/70 text-sm tracking-wide">Trusted by 50,000+ customers</span>
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                // Desktop Loading State
                <div className="space-y-8">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="text-yellow-400 w-5 h-5" />
                    <span className="text-white/90 font-light text-sm uppercase tracking-[2px] border-l border-white/30 pl-3">
                      Loading...
                    </span>
                  </div>
                  <h1 className="text-6xl lg:text-7xl xl:text-8xl font-thin text-white leading-tight tracking-tight">
                    Loading...
                  </h1>
                  <p className="text-lg text-white/80 font-light leading-relaxed max-w-md">
                    Please wait while we load the latest banners...
                  </p>
                  <div className="flex items-center space-x-6">
                    <button className="bg-white text-black hover:bg-white/90 px-10 py-4 text-base font-medium tracking-wide uppercase" disabled>
                      Loading...
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Refined Design */}
      {mounted && banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-40 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            <ChevronLeft size={20} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextSlide}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-40 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full backdrop-blur-sm transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            <ChevronRight size={20} />
          </Button>

          {/* Elegant Slide Indicators */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-40 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-500 ${
                  index === currentSlide 
                    ? 'w-6 sm:w-8 h-1 bg-white' 
                    : 'w-4 sm:w-6 h-1 bg-white/40 hover:bg-white/60'
                } rounded-full`}
              />
            ))}
          </div>
        </>
      )}

      {/* Dynamic Discount Badge */}
      {currentBanner.discount && (
        <div className="absolute top-20 sm:top-6 right-2 sm:right-6 z-40">
          <motion.div 
            className="bg-yellow-400 text-black px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
          >
            ⭐ {currentBanner.discount}
          </motion.div>
        </div>
      )}
    </motion.section>
  );
}