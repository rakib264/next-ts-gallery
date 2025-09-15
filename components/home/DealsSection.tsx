'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/product-card';
import { motion } from 'framer-motion';
import { Calendar, Clock, Package, Tag, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Event {
  _id: string;
  title: string;
  subtitle?: string;
  bannerImage?: string;
  discountText: string;
  startDate: string;
  endDate: string;
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    thumbnailImage?: string;
    averageRating?: number;
    totalReviews?: number;
  }>;
  productsCount: number;
  isActive: boolean;
  status: 'active' | 'upcoming' | 'expired' | 'inactive';
  createdAt: string;
}

export default function DealsSection() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?limit=20');
      const data = await response.json();
      
      if (response.ok) {
        setEvents(data.events || []);
        // Set initial countdown (24 hours for demo)
        setTimeLeft({ days: 0, hours: 23, minutes: 59, seconds: 59 });
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeEvents = events.filter(e => e.status === 'active');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const totalProducts = events.reduce((sum, event) => sum + (event.productsCount || 0), 0);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-pulse bg-gray-200 h-8 w-64 mx-auto rounded mb-4"></div>
            <div className="animate-pulse bg-gray-200 h-4 w-96 mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse bg-white/60 h-96 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-200/40 to-orange-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-200/40 to-red-200/40 rounded-full blur-3xl"></div>
        
        {/* Floating fire elements */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-red-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 lg:mb-16"
        >
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <Zap className="text-white" size={24} />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent text-center">
              Hot Deals & Events
            </h2>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="p-3 sm:p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl sm:rounded-3xl shadow-xl"
            >
              <Zap className="text-white" size={24} />
            </motion.div>
          </div>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8 px-4">
            Discover limited-time events packed with exclusive offers and curated product savings
          </p>
          
          {/* Countdown Timer */}
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 backdrop-blur-sm border border-red-400/30 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl"
          >
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <span className="text-sm sm:text-base lg:text-xl font-bold text-red-700">Limited Time Offer</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{timeLeft.days}</div>
                <div className="text-xs text-gray-500">Days</div>
              </div>
              <div className="text-red-400">:</div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{timeLeft.hours}</div>
                <div className="text-xs text-gray-500">Hours</div>
              </div>
              <div className="text-red-400">:</div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-500">Min</div>
              </div>
              <div className="text-red-400">:</div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-500">Sec</div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-8">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{activeEvents.length}</div>
              <div className="text-xs sm:text-sm text-gray-500">Active Deals</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">50%</div>
              <div className="text-xs sm:text-sm text-gray-500">Max Discount</div>
            </div>
            <div className="w-px h-6 sm:h-8 bg-gray-300"></div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">{totalProducts}</div>
              <div className="text-xs sm:text-sm text-gray-500">Products</div>
            </div>
          </div>
        </motion.div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Calendar className="text-green-600" size={20} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Active Events</h3>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {activeEvents.length} running
                </Badge>
              </div>
            </motion.div>

            <div className="space-y-12">
              {activeEvents.slice(0, 3).map((event, eventIndex) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: eventIndex * 0.1, duration: 0.6 }}
                  className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                >
                  {/* Event Header */}
                  <div className="relative h-48 lg:h-64 bg-gradient-to-br from-red-500 to-orange-500 p-6 lg:p-8 text-white">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className="bg-white/20 text-white border-white/30">
                            <Zap size={14} className="mr-1" />
                            {event.status.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-2 text-white/80">
                            <Package size={16} />
                            <span className="text-sm">{event.productsCount} products</span>
                          </div>
                        </div>
                        <h3 className="text-2xl lg:text-4xl font-bold mb-2">{event.title}</h3>
                        {event.subtitle && (
                          <p className="text-red-100 text-lg">{event.subtitle}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Tag size={18} />
                          <span className="text-lg font-semibold">{event.discountText}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className="p-6 lg:p-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 lg:gap-6">
                      {event.products.slice(0, 12).map((product, productIndex) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: productIndex * 0.05, duration: 0.4 }}
                        >
                          <ProductCard
                            product={{
                              _id: product._id,
                              name: product.name,
                              slug: product.slug,
                              price: product.price,
                              comparePrice: product.comparePrice,
                              thumbnailImage: product.thumbnailImage || '/placeholder-product.jpg',
                              averageRating: product.averageRating || 0,
                              totalReviews: product.totalReviews || 0,
                            }}
                            variant="featured"
                            className="h-full"
                          />
                        </motion.div>
                      ))}
                    </div>

                    {event.products.length > 12 && (
                      <div className="text-center mt-8">
                        <Link href={`/events/${event._id}`}>
                          <Button 
                            size="lg" 
                            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-3 rounded-xl font-semibold"
                          >
                            <Zap size={18} className="mr-2" />
                            View All {event.products.length} Products
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Upcoming Events</h3>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {upcomingEvents.length} coming soon
                </Badge>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {upcomingEvents.slice(0, 6).map((event, eventIndex) => (
                <motion.div
                  key={event._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: eventIndex * 0.1, duration: 0.6 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Event Header */}
                  <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-500 p-4 text-white">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/20 text-white border-white/30 text-xs">
                          <Clock size={12} className="mr-1" />
                          UPCOMING
                        </Badge>
                        <div className="flex items-center gap-1 text-white/80 text-xs">
                          <Package size={12} />
                          <span>{event.productsCount}</span>
                        </div>
                      </div>
                      <h4 className="text-lg font-bold mb-1 line-clamp-2">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Tag size={14} />
                        <span className="text-sm">{event.discountText}</span>
                      </div>
                    </div>
                  </div>

                  {/* Products Preview */}
                  <div className="p-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {event.products.slice(0, 6).map((product, productIndex) => (
                        <div key={product._id} className="relative group">
                          <img
                            src={product.thumbnailImage || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-full h-16 object-cover rounded-lg"
                          />
                          {product.comparePrice && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full">
                              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <Link href={`/events/${event._id}`}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold">
                        <Calendar size={16} className="mr-2" />
                        View Event
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* View All Button */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Link href="/deals">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold"
              >
                <Zap size={20} className="mr-3" />
                Explore All Deals & Events
              </Button>
            </Link>
          </motion.div>
        )}

        {/* No Events */}
        {!loading && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-16"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Zap size={80} className="mx-auto text-gray-300 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-600 mb-4">No Active Deals</h3>
            <p className="text-gray-500 text-lg">Check back soon for amazing deals and event offers!</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
