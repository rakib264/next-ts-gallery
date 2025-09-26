'use client';

import ClientOnly from '@/components/providers/ClientOnly';
import SeoOptimizer from '@/components/seo/SeoOptimizer';
import FloatingButtons from '@/components/ui/FloatingButtons';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
const HeroCarousel = dynamic(() => import('@/components/home/HeroCarousel'), { ssr: false });
const CategorySection = dynamic(() => import('@/components/home/CategorySection'), { ssr: false });
const HeroPromo = dynamic(() => import('@/components/home/HeroPromo'), { ssr: false });
const DealsSection = dynamic(() => import('@/components/home/DealsSection'), { ssr: false });
const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'), { ssr: false });
const NewArrivals = dynamic(() => import('@/components/home/NewArrivals'), { ssr: false });
const BestSellingProducts = dynamic(() => import('@/components/home/BestSellingProducts'), { ssr: false });
const LimitedEdition = dynamic(() => import('@/components/home/LimitedEdition'), { ssr: false });
const SocialProof = dynamic(() => import('@/components/home/SocialProof'), { ssr: false });
const Newsletter = dynamic(() => import('@/components/home/Newsletter'), { ssr: false });
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false });
const MobileBottomNav = dynamic(() => import('@/components/layout/MobileBottomNav'), { ssr: false });

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
          // Respect reduced motion and skip on small screens for perf
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          const isSmallScreen = window.innerWidth < 768;
          if (prefersReducedMotion || isSmallScreen) return;

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
    const timeoutId = setTimeout(initGSAP, 1200);
    
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
                <DealsSection />
        
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
        <LimitedEdition />

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