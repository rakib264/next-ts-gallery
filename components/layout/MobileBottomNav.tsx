'use client';

import HydrationWrapper from '@/components/providers/HydrationWrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleCart, toggleSearch } from '@/lib/store/slices/uiSlice';
import { RootState } from '@/lib/store/store';
import { AnimatePresence, motion } from 'framer-motion';
import { Grid, Home, Package, ShoppingBag, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const navItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    showBadge: false
  },
  {
    id: 'products',
    label: 'Products',
    icon: Grid,
    href: '/products',
    showBadge: false
  },
  {
    id: 'categories',
    label: 'Categories',
    icon: Package,
    href: '/categories',
    showBadge: false
  },
  {
    id: 'cart',
    label: 'Cart',
    icon: ShoppingBag,
    href: '/cart',
    showBadge: true,
    badgeKey: 'cart'
  },
  {
    id: 'account',
    label: 'Account',
    icon: User,
    href: '/auth/signin',
    showBadge: false,
    requiresAuth: true
  }
];

export default function MobileBottomNav() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const { itemCount: cartCount } = useSelector((state: RootState) => state.cart);
  const { itemCount: wishlistCount } = useSelector((state: RootState) => state.wishlist);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavAction = (action?: string) => {
    switch (action) {
      case 'search':
        dispatch(toggleSearch());
        break;
      case 'cart':
        dispatch(toggleCart());
        break;
    }
  };

  const getBadgeCount = (badgeKey: string) => {
    switch (badgeKey) {
      case 'cart':
        return cartCount;
      default:
        return 0;
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <HydrationWrapper
      fallback={
        <div className="h-20 md:hidden" />
      }
    >
      {/* Spacer to prevent content from being hidden behind the bottom nav */}
      <div className="h-20 md:hidden" />
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-gradient-to-t from-slate-900 via-slate-800/95 to-slate-900/90 backdrop-blur-xl border-t border-indigo-500/30 shadow-2xl relative overflow-hidden">
              {/* Background decorative elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-pink-500/10" />
              <div className="absolute -top-10 left-1/4 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl" />
              <div className="absolute -top-10 right-1/4 w-20 h-20 bg-purple-500/20 rounded-full blur-xl" />
              
              <div className="safe-area-inset-bottom relative z-10">
                <div className="flex items-center justify-around px-3 py-3">
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = item.href !== '#' && isActive(item.href);
                    const badgeCount = item.showBadge ? getBadgeCount(item.badgeKey!) : 0;
                    
                    // Handle account navigation based on auth state
                    const isAccountItem = item.id === 'account';
                    const accountHref = isAccountItem ? (session ? '/profile' : '/auth/signin') : item.href;
                    const accountLabel = isAccountItem ? (session ? 'Profile' : 'Sign In') : item.label;
                    
                    // Unified styling for inactive and active states

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: index * 0.1,
                          type: 'spring',
                          stiffness: 200
                        }}
                        className="relative"
                      >
                        <Link href={isAccountItem ? accountHref : item.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex flex-col items-center justify-center p-2 h-auto min-h-[68px] w-16 transition-all duration-300 relative group hover:scale-105"
                          >
                            <div className="relative">
                              <motion.div
                                whileHover={{ scale: 1.1, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                  relative p-3 rounded-xl transition-all duration-300
                                  ${active 
                                    ? 'bg-gradient-to-br from-primary to-secondary shadow-lg border border-white/20' 
                                    : 'bg-white/5 group-hover:bg-white/10 border border-transparent group-hover:border-white/20'
                                  }
                                `}
                              >
                                <Icon 
                                  size={22} 
                                  className={`
                                    transition-all duration-300
                                    ${active ? 'text-white' : 'text-slate-400'}
                                    group-hover:text-slate-200
                                  `} 
                                />
                                
                                {item.showBadge && badgeCount > 0 && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    whileHover={{ scale: 1.1 }}
                                    className="absolute -top-2 -right-2"
                                  >
                                    <Badge 
                                      className="h-6 min-w-[24px] text-xs flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white border-2 border-white/20 shadow-lg shadow-red-500/30"
                                    >
                                      {badgeCount > 99 ? '99+' : badgeCount}
                                    </Badge>
                                  </motion.div>
                                )}
                              </motion.div>
                            </div>
                            <span className={`
                              text-xs mt-2 transition-all duration-300 font-medium
                              ${active 
                                ? 'text-white drop-shadow-sm' 
                                : 'text-slate-400 group-hover:text-slate-200'
                              }
                            `}>
                              {isAccountItem ? accountLabel : item.label}
                            </span>
                            
                            {/* Active indicator */}
                            {active && (
                              <motion.div
                                layoutId="activeIndicator"
                                className={`absolute -top-1 left-0 right-0 mx-auto w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full shadow-md`}
                                transition={{ duration: 0.3, type: 'spring' }}
                              />
                            )}
                            
                            {/* Hover glow effect */}
                            <motion.div
                              className={`
                                absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                                bg-gradient-to-t from-white/5 to-transparent
                              `}
                            />
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  }                  )}
                </div>
                
                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </HydrationWrapper>
  );
}
