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
    Plus,
    ShoppingBag,
    ShoppingCart,
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
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-16 md:mt-20 mb-20 md:mb-0">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center space-x-3">
              <ShoppingCart size={24} className="text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
              {itemCount > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
          </div>
          
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(clearCart())}
              className="text-destructive hover:text-destructive hidden md:flex"
            >
              Clear Cart
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16"
          >
            <div className="max-w-md mx-auto">
              <ShoppingBag size={80} className="mx-auto text-muted-foreground mb-6" />
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8">
                Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
              </p>
              <div className="space-y-3">
                <Link href="/products">
                  <Button size="lg" className="w-full md:w-auto">
                    <ShoppingBag size={20} className="mr-2" />
                    Start Shopping
                  </Button>
                </Link>
                <div className="block md:hidden">
                  <Link href="/deals">
                    <Button variant="outline" size="lg" className="w-full">
                      View Deals
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-0">
                <CardContent className="p-0">
                  <div className="divide-y">
                    <AnimatePresence>
                      {items.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${item.variant || 'default'}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="p-4 md:p-6"
                        >
                          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            {/* Product Image */}
                            <div className="w-full sm:w-24 md:w-32 h-48 sm:h-24 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 space-y-3 sm:space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                  <h3 className="font-semibold text-base md:text-lg leading-tight">
                                    {item.name}
                                  </h3>
                                  {item.variant && (
                                    <p className="text-sm text-muted-foreground">
                                      Variant: {item.variant}
                                    </p>
                                  )}
                                  <div className="flex items-center space-x-4 text-sm md:text-base">
                                    <span className="font-medium">৳{formatNumber(item.price)}</span>
                                    <span className="text-muted-foreground">each</span>
                                  </div>
                                </div>
                                
                                <div className="text-right mt-2 sm:mt-0">
                                  <div className="font-semibold text-lg">
                                    ৳{formatNumber(item.price * item.quantity)}
                                  </div>
                                </div>
                              </div>

                              {/* Quantity and Actions */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                                {/* Quantity Controls */}
                                <div className="flex items-center space-x-3">
                                  <span className="text-sm font-medium">Quantity:</span>
                                  <div className="flex items-center border rounded-lg">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-9 p-0"
                                      onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)}
                                    >
                                      <Minus size={16} />
                                    </Button>
                                    <span className="w-12 text-center text-sm font-medium">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-9 p-0"
                                      onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)}
                                    >
                                      <Plus size={16} />
                                    </Button>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMoveToWishlist(item)}
                                    className="text-sm"
                                  >
                                    <Heart size={16} className="mr-1" />
                                    <span className="hidden sm:inline">Save for Later</span>
                                    <span className="sm:hidden">Save</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => dispatch(removeFromCart({ id: item.id, variant: item.variant }))}
                                    className="text-destructive text-sm"
                                  >
                                    <Trash2 size={16} className="mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Clear Cart Button */}
              <div className="block md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => dispatch(clearCart())}
                  className="w-full text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag size={20} />
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items Summary */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({itemCount} items)</span>
                      <span>৳{formatNumber(subtotal)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-৳{formatNumber(discount)}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Shipping and taxes calculated at checkout
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>৳{formatNumber(finalTotal)}</span>
                  </div>

                  {/* Coupon Section */}
                  <div className="space-y-3">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Tag size={16} className="text-green-600" />
                          <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(removeCoupon())}
                          className="text-green-600 hover:text-green-700"
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
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            onClick={handleCouponApply}
                            disabled={couponLoading || !couponCode.trim()}
                            size="sm"
                          >
                            {couponLoading ? (
                              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Apply'
                            )}
                          </Button>
                        </div>
                        {error && (
                          <p className="text-xs text-red-500">{error}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <div className="space-y-3">
                    <Link href="/checkout">
                      <Button size="lg" className="w-full">
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Link href="/products">
                      <Button variant="outline" size="lg" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="text-white">
                        <path d="M7 1L3 5L1 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-sm text-muted-foreground">Secure Checkout</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
