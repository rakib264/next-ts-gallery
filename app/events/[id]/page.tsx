'use client';

import EventPreview from '@/components/events/EventPreview';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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

interface EventPageProps {
  params: Promise<{ id: string }>;
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/events/${eventId}`);
        
        if (response.status === 404) {
          notFound();
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        
        const data = await response.json();
        setEvent(data);
      } catch (err: any) {
        console.error('Error fetching event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Event Preview Skeleton */}
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 h-96 mb-12">
            <div className="p-8 md:p-12 h-full flex items-center">
              <div className="flex-1">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-16 w-64 mb-6" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="hidden md:block">
                <Skeleton className="h-48 w-64 rounded-2xl" />
              </div>
            </div>
          </div>
          
          {/* Products Grid Skeleton */}
          <div>
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                  <Skeleton className="aspect-square" />
                  <div className="p-4">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            {error ? 'Error Loading Event' : 'Event Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {error || 'The event you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link href="/events">
            <Button variant="outline" className="inline-flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Back to Events</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link href="/events">
            <Button variant="outline" className="inline-flex items-center space-x-2">
              <ArrowLeft size={16} />
              <span>Back to Events</span>
            </Button>
          </Link>
        </motion.div>

        {/* Event Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <EventPreview event={event} showProducts={true} />
        </motion.div>

        {/* Additional Information */}
        {event.status === 'expired' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-medium text-yellow-800 mb-2">
              This Event Has Ended
            </h3>
            <p className="text-yellow-700 mb-4">
              This promotional event has concluded, but you can still browse the featured products at regular prices.
            </p>
            <Link href="/events">
              <Button variant="outline" className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-50">
                Browse Active Events
              </Button>
            </Link>
          </motion.div>
        )}

        {event.status === 'upcoming' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Coming Soon!
            </h3>
            <p className="text-blue-700 mb-4">
              This event hasn't started yet. Keep an eye on the countdown timer above and get ready for amazing deals!
            </p>
            <Link href="/events">
              <Button variant="outline" className="bg-white border-blue-300 text-blue-800 hover:bg-blue-50">
                Browse Active Events
              </Button>
            </Link>
          </motion.div>
        )}

        {event.status === 'inactive' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6 text-center"
          >
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Event Currently Inactive
            </h3>
            <p className="text-gray-700 mb-4">
              This event is temporarily inactive. Please check back later or browse other available events.
            </p>
            <Link href="/events">
              <Button variant="outline" className="bg-white border-gray-300 text-gray-800 hover:bg-gray-50">
                Browse Active Events
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
