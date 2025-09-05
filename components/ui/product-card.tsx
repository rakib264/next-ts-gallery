'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatBDTCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingCart, Star } from 'lucide-react';
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
    if (!product.comparePrice) return 0;
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          cardClass: 'bg-white shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-blue-500'
        };
      case 'new-arrival':
        return {
          cardClass: 'bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-gradient-to-r from-blue-500 to-purple-500'
        };
      case 'best-selling':
        return {
          cardClass: 'bg-white shadow-lg hover:shadow-2xl',
          badgeClass: 'bg-green-500'
        };
      case 'limited-edition':
        return {
          cardClass: 'bg-white shadow-2xl hover:shadow-3xl transform-gpu',
          badgeClass: 'bg-gradient-to-r from-purple-600 to-pink-600'
        };
      default:
        return {
          cardClass: 'bg-white shadow-lg hover:shadow-xl',
          badgeClass: 'bg-primary'
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
      <Card className={`border-0 transition-all duration-300 overflow-hidden ${cardClass}`}>
        <div className="relative overflow-hidden">
          <Link href={`/products/${product.slug}`}>
            <img
              src={product.thumbnailImage}
              alt={product.name}
              className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          
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
          {product.comparePrice && (
            <Badge className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-red-500 text-white text-xs px-2 py-1">
              {getDiscountPercentage()}% OFF
            </Badge>
          )}

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="p-2 rounded-full"
                  onClick={handleWishlistToggle}
                >
                  <Heart 
                    size={16} 
                    className={wishlistItems.some(item => item.id === product._id) ? 'fill-current text-red-500' : ''} 
                  />
                </Button>
                <Link href={`/products/${product.slug}`}>
                  <Button size="sm" variant="secondary" className="p-2 rounded-full">
                    <Eye size={16} />
                  </Button>
                </Link>
                <Button 
                  size="sm"
                  onClick={handleAddToCart}
                  className="px-3 sm:px-4 hidden sm:flex"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="sm"
                  onClick={handleAddToCart}
                  className="p-2 sm:hidden"
                >
                  <ShoppingCart size={16} />
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
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.totalReviews || 0})
            </span>
          </div>
          
          {/* Product Name */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-sm sm:text-lg font-bold text-primary">
                {formatBDTCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {formatBDTCurrency(product.comparePrice)}
                </span>
              )}
            </div>
            
            {/* Mobile Add to Cart */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleAddToCart}
              className="p-1 h-8 w-8 sm:hidden"
            >
              <ShoppingCart size={14} />
            </Button>

            {/* Desktop Quick Add */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddToCart}
              className="opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
            >
              <ShoppingCart size={14} />
            </Button>
          </div>

          {/* Additional Info for specific variants */}
          {variant === 'best-selling' && product.totalSales && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <span>{product.totalSales} sold</span>
            </div>
          )}

          {variant === 'limited-edition' && product.quantity && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-600">Stock</span>
                <span className="text-xs text-red-600">{product.quantity} left</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-red-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(10, Math.min(100, (product.quantity / 50) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
