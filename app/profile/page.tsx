'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ReturnsSection from '@/components/profile/ReturnsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/store/slices/cartSlice';
import { removeFromWishlist } from '@/lib/store/slices/wishlistSlice';
import { RootState } from '@/lib/store/store';
import { Camera, Heart, LogOut, RotateCcw, ShoppingBasket, Trash2, Upload, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();
  const wishlist = useSelector((state: RootState) => state.wishlist.items);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    profileImage: ''
  });

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (res.ok) setOrders(data.orders);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  // Load profile data and orders
  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrders();
      (async () => {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (res.ok) {
            setForm({
              firstName: data.user.firstName || '',
              lastName: data.user.lastName || '',
              phone: data.user.phone || '',
              profileImage: data.user.profileImage || ''
            });
          }
        } catch (e) {}
      })();
    }
  }, [status]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (status === 'unauthenticated') {
    return null;
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image smaller than 5MB.', variant: 'error' });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm(prev => ({ ...prev, profileImage: data.url }));
        toast({ title: 'Image uploaded', description: 'Profile image updated successfully.', variant: 'success' });
        
        // Automatically save the profile with the new image
        try {
          await saveProfile();
        } catch (error) {
          console.error('Failed to save profile after image upload:', error);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (e) {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Profile updated', description: 'Your personal information was saved.', variant: 'success' });
    } catch (e) {
      console.error('Profile save error:', e);
      toast({ title: 'Update failed', description: 'Please try again.', variant: 'error' });
    }
  };

  const handleRemoveFromWishlist = (itemId: string) => {
    dispatch(removeFromWishlist(itemId));
    toast({ title: 'Removed from wishlist', description: 'Item has been removed from your wishlist.', variant: 'success' });
  };

  const handleAddToCart = (item: any) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      maxQuantity: item.inStock ? 10 : 0
    }));
    toast({ title: 'Added to cart', description: `${item.name} has been added to your cart.`, variant: 'success' });
  };

  const cancelOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'cancelled' }) });
      if (res.ok) {
        setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: 'cancelled' } : o));
      }
    } catch (e) {}
  };

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' });
      toast({ title: 'Signed out', description: 'You have been successfully signed out.', variant: 'success' });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({ title: 'Sign out failed', description: 'Please try again.', variant: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 bg-clip-text text-transparent mb-2">
            My Profile
          </h1>
          <p className="text-slate-600 text-lg">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-xl p-1">
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ShoppingBasket className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger 
              value="returns"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Returns</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wishlist"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-8">
                <CardTitle className="text-2xl text-white font-semibold flex items-center">
                  <User className="w-6 h-6 mr-3" />
                  Personal Information
                </CardTitle>
                <p className="text-indigo-100 mt-2">Update your personal details and profile picture</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Profile Image Section */}
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center overflow-hidden shadow-lg ring-4 ring-white">
                      {form.profileImage && form.profileImage !== '' ? (
                        <img 
                          src={form.profileImage} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Profile image failed to load:', form.profileImage);
                            // If image fails to load, hide it and show default icon
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-16 h-16 text-slate-400" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <label className="cursor-pointer">
                        <Camera className="w-8 h-8 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 cursor-pointer shadow-lg">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Change Photo'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <p className="text-sm text-slate-500 mt-2">JPG, PNG up to 5MB</p>
                    {/* Debug info - remove this in production */}
                    <div className="mt-2 text-xs text-slate-400">
                      Current image: {form.profileImage || 'None'}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name</Label>
                      <Input 
                        id="firstName" 
                        value={form.firstName} 
                        onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))}
                        className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={form.lastName} 
                        onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))}
                        className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Email Address</Label>
                      <Input 
                        value={session?.user?.email || ''} 
                        disabled 
                        className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={form.phone} 
                        onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                        className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-300"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                    <Button 
                      onClick={handleSignOut}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-6 py-3 rounded-xl font-medium transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    <Button 
                      onClick={saveProfile}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-8">
                <CardTitle className="text-2xl font-semibold flex items-center text-white">
                  <ShoppingBasket className="w-6 h-6 mr-3 white" />
                  Order History
                </CardTitle>
                <p className="text-primary-100 mt-2">Track and manage your orders</p>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingBasket className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">No orders yet</h3>
                    <p className="text-slate-500 mb-6">Start shopping to see your orders here</p>
                    <Link href="/products">
                      <Button className="bg-gradient-to-r from-primary-600 to-emerald-600 hover:from-primary-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl">
                        Start Shopping
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-900">#{order.orderNumber}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                order.orderStatus === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                                order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800' :
                                order.orderStatus === 'delivered' ? 'bg-primary-100 text-primary-800' :
                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-lg font-semibold text-slate-900">৳{order.total}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link href={`/orders/${order._id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-lg hover:bg-slate-50 transition-colors duration-200"
                              >
                                View Details
                              </Button>
                            </Link>
                            {['pending','confirmed'].includes(order.orderStatus) && (
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => cancelOrder(order._id)}
                                className="rounded-lg hover:bg-red-600 transition-colors duration-200"
                              >
                                Cancel Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-600 to-violet-600 text-white p-8">
                <CardTitle className="text-2xl text-white font-semibold flex items-center">
                  <span className="w-6 h-6 mr-3">↩️</span>
                  Returns & Exchanges
                </CardTitle>
                <p className="text-primary-100 mt-2">Manage your returns and exchanges</p>
              </CardHeader>
              <CardContent className="p-8">
                <ReturnsSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-600 to-violet-600 text-white p-8">
                <CardTitle className="text-2xl font-semibold flex items-center text-white">
                  <Heart className="w-6 h-6 mr-3 text-white" />
                  My Wishlist
                </CardTitle>
                <p className="text-primary-100 mt-2">Your favorite items saved for later</p>
              </CardHeader>
              <CardContent className="p-8">
                {wishlist.length === 0 ? (
                  <div className="py-12 text-center">
                    <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 mb-2">Your wishlist is empty</h3>
                    <p className="text-slate-500 mb-6">Start adding items you love to your wishlist</p>
                    <Link href="/products">
                      <Button className="bg-gradient-to-r from-primary-600 to-rose-600 hover:from-primary-700 hover:to-rose-700 text-white px-6 py-3 rounded-xl">
                        Browse Products
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlist.map((item) => (
                      <div key={item.id} className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300">
                        <div className="p-4">
                          <div className="flex space-x-4">
                            {/* Product Image */}
                            <div className="relative flex-shrink-0">
                              <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                                <img
                                  src={item.image || '/placeholder-product.jpg'}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                                  <h3 className="font-semibold text-slate-900 leading-tight line-clamp-2 text-sm md:text-base">
                                    {item.name}
                                  </h3>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.inStock 
                                        ? 'bg-primary-100 text-primary-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                                    </div>
                                    {item.comparePrice && item.comparePrice > item.price && (
                                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-red-500 text-white">
                                        {Math.round(((item.comparePrice - item.price) / item.comparePrice) * 100)}% OFF
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="font-bold text-slate-900 text-sm md:text-base">
                                    ৳{item.price}
                                  </div>
                                  {item.comparePrice && item.comparePrice > item.price && (
                                    <div className="text-xs text-slate-500 line-through">
                                      ৳{item.comparePrice}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-600">
                                  Saved for later
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddToCart(item)}
                                    disabled={!item.inStock}
                                    className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-50"
                                  >
                                    <ShoppingBasket size={12} className="mr-1" />
                                    Add to Cart
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveFromWishlist(item.id)}
                                    className="h-8 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 size={12} className="mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}


