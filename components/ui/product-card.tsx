'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatBDTCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating: number;
  totalReviews: number;
  quantity?: number;
  totalSales?: number;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'featured' | 'new-arrival' | 'best-selling' | 'limited-edition';
  showQuickActions?: boolean;
  showBadges?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  index = 0,
  variant = 'default',
  showQuickActions = true,
  showBadges = true,
  className = ''
}: ProductCardProps) {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.thumbnailImage,
      maxQuantity: product.quantity ?? 99
    }));
  };

  const handleWishlistToggle = () => {
    const isInWishlist = wishlistItems.some(item => item.id === product._id);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(product._id));
    } else {
      dispatch(addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        comparePrice: product.comparePrice,
        inStock: (product.quantity ?? 0) > 0
      }));
    }
  };

  const getDiscountPercentage = () => {
    if (!product.comparePrice || product.comparePrice <= 0) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          cardClass: 'bg-card shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-info'
        };
      case 'new-arrival':
        return {
          cardClass: 'bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-gradient-to-r from-primary-600 to-secondary-600'
        };
      case 'best-selling':
        return {
          cardClass: 'bg-card shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-success'
        };
      case 'limited-edition':
        return {
          cardClass: 'bg-card shadow-2xl hover:shadow-3xl transform-gpu',
          badgeClass: 'bg-gradient-to-r from-secondary-600 to-primary-600'
        };
      default:
        return {
          cardClass: 'bg-card shadow-lg hover:shadow-xl',
          badgeClass: 'bg-primary-600'
        };
    }
  };

  const { cardClass, badgeClass } = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`group ${className}`}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <Card className={`border-0 transition-all duration-300 overflow-hidden ${cardClass} cursor-pointer group-hover:shadow-2xl`}>
          <div className="relative overflow-hidden">
            <img
              src={product.thumbnailImage}
              alt={product.name}
              className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Badges */}
            {showBadges && (
              <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-col gap-1 sm:gap-2">
                {variant === 'new-arrival' && (
                  <Badge className={`${badgeClass} text-white text-xs px-2 py-1 shadow-lg`}>
                    NEW
                  </Badge>
                )}
                {variant === 'limited-edition' && (
                  <Badge className={`${badgeClass} text-white text-xs px-2 py-1 shadow-lg border border-purple-400`}>
                    EXCLUSIVE
                  </Badge>
                )}
                {variant === 'best-selling' && (
                  <Badge className={`${badgeClass} text-white text-xs px-2 py-1 shadow-lg`}>
                    BESTSELLER
                  </Badge>
                )}
                {variant === 'featured' && (
                  <Badge className={`${badgeClass} text-white text-xs px-2 py-1 shadow-lg`}>
                    FEATURED
                  </Badge>
                )}
              </div>
            )}

            {/* Discount Badge */}
            {product.comparePrice && product.comparePrice > 0 && getDiscountPercentage() > 0 && (
              <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-destructive text-white text-xs px-2 py-1">
                {getDiscountPercentage()}% OFF
              </Badge>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="p-3 rounded-full bg-white/90 hover:bg-white shadow-lg"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleWishlistToggle();
                    }}
                  >
                    <Heart 
                      size={18} 
                      className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : 'text-gray-700'} 
                    />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart();
                    }}
                    className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    <span className="text-sm font-medium">Add to Cart</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <CardContent className="p-3 sm:p-4">
          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-2 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`${
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-warning fill-current'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-900 font-medium">
              ({product.totalReviews || 0} reviews)
            </span>
          </div>
          
          {/* Product Name */}
          <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 flex-1 min-w-0">
              <span className="text-sm sm:text-lg font-bold text-primary-600 truncate">
                {formatBDTCurrency(Number(product.price))}
              </span>
              {product?.comparePrice && product.comparePrice > 0 && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through truncate">
                  {formatBDTCurrency(Number(product.comparePrice))}
                </span>
              )}
            </div>
            
            {/* Mobile Add to Cart */}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              className="p-1 h-8 w-8 sm:hidden hover:bg-primary-50 flex-shrink-0 ml-2"
            >
              <ShoppingCart size={14} />
            </Button>
          </div>

          {/* Additional Info for specific variants */}
          {/* {variant === 'best-selling' && product.totalSales && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <span>{product.totalSales} sold</span>
            </div>
          )} */}

          {variant === 'limited-edition' && product.quantity && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">Stock</span>
                <span className="text-xs text-destructive">{product.quantity} left</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-destructive h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, Math.min(100, (product.quantity / 50) * 100))}%` }}
                />
              </div>
            </div>
          )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}