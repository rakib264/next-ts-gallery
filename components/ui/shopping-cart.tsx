'use client';

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

export default function ShoppingBasket() {
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => dispatch(toggleCart())}
            suppressHydrationWarning
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-[60] flex flex-col"
            suppressHydrationWarning
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-lg">
                  <ShoppingBag size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
                  {itemCount > 0 && (
                    <p className="text-sm text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(toggleCart())}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={32} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Add some products to get started
                  </p>
                  <Link href="/products">
                    <Button 
                      onClick={() => dispatch(toggleCart())}
                      className="w-full"
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.variant || 'default'}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-3 md:p-4">
                        <div className="flex space-x-3">
                          {/* Product Image */}
                          <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-100 rounded-lg overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ShoppingBag size={20} className="text-gray-400" />
                                </div>
                              )}
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
                                <h4 className="font-semibold text-gray-900 leading-tight line-clamp-2 text-sm md:text-base">
                                  {item.name}
                                </h4>
                                {item.variant && (
                                  <p className="text-xs text-gray-600 mt-1 bg-gray-100 px-2 py-1 rounded inline-block">
                                    {item.variant}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm md:text-base">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatPrice(item.price)} each
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
                                    disabled={item.quantity >= item.maxQuantity}
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
                                  className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                  onClick={() => handleMoveToWishlist(item)}
                                >
                                  <Heart size={12} className="mr-1" />
                                  <span className="hidden sm:inline">Save</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => dispatch(removeFromCart({ id: item.id, variant: item.variant }))}
                                >
                                  <Trash2 size={12} className="mr-1" />
                                  <span className="hidden sm:inline">Remove</span>
                                </Button>
                              </div>
                            </div>
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
              <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-6 space-y-4">
                {/* Summary */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-base">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({itemCount} items):</span>
                      <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(shippingCost)}</span>
                      </div>
                    )}
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(tax)}</span>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({couponCode}):</span>
                        <span className="font-semibold">-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <Separator className="bg-gray-300" />
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total:</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
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
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => dispatch(toggleCart())}
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(clearCart())}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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