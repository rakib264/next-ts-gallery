'use client';

import EventPreview from '@/components/events/EventPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter, Package, Zap } from 'lucide-react';
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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming'>('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      params.set('limit', '20');

      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const activeEvents = events.filter(e => e.status === 'active');
  const upcomingEvents = events.filter(e => e.status === 'upcoming');

  const getFilteredEvents = () => {
    switch (filter) {
      case 'active':
        return activeEvents;
      case 'upcoming':
        return upcomingEvents;
      default:
        return events;
    }
  };

  const filteredEvents = getFilteredEvents();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Special Events & Offers
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Discover amazing deals and exclusive offers on your favorite products
            </motion.p>
          </div>
        </div>
      </div>

      {/* Stats and Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Zap size={20} className="text-green-600" />
                  <span className="text-2xl font-bold text-green-600">{activeEvents.length}</span>
                </div>
                <p className="text-sm text-gray-600">Active Events</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock size={20} className="text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</span>
                </div>
                <p className="text-sm text-gray-600">Upcoming</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Package size={20} className="text-purple-600" />
                  <span className="text-2xl font-bold text-purple-600">
                    {events.reduce((sum, event) => sum + event.productsCount, 0)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Total Products</p>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter size={18} className="text-gray-400" />
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Events' },
                { key: 'active', label: 'Active Now' },
                { key: 'upcoming', label: 'Coming Soon' }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={filter === filterOption.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterOption.key as any)}
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative h-64 bg-gray-200">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardContent className="p-8">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-6" />
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="aspect-square" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-12">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <EventPreview event={event} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {filter === 'active' && 'No Active Events'}
              {filter === 'upcoming' && 'No Upcoming Events'}
              {filter === 'all' && 'No Events Available'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {filter === 'active' && 'There are no active events at the moment. Check back soon for exciting offers!'}
              {filter === 'upcoming' && 'No upcoming events scheduled. Stay tuned for future promotions!'}
              {filter === 'all' && 'No events are currently available. We\'ll have exciting offers coming soon!'}
            </p>
            <Button
              variant="outline"
              onClick={() => setFilter('all')}
              className="inline-flex items-center space-x-2"
            >
              <Calendar size={16} />
              <span>View All Events</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
