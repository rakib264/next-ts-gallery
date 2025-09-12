"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
    Calendar,
    CheckCircle,
    CreditCard,
    Mail,
    MapPin,
    Package,
    Phone,
    ShoppingBag,
    Star,
    Truck,
    X
} from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`, {
        cache: "no-store",
      });
      const data = await response.json();

      if (response.ok) {
        setOrder(data.order);
      } else {
        console.error("Order not found");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-50 text-success-700 border-success-200";
      case "shipped":
        return "bg-info-50 text-info-700 border-info-200";
      case "processing":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "confirmed":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "cancelled":
        return "bg-destructive-50 text-destructive-700 border-destructive-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success-50 text-success-700 border-success-200";
      case "pending":
        return "bg-warning-50 text-warning-700 border-warning-200";
      case "failed":
        return "bg-destructive-50 text-destructive-700 border-destructive-200";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16 sm:mt-20">
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-transparent border-t-primary-400"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
        <Header />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16 sm:mt-20">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Order Not Found
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12 mt-16 sm:mt-18 md:mt-20">
        {/* Success Message + Celebration */}
        {isSuccess && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="mb-6 sm:mb-8 p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-success-50 via-emerald-50 to-success-50 border border-success-200 rounded-2xl shadow-xl backdrop-blur-sm"
            >
              {/* First Row: Icon and Title */}
              <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success-100 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle
                      size={24}
                      className="text-success-600 success-icon sm:w-8 sm:h-8"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-success-800 leading-tight">
                    🎉 Order Placed Successfully! 🎉
                  </h3>
                </div>
              </div>
              
              {/* Second Row: Description */}
              <div className="text-center sm:text-left">
                <p className="text-sm sm:text-base lg:text-lg text-success-700 leading-relaxed font-medium">
                  Your order has been received and is being processed. Thank
                  you for shopping with us!
                </p>
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
                0%,
                100% {
                  transform: translateY(0) scale(1);
                }
                50% {
                  transform: translateY(-20px) scale(1.1);
                }
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
              .confetti > span:nth-child(3n + 1) {
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
                    backgroundColor: [
                      "#10b981",
                      "#3b82f6",
                      "#f59e0b",
                      "#ef4444",
                      "#8b5cf6",
                      "#06b6d4",
                    ][i % 6],
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 lg:mb-12 space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
              Order Details
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-semibold">
              Order #{order.orderNumber}
            </p>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="gradient"
                className="w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base font-semibold"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                      <div className="p-2 bg-primary-100 rounded-lg">
                        <Package size={20} className="text-primary-600" />
                      </div>
                      <span>Order Status</span>
                    </span>
                    <div className="flex flex-row items-center gap-4 sm:gap-6">
                      <div className="flex flex-col items-start sm:items-center space-y-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Order Status
                        </span>
                        <Badge
                          className={`${getStatusColor(
                            order.orderStatus
                          )} border-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold shadow-sm`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() +
                            order.orderStatus.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-col items-start sm:items-center space-y-2">
                        <span className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                          Payment Status
                        </span>
                        <Badge
                          className={`${getPaymentStatusColor(
                            order.paymentStatus
                          )} border-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-bold shadow-sm`}
                        >
                          {order.paymentStatus.charAt(0).toUpperCase() +
                            order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="flex items-center space-x-4 p-4 sm:p-5 bg-primary-50 rounded-xl hover:bg-primary-100 transition-all duration-200 hover:shadow-md">
                      <div className="p-3 bg-primary-100 rounded-full shadow-sm">
                        <Package size={20} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-600 mb-1">
                          Order Date
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 sm:p-5 bg-success-50 rounded-xl hover:bg-success-100 transition-all duration-200 hover:shadow-md">
                      <div className="p-3 bg-success-100 rounded-full shadow-sm">
                        <CreditCard size={20} className="text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-600 mb-1">
                          Payment Method
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 capitalize">
                          {order.paymentMethod === "cod"
                            ? "Cash on Delivery"
                            : order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 sm:p-5 bg-secondary-50 rounded-xl hover:bg-secondary-100 transition-all duration-200 hover:shadow-md sm:col-span-2 lg:col-span-1">
                      <div className="p-3 bg-secondary-100 rounded-full shadow-sm">
                        <Truck size={20} className="text-secondary-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-gray-600 mb-1">
                          Delivery Type
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 capitalize">
                          {order.deliveryType.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <div className="mt-6 p-4 sm:p-5 bg-info-50 border border-info-200 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-info-100 rounded-full shadow-sm">
                          <Package size={18} className="text-info-600" />
                        </div>
                        <div>
                          <span className="text-sm sm:text-base font-semibold text-info-800">
                            Tracking Number:
                          </span>
                          <span className="ml-2 font-mono text-sm sm:text-base font-bold text-info-900 bg-info-100 px-3 py-1.5 rounded-lg shadow-sm">
                            {order.trackingNumber}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg shadow-sm">
                      <Package size={20} className="text-primary-600" />
                    </div>
                    <span>Order Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4 sm:space-y-6">
                    {order.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden shadow-md border-2 border-slate-100">
                          <img
                            src={item.image || item.product.thumbnailImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
                            {item.name || item.product?.name || "Product Name"}
                          </h4>
                          {item.variant && (
                            <p className="text-xs sm:text-sm font-semibold text-primary-600 mb-2 bg-primary-50 px-3 py-1.5 rounded-full inline-block shadow-sm">
                              {item.variant}
                            </p>
                          )}
                          <p className="text-sm sm:text-base text-gray-600 font-semibold">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <div className="p-2 bg-success-100 rounded-lg shadow-sm">
                      <MapPin size={20} className="text-success-600" />
                    </div>
                    <span>Shipping Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-success-50 to-emerald-50 rounded-xl border border-success-200 shadow-sm">
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-success-100 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-lg sm:text-xl font-bold text-success-700">
                            {order.shippingAddress.name
                              ?.charAt(0)
                              ?.toUpperCase() || "N"}
                          </span>
                        </div>
                        <div>
                          <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                            {order.shippingAddress.name || "Name Not Available"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/60 rounded-lg shadow-sm">
                          <Phone size={18} className="text-success-600 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-semibold text-gray-900">
                            {order.shippingAddress.phone ||
                              "Phone Not Available"}
                          </span>
                        </div>

                        {order.shippingAddress.email && (
                          <div className="flex items-center space-x-3 p-3 sm:p-4 bg-white/60 rounded-lg shadow-sm">
                            <Mail size={18} className="text-success-600 flex-shrink-0" />
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                              {order.shippingAddress.email}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 bg-white/60 rounded-lg shadow-sm">
                        <div className="text-sm sm:text-base lg:text-lg text-gray-900 space-y-1 sm:space-y-2">
                          <p className="font-bold leading-tight">
                            {order.shippingAddress.street ||
                              "Street Address Not Available"}
                          </p>
                          <p className="font-semibold leading-tight">
                            {order.shippingAddress.city || "City"},{" "}
                            {order.shippingAddress.district || "District"}
                          </p>
                          <p className="font-semibold leading-tight">
                            {order.shippingAddress.division || "Division"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Notes */}
            {order.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                      <div className="p-2 bg-warning-100 rounded-lg shadow-sm">
                        <Mail size={20} className="text-warning-600" />
                      </div>
                      <span>Order Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="p-4 sm:p-5 bg-warning-50 border border-warning-200 rounded-xl shadow-sm">
                      <p className="text-sm sm:text-base lg:text-lg text-gray-900 leading-relaxed font-medium">
                        {order.notes}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="lg:sticky lg:top-24 border-0 shadow-2xl bg-gradient-to-br from-white to-primary-50/30 backdrop-blur-sm rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg shadow-sm">
                      <CreditCard size={20} className="text-primary-600" />
                    </div>
                    <span>Order Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-sm sm:text-base font-semibold text-gray-600">
                        Subtotal:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                        {formatPrice(order.subtotal || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-sm sm:text-base font-semibold text-gray-600">
                        Shipping:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                        {formatPrice(order.shippingCost || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 sm:py-3">
                      <span className="text-sm sm:text-base font-semibold text-gray-600">
                        Tax:
                      </span>
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                        {formatPrice(order.tax || 0)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between items-center py-2 sm:py-3">
                        <span className="text-sm sm:text-base font-semibold text-success-600">
                          Discount:
                        </span>
                        <span className="text-base sm:text-lg lg:text-xl font-bold text-success-600">
                          -{formatPrice(order.discountAmount)}
                        </span>
                      </div>
                    )}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center py-4 px-4 sm:px-5 bg-primary-50 rounded-xl shadow-sm">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
                        Total:
                      </span>
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600">
                        {formatPrice(order.total || 0)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Expected Delivery */}
                  <div className="p-4 sm:p-5 bg-info-50 border border-info-200 rounded-xl shadow-sm">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-info-100 rounded-lg shadow-sm">
                        <Calendar size={20} className="text-info-600" />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-semibold text-info-800">
                          Expected Delivery
                        </p>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-info-900">
                          {order.expectedDelivery
                            ? new Date(
                                order.expectedDelivery
                              ).toLocaleDateString()
                            : order.deliveryType === "same-day"
                            ? "Today"
                            : order.deliveryType === "express"
                            ? "1-2 days"
                            : "3-5 days"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {order.orderStatus === "delivered" && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full border-2 border-success-300 hover:border-success-400 hover:bg-success-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base font-semibold"
                      >
                        <Star size={16} className="mr-2 sm:mr-3" />
                        <span className="text-sm sm:text-base font-semibold">Leave Review</span>
                      </Button>
                    )}
                    {["pending", "confirmed"].includes(order.orderStatus) && (
                      <Button
                        variant="destructive"
                        size="lg"
                        className="w-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm sm:text-base font-semibold"
                      >
                        <X size={16} className="mr-2 sm:mr-3" />
                        <span className="text-sm sm:text-base font-semibold">Cancel Order</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
