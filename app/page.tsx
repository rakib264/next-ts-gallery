'use client';

import BestSellingProducts from '@/components/home/BestSellingProducts';
import CategorySection from '@/components/home/CategorySection';
import DealsSection from '@/components/home/DealsSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import HeroCarousel from '@/components/home/HeroCarousel';
import HeroPromo from '@/components/home/HeroPromo';
import LimitedEdition from '@/components/home/LimitedEdition';
import NewArrivals from '@/components/home/NewArrivals';
import Newsletter from '@/components/home/Newsletter';
import SocialProof from '@/components/home/SocialProof';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ClientOnly from '@/components/providers/ClientOnly';
import SeoOptimizer from '@/components/seo/SeoOptimizer';
import FloatingButtons from '@/components/ui/FloatingButtons';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Email system deployment trigger - v1.0.1

  useEffect(() => {
    setMounted(true);
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!mounted || !isClient) return;
    
    // Dynamically import GSAP and ScrollTrigger only after component is fully mounted
    const initGSAP = async () => {
      if (typeof window !== 'undefined') {
        try {
          const GSAP = await import('gsap');
          const ST = await import('gsap/ScrollTrigger');
          
          const gsap = GSAP.gsap;
          const ScrollTrigger = ST.ScrollTrigger;
          
          gsap.registerPlugin(ScrollTrigger);
          
          const ctx = gsap.context(() => {
            // Only animate scroll reveal elements, not page-load elements (handled by Framer Motion)
            const scrollRevealElements = document.querySelectorAll('.scroll-reveal');

            if (scrollRevealElements.length > 0) {
              gsap.utils.toArray('.scroll-reveal').forEach((element: any, index) => {
                gsap.fromTo(element, 
                  {
                    y: 100,
                    opacity: 0,
                  },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: index * 0.1,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: element,
                      start: 'top 80%',
                      end: 'bottom 20%',
                      toggleActions: 'play none none reverse',
                    },
                  }
                );
              });
            }
          }, containerRef);

          return () => ctx.revert();
        } catch (error) {
          console.warn('GSAP initialization failed:', error);
        }
      }
    };

    // Delay GSAP initialization to ensure DOM is ready and Framer Motion has completed
    const timeoutId = setTimeout(initGSAP, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [mounted, isClient]);

  return (
    <>
      <SeoOptimizer pageType="home" />
      
      <div ref={containerRef} className="min-h-screen bg-white">
        <ClientOnly>
          <Header />
        </ClientOnly>
      
      <main className="mb-0">
        {/* Hero Carousel section with simple fade-in, no GSAP conflict */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          suppressHydrationWarning
        >
          <HeroCarousel />
        </motion.div>

                {/* Category Section */}
                <div className="scroll-reveal" suppressHydrationWarning>
          <CategorySection />
        </div>

        {/* Hero Promo Section */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <HeroPromo />
        </div>

                {/* Deals Section - Events Carousel */}
                <div className="scroll-reveal" suppressHydrationWarning>
          <DealsSection />
        </div>
        
        {/* Featured Products - Horizontal Carousel */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <FeaturedProducts />
        </div>
        
        {/* New Arrivals - Grid Layout */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <NewArrivals />
        </div>
        
        {/* Best Selling Products - Grid Layout */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <BestSellingProducts />
        </div>
        
        {/* Limited Edition - Horizontal Carousel */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <LimitedEdition />
        </div>

        {/* Brand Story Section */}
        {/* <div className="scroll-reveal" suppressHydrationWarning>
          <BrandStory />
        </div> */}

        {/* Social Proof Section */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <SocialProof />
        </div>
        
        {/* Newsletter Section */}
        <div className="scroll-reveal" suppressHydrationWarning>
          <Newsletter />
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
      
      {/* Floating Buttons */}
      <ClientOnly>
        <FloatingButtons />
      </ClientOnly>
      </div>
    </>
  );
}