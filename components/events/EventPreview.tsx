'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { motion } from 'framer-motion';
import { Clock, Heart, Package, ShoppingBasket, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage?: string;
  averageRating?: number;
  totalReviews?: number;
}

interface EventPreviewProps {
  event: {
    _id: string;
    title: string;
    subtitle?: string;
    bannerImage?: string;
    discountText: string;
    startDate: string;
    endDate: string;
    products: Product[];
    isActive: boolean;
    status: 'active' | 'upcoming' | 'expired' | 'inactive';
  };
  showProducts?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function EventPreview({ 
  event, 
  showProducts = true, 
  className = "" 
}: EventPreviewProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const targetDate = event.status === 'upcoming' ? 
        new Date(event.startDate).getTime() : 
        new Date(event.endDate).getTime();
      
      const distance = targetDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event.startDate, event.endDate, event.status, mounted]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const calculateDiscount = (price: number, comparePrice?: number) => {
    if (!comparePrice) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const getCountdownLabel = () => {
    switch (event.status) {
      case 'upcoming':
        return 'Starts in';
      case 'active':
        return 'Ends in';
      case 'expired':
        return 'Event ended';
      case 'inactive':
        return 'Event inactive';
      default:
        return 'Event ended';
    }
  };

  const getStatusColor = () => {
    switch (event.status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isCountdownActive = event.status === 'active' || event.status === 'upcoming';

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white"
      >
        {/* Banner Image */}
        {event.bannerImage && (
          <div className="absolute inset-0">
            <Image
              src={event.bannerImage}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              {/* Status Badge */}
              <Badge 
                variant="outline" 
                className={`mb-4 ${getStatusColor()} bg-white/90 text-sm font-medium`}
              >
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>

              {/* Title and Subtitle */}
              <motion.h1 
                className="text-4xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {event.title}
              </motion.h1>
              
              {event.subtitle && (
                <motion.p 
                  className="text-xl md:text-2xl text-white/90 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {event.subtitle}
                </motion.p>
              )}

              {/* Discount Text */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6"
              >
                <Tag size={20} />
                <span className="text-lg font-semibold">{event.discountText}</span>
              </motion.div>

              {/* Product Count */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2 text-white/80"
              >
                <Package size={18} />
                <span>{event.products.length} products in this event</span>
              </motion.div>
            </div>

            {/* Countdown Timer */}
            {isCountdownActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[280px]"
              >
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Clock size={20} />
                  <span className="text-lg font-medium">{getCountdownLabel()}</span>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: timeLeft.days, label: 'Days' },
                    { value: timeLeft.hours, label: 'Hours' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Sec' }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-white/20 rounded-lg p-3 mb-1">
                        <span className="text-2xl font-bold">
                          {String(item.value).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-xs text-white/80">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {showProducts && event.products.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Featured Products</h2>
            <Badge variant="outline" className="text-sm">
              {event.products.length} products
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {event.products.slice(0, 8).map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <Link href={`/products/${product.slug}`}>
                      <div className="w-full h-40 md:h-64 relative">
                        {product.thumbnailImage ? (
                          <Image
                            src={product.thumbnailImage}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/30">
                            <Package size={48} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {product.comparePrice && (
                      <Badge className="absolute top-3 right-3 bg-red-500">
                        {calculateDiscount(product.price, product.comparePrice)}% OFF
                      </Badge>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="p-2"
                        onClick={() => {
                          const isInWishlist = wishlistItems.some((item: any) => item.id === product._id);
                          if (isInWishlist) {
                            dispatch(removeFromWishlist(product._id));
                          } else {
                            dispatch(addToWishlist({
                              id: product._id,
                              name: product.name,
                              price: product.price,
                              image: product.thumbnailImage,
                              comparePrice: product.comparePrice,
                              inStock: true
                            }));
                          }
                        }}
                      >
                        <Heart size={14} className={wishlistItems.some((item: any) => item.id === product._id) ? 'fill-current text-red-500' : ''} />
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => dispatch(addToCart({ id: product._id, name: product.name, price: product.price, quantity: 1, image: product.thumbnailImage, maxQuantity: 99 }))}
                        className="px-4"
                      >
                        <ShoppingBasket size={14} className="mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < Math.floor(product.averageRating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground ml-2">({product.totalReviews || 0})</span>
                    </div>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-sm md:text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-base md:text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.comparePrice && (
                          <span className="text-xs md:text-sm text-muted-foreground line-through">
                            {formatPrice(product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Show More Button */}
          {event.products.length > 8 && (
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                View All {event.products.length} Products
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
