'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useHydration } from '@/hooks/use-hydration';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { clearWishlist, loadWishlistFromStorage, removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { formatNumber } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Heart, ShoppingBag, ShoppingBasket, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.wishlist);
  const isHydrated = useHydration();

  useEffect(() => {
    // Load wishlist from localStorage on mount
    dispatch(loadWishlistFromStorage());
  }, [dispatch]);

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      maxQuantity: 10
    }));
  };

  const handleRemoveFromWishlist = (id: string) => {
    dispatch(removeFromWishlist(id));
  };

  const totalValue = items.reduce((sum, item) => sum + item.price, 0);
  const inStockItems = items.filter(item => item.inStock);
  const outOfStockItems = items.filter(item => !item.inStock);

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
                <Heart size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  My Wishlist
                </h1>
                {items.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    {items.length} {items.length === 1 ? 'item' : 'items'} saved for later
                  </p>
                )}
              </div>
            </div>
            
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearWishlist())}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 hidden md:flex"
              >
                <Trash2 size={16} className="mr-2" />
                Clear All
              </Button>
            )}
          </div>
          
          {/* Progress indicator */}
          {items.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Heart size={14} className="text-primary" />
              <span className="text-gray-700">Wishlist</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500">Add to Cart</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-500">Checkout</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Wishlist */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16"
          >
            <Card className="max-w-md mx-auto bg-white shadow-sm">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Heart size={32} className="text-gray-600" />
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Your wishlist is empty
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Save items you love to your wishlist and shop them later. Start exploring our products!
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
          /* Wishlist with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Wishlist Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
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
                            {/* Wishlist badge */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                              <Heart size={10} className="text-white fill-white" />
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
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge variant={item.inStock ? "default" : "secondary"} className="text-xs">
                                    {item.inStock ? 'In Stock' : 'Out of Stock'}
                                  </Badge>
                                  {item.comparePrice && (
                                    <Badge className="text-xs bg-red-500">
                                      {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-gray-900 text-sm md:text-base">
                                  ৳{formatNumber(item.price)}
                                </div>
                                {item.comparePrice && (
                                  <div className="text-xs text-gray-500 line-through">
                                    ৳{formatNumber(item.comparePrice)}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-600">
                                Saved for later
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddToCart(item)}
                                  disabled={!item.inStock}
                                  className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                                >
                                  <ShoppingBasket size={12} className="mr-1" />
                                  <span className="hidden sm:inline">Add to Cart</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromWishlist(item.id)}
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

              {/* Mobile Clear All Button */}
              <div className="block md:hidden">
                <Button
                  variant="outline"
                  onClick={() => dispatch(clearWishlist())}
                  className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 size={16} className="mr-2" />
                  Clear All Items
                </Button>
              </div>
            </div>

            {/* Wishlist Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-gray-900">
                      <Heart size={18} className="text-primary" />
                      <span>Wishlist Summary</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Items Summary */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Items</span>
                        <span className="font-semibold text-gray-900">{items.length}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">In Stock</span>
                        <span className="font-semibold text-green-600">{inStockItems.length}</span>
                      </div>
                      
                      {outOfStockItems.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Out of Stock</span>
                          <span className="font-semibold text-red-600">{outOfStockItems.length}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Total value of all items
                      </div>
                    </div>

                    <Separator className="bg-gray-200" />

                    {/* Total Value */}
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total Value</span>
                      <span>৳{formatNumber(totalValue)}</span>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3 pt-2">
                      {inStockItems.length > 0 && (
                        <Button 
                          className="w-full"
                          onClick={() => {
                            inStockItems.forEach(item => handleAddToCart(item));
                          }}
                        >
                          <ShoppingBasket size={16} className="mr-2" />
                          Add All to Cart ({inStockItems.length})
                        </Button>
                      )}
                      <Link href="/products">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                          Continue Shopping
                        </Button>
                      </Link>
                    </div>

                    {/* Tips */}
                    <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                      <Zap size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">Pro Tip:</p>
                        <p>Add items to cart when they're in stock to avoid missing out on great deals!</p>
                      </div>
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