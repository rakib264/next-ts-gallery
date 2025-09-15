'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useHydration } from '@/hooks/use-hydration';
import {
    applyCoupon,
    clearCart,
    reloadCartFromStorage,
    removeCoupon,
    removeFromCart,
    updateQuantity
} from '@/lib/store/slices/cartSlice';
import { addToWishlist, loadWishlistFromStorage } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatNumber } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Heart,
    Minus,
    Package,
    Plus,
    Shield,
    ShoppingBag,
    ShoppingBasket,
    Tag,
    Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function CartPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, total, itemCount, discount, couponCode: appliedCoupon } = useSelector((state: RootState) => state.cart);
  const isHydrated = useHydration();
  
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cart and wishlist from localStorage on mount
    dispatch(reloadCartFromStorage());
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  const handleQuantityChange = (id: string, variant: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart({ id, variant }));
    } else {
      dispatch(updateQuantity({ id, variant, quantity }));
    }
  };

  const handleMoveToWishlist = (item: any) => {
    dispatch(addToWishlist({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      inStock: true
    }));
    dispatch(removeFromCart({ id: item.id, variant: item.variant }));
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setError('');
    
    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(applyCoupon({ code: couponCode, discount: data.discount }));
        setCouponCode('');
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      setError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal - discount;

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16 md:mt-20 mb-20 md:mb-0">
          <div className="animate-pulse space-y-6">
            <div className="space-y-4 mb-8">
              <div className="h-8 w-8 bg-primary-light rounded-lg"></div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary-light rounded-xl"></div>
                <div className="h-8 bg-primary-light rounded-lg w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 bg-primary-light border-0">
                    <div className="flex space-x-4">
                      <div className="w-20 h-20 bg-primary-100 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-primary-100 rounded w-3/4"></div>
                        <div className="h-3 bg-primary-100 rounded w-1/2"></div>
                        <div className="h-3 bg-primary-100 rounded w-1/4"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card className="p-4 bg-primary-light border-0">
                  <div className="space-y-4">
                    <div className="h-6 bg-primary-100 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-primary-100 rounded"></div>
                      <div className="h-4 bg-primary-100 rounded w-3/4"></div>
                    </div>
                    <div className="h-10 bg-primary-100 rounded-lg"></div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-6 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Header with Back Button Above */}
        <div className="mb-6">
          {/* Back Button */}
          <div className="mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 -ml-2"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>
          </div>
          
          {/* Title Section */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <ShoppingBasket size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Shopping Cart
                </h1>
                {itemCount > 0 && (
                  <p className="text-gray-600 text-sm">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                  </p>
                )}
              </div>
            </div>
            
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearCart())}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hidden md:flex"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Cart
              </Button>
            )}
          </div>
          
          {/* Progress indicator */}
          {items.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Package size={14} className="text-primary" />
              <span className="text-gray-700">Cart</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500">Checkout</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500">Payment</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16"
          >
            <Card className="max-w-md mx-auto bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-gray-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Your cart is empty
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                </p>
                
                <div className="space-y-3">
                  <Link href="/products">
                    <Button className="w-full">
                      <ShoppingBag size={18} className="mr-2" />
                      Start Shopping
                    </Button>
                  </Link>
                  <Link href="/deals">
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                      View Deals
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.variant || 'default'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="bg-white shadow-sm border border-gray-200">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex space-x-3">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            {/* Quantity badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-sm">
                              <span className="text-white text-xs font-semibold">{item.quantity}</span>
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            {/* Product Name and Price */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1 min-w-0 pr-2">
                                <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm md:text-base">
                                  {item.name}
                                </h3>
                                {item.variant && (
                                  <Badge variant="outline" className="text-xs mt-1 border-gray-300 text-gray-600">
                                    {item.variant}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm md:text-base">
                                  ৳{formatNumber(item.price * item.quantity)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ৳{formatNumber(item.price)} each
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls & Actions */}
                            <div className="flex items-center justify-between">
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600 font-medium">Qty:</span>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 rounded-none hover:bg-gray-100"
                                    onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)}
                                  >
                                    <Minus size={12} className="text-gray-600" />
                                  </Button>
                                  <div className="w-8 h-6 flex items-center justify-center border-x border-gray-300 text-xs font-semibold text-gray-900 bg-white">
                                    {item.quantity}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 rounded-none hover:bg-gray-100"
                                    onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)}
                                  >
                                    <Plus size={12} className="text-gray-600" />
                                  </Button>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveToWishlist(item)}
                                  className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                  <Heart size={12} className="mr-1" />
                                  <span className="hidden sm:inline">Save</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => dispatch(removeFromCart({ id: item.id, variant: item.variant }))}
                                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 size={12} className="mr-1" />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Mobile Clear Cart Button */}
              <div className="block md:hidden">
                <Button
                  variant="outline"
                  onClick={() => dispatch(clearCart())}
                  className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All Items
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900">
                      <ShoppingBag size={18} className="text-primary" />
                      <span>Order Summary</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Items Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                        <span className="font-semibold text-gray-900">৳{formatNumber(subtotal)}</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span className="font-semibold">-৳{formatNumber(discount)}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Shipping and taxes calculated at checkout
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Total */}
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>৳{formatNumber(finalTotal)}</span>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-3">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Tag size={14} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(removeCoupon())}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 border-gray-300 focus:border-primary focus:ring-primary"
                            />
                            <Button
                              variant="outline"
                              onClick={handleCouponApply}
                              disabled={couponLoading || !couponCode.trim()}
                              size="sm"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              {couponLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'Apply'
                              )}
                            </Button>
                          </div>
                          {error && (
                            <p className="text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Checkout Buttons */}
                    <div className="space-y-3 pt-2">
                      <Link href="/checkout">
                        <Button className="w-full">
                          Proceed to Checkout
                        </Button>
                      </Link>
                      <Link href="/products">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Shield size={16} className="text-green-600" />
                      <span className="text-sm text-gray-600">Secure Checkout</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
