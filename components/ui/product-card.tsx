'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { formatBDTCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Heart, ShoppingBasket, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  thumbnailImage: string;
  averageRating?: number;
  totalReviews?: number;
  totalSales?: number;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isLimitedEdition?: boolean;
  quantity?: number;
  category?: {
    name: string;
    slug: string;
  };
  tags?: string[];
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'featured' | 'best-selling' | 'new-arrival' | 'limited-edition' | 'standard';
  showQuickActions?: boolean;
  className?: string;
}

export default function ProductCard({ 
  product, 
  variant = 'default', 
  showQuickActions = true,
  className = '' 
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { items: wishlistItems } = useSelector((state: any) => state.wishlist);
  const { items: cartItems } = useSelector((state: any) => state.cart);

  const isInWishlist = wishlistItems.some((item: any) => item.id === product._id);
  const isInCart = cartItems.some((item: any) => item.id === product._id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      dispatch(addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.thumbnailImage,
        quantity: 1,
        maxQuantity: product?.quantity ?? 0
      }));
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isInWishlist) {
        dispatch(removeFromWishlist(product._id));
        toast({
          title: "Removed from wishlist",
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        dispatch(addToWishlist({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.thumbnailImage,
          comparePrice: product.comparePrice,
          inStock: (product?.quantity ?? 0) > 0
        }));
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate discount percentage only if comparePrice exists and is greater than price
  const getDiscountPercentage = (): number | null => {
    if (!product.comparePrice || product.comparePrice <= product.price) {
      return null;
    }
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  };

  const discountPercentage = getDiscountPercentage();

  // Get variant-specific styles - simplified for minimal design
  const getVariantStyles = () => {
    switch (variant) {
      case 'featured':
        return {
          cardClass: 'border border-primary-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'best-selling':
        return {
          cardClass: 'border border-orange-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'new-arrival':
        return {
          cardClass: 'border border-green-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'limited-edition':
        return {
          cardClass: 'border border-purple-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      case 'standard':
        return {
          cardClass: 'border border-gray-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
      default:
        return {
          cardClass: 'border border-gray-200/30 bg-white shadow-sm hover:shadow-md transition-all duration-300',
        };
    }
  };

  const { cardClass } = getVariantStyles();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group relative h-full ${className}`}
    >
      <Card className={`${cardClass} overflow-hidden h-full flex flex-col`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Image Container - Responsive Height with proper spacing */}
          <div className="relative h-40 xs:h-44 sm:h-48 md:h-52 lg:h-56 xl:h-60 overflow-hidden bg-white p-2">
            <Link href={`/products/${product.slug}`} className="block h-full">
              <Image
                src={product.thumbnailImage}
                alt={product.name}
                fill
                className="object-contain transition-all duration-300 group-hover:scale-105"
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </Link>
            
            {/* Discount Badge - Only show if there's a discount */}
            {discountPercentage && discountPercentage > 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 font-bold shadow-sm">
                -{discountPercentage}%
              </Badge>
            )}

            {/* Quick Actions - Always visible, minimal design */}
            {showQuickActions && (
              <div className="absolute top-2 left-2 flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-6 w-6 p-0 bg-white/90 hover:bg-white shadow-sm rounded-full"
                  onClick={handleWishlistToggle}
                  disabled={isLoading}
                >
                  <Heart 
                    className={`h-3 w-3 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                  />
                </Button>
              </div>
            )}
          </div>

          {/* Product Info - Responsive Padding */}
          <div className="p-2 xs:p-3 sm:p-4 flex-1 flex flex-col">
            {/* Category - Responsive Text */}
            {product.category && (
              <p className="text-xs xs:text-xs sm:text-sm text-gray-500 mb-1 xs:mb-1.5 sm:mb-2 font-medium uppercase tracking-wide line-clamp-1">
                {product.category.name}
              </p>
            )}

            {/* Product Name - Responsive Text */}
            <Link href={`/products/${product.slug}`} className="block flex-1">
              <h3 className="font-semibold text-xs xs:text-sm sm:text-base lg:text-lg text-gray-900 mb-2 xs:mb-2 sm:mb-3 line-clamp-2 leading-tight hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Rating - Responsive Size */}
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 mb-2 xs:mb-2 sm:mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 ${
                      i < Math.floor(product?.averageRating || 0)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {/* {product?.totalReviews && product?.totalReviews > 0 && (
                <span className="text-xs text-gray-500">
                  ({product.totalReviews})
                </span>
              )} */}
            </div>

            {/* Price and Add Button - Responsive Layout */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col xs:flex-row xs:items-center xs:gap-1 sm:gap-2 flex-1 min-w-0">
                <span className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-primary-600">
                  {formatBDTCurrency(product.price)}
                </span>
                {/* {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xs xs:text-sm text-gray-500 line-through">
                    {formatBDTCurrency(product.comparePrice)}
                  </span>
                )} */}
              </div>
              
              {/* Add Button - Responsive Size */}
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 text-xs xs:text-xs sm:text-sm font-semibold rounded-md shadow-sm flex-shrink-0"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingBasket className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}