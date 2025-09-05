'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Mail,
  MapPin,
  Package,
  Phone,
  Truck
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      thumbnailImage: string;
    };
    name: string;
    price: number;
    quantity: number;
    variant?: string;
    image?: string;
  }>;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    name: string;
    phone: string;
    email?: string;
    street: string;
    city: string;
    district: string;
    division: string;
  };
  deliveryType: string;
  expectedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, { cache: 'no-store' });
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data.order);
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 mt-16 sm:mt-20">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 mt-16 sm:mt-20">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The order you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 mt-16 sm:mt-20">
        {/* Success Message + Celebration */}
        {isSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg shadow-lg"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle size={24} className="text-green-600 success-icon" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800">🎉 Order Placed Successfully! 🎉</h3>
                  <p className="text-green-600">
                    Your order has been received and is being processed. Thank you for shopping with us!
                  </p>
                </div>
              </div>
            </motion.div>
            {/* Enhanced confetti animation */}
            <style jsx>{`
              @keyframes confetti-fall { 
                0% { 
                  transform: translateY(-100vh) rotate(0deg) scale(0); 
                  opacity: 1;
                } 
                50% {
                  opacity: 1;
                }
                100% { 
                  transform: translateY(100vh) rotate(720deg) scale(1); 
                  opacity: 0;
                } 
              }
              @keyframes confetti-bounce {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-20px) scale(1.1); }
              }
              .confetti { 
                position: fixed; 
                top: -10vh; 
                left: 0; 
                right: 0; 
                pointer-events: none; 
                z-index: 60; 
                height: 100vh;
                overflow: hidden;
              }
              .confetti > span { 
                position: absolute; 
                width: 10px; 
                height: 10px; 
                opacity: 0.9; 
                animation: confetti-fall 3s ease-out forwards; 
                border-radius: 2px;
              }
              .confetti > span:nth-child(3n) {
                animation: confetti-fall 2.5s ease-out forwards;
              }
              .confetti > span:nth-child(3n+1) {
                animation: confetti-fall 3.5s ease-out forwards;
              }
              .success-icon {
                animation: confetti-bounce 0.6s ease-in-out 0.5s both;
              }
            `}</style>
            <div className="confetti">
              {Array.from({ length: 100 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    left: `${Math.random() * 100}%`,
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6],
                    animationDelay: `${Math.random() * 1}s`,
                    width: `${Math.random() * 8 + 6}px`,
                    height: `${Math.random() * 8 + 6}px`,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <Link href="/products">
              <Button 
                variant={isSuccess ? "default" : "outline"} 
                size="sm"
                className={`${isSuccess ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" : ""} w-full sm:w-auto`}
              >
                <ArrowLeft size={16} className="mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Order Details</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Order #{order.orderNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
            >
              <Download size={16} className="mr-2" />
              Download Invoice
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                    </Badge>
                    <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Package size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Date</p>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CreditCard size={16} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Truck size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Type</p>
                      <p className="font-medium capitalize">
                        {order.deliveryType.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Package size={16} className="text-blue-600" />
                      <span className="text-sm font-medium">Tracking Number:</span>
                      <span className="font-mono text-sm">{order.trackingNumber}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 p-4 border rounded-lg">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.image || item.product.thumbnailImage}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.variant && (
                          <p className="text-sm text-muted-foreground">{item.variant}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.shippingAddress.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone size={14} />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                  {order.shippingAddress.email && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <span>{order.shippingAddress.email}</span>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.district}</p>
                    <p>{order.shippingAddress.division}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>

                <Separator />

                {/* Expected Delivery */}
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Calendar size={16} className="text-blue-600" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">Expected Delivery</p>
                    <p className="text-blue-600">
                      {order.expectedDelivery 
                        ? new Date(order.expectedDelivery).toLocaleDateString()
                        : order.deliveryType === 'same-day' 
                        ? 'Today' 
                        : order.deliveryType === 'express' 
                        ? '1-2 days' 
                        : '3-5 days'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(`/api/orders/${order._id}/invoice`, '_blank')}
                  >
                    <Download size={16} className="mr-2" />
                    Download Invoice
                  </Button>
                  {order.orderStatus === 'delivered' && (
                    <Button variant="outline" className="w-full">
                      Leave Review
                    </Button>
                  )}
                  {['pending', 'confirmed'].includes(order.orderStatus) && (
                    <Button variant="destructive" className="w-full">
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>



      <Footer />
      <MobileBottomNav />
    </div>
  );
}