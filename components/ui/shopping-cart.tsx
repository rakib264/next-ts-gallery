'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useHydration } from '@/hooks/use-hydration';
import { clearCart, reloadCartFromStorage, removeFromCart, toggleCart, updateQuantity } from '@/lib/store/slices/cartSlice';
import { addToWishlist, loadWishlistFromStorage } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatBDTCurrency } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const { items, total, itemCount, isOpen, shippingCost, tax, discount, couponCode } = useSelector((state: RootState) => state.cart);
  const isHydrated = useHydration();

  useEffect(() => {
    // Load cart and wishlist from localStorage on mount
    dispatch(reloadCartFromStorage());
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  const formatPrice = (price: number) => formatBDTCurrency(price);

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

  if (!isHydrated) return null;

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subtotal + shippingCost + tax - discount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50"
            onClick={() => dispatch(toggleCart())}
            suppressHydrationWarning
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l shadow-2xl z-50 flex flex-col"
            suppressHydrationWarning
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                {itemCount > 0 && (
                  <Badge variant="secondary">{itemCount}</Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleCart())}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Add some products to get started
                  </p>
                  <Link href="/products">
                    <Button onClick={() => dispatch(toggleCart())}>
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.variant || 'default'}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex space-x-4 p-4 border rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                        {item.variant && (
                          <p className="text-xs text-muted-foreground">{item.variant}</p>
                        )}
                        <p className="text-sm font-semibold text-primary mt-1">
                          {formatPrice(item.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)}
                            >
                              <Minus size={12} />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)}
                              disabled={item.quantity >= item.maxQuantity}
                            >
                              <Plus size={12} />
                            </Button>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1"
                              onClick={() => handleMoveToWishlist(item)}
                            >
                              <Heart size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 text-destructive"
                              onClick={() => dispatch(removeFromCart({ id: item.id, variant: item.variant }))}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {items.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  {shippingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                  )}
                  {tax > 0 && (
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({couponCode}):</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Link href="/checkout" className="block">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => dispatch(toggleCart())}
                    >
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <div className="flex space-x-2">
                    <Link href="/products" className="flex-1">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => dispatch(toggleCart())}
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(clearCart())}
                      className="text-destructive"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}