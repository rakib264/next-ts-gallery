'use client';

import EventPreview from '@/components/events/EventPreview';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import BackButton from '@/components/ui/back-button';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, Package, Zap } from 'lucide-react';
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

export default function DealsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await fetch('/api/events?limit=20');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const activeEvents = events.filter(e => e.status === 'active');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');
  const totalProducts = events.reduce((sum, event) => sum + (event.productsCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 mt-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-3 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0">
        <div className="mb-6 md:mb-8">
          <BackButton label="Back" />
        </div>
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mb-6">
            <Zap className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">Hot Deals & Event Specials</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Discover limited-time events packed with exclusive offers and curated product savings.</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-500 rounded-2xl p-6 text-white text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock size={24} />
            <span className="text-xl font-bold">Live Event Promotions</span>
          </div>
          <p className="text-red-100">{activeEvents.length} active events • {upcomingEvents.length} upcoming • {totalProducts} products featured</p>
        </motion.div>

        {/* Active Events */}
        <div className="space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Active Events</h2>
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <Package size={16} />
                <span>{activeEvents.length} running now</span>
              </div>
            </div>

            {activeEvents.length > 0 ? (
              <div className="space-y-10">
                {activeEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <EventPreview event={event} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-gray-400" />
                </div>
                <p className="text-muted-foreground">No active events at the moment.</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <Clock size={16} />
                <span>{upcomingEvents.length} coming soon</span>
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-10">
                {upcomingEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                  >
                    <EventPreview event={event} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-gray-400" />
                </div>
                <p className="text-muted-foreground">No upcoming events scheduled. Stay tuned!</p>
              </div>
            )}
          </div>
        </div>

        {events.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-2">No Events Available</h3>
            <p className="text-muted-foreground mb-4">Check back soon for amazing deals and event offers!</p>
          </motion.div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-8 text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Never Miss a Deal!</h2>
          <p className="text-blue-100 mb-6">
            Subscribe to our newsletter and be the first to know about exclusive deals and flash sales.
          </p>
          <Button size="lg" variant="secondary" className="px-8">
            Subscribe Now
          </Button>
        </motion.div>
      </div>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}