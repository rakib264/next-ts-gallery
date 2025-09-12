'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToastWithTypes } from '@/hooks/use-toast';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { Clock, Copy, ExternalLink, Mail, MapPin, Phone, Send, User } from 'lucide-react';
import maplibregl from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';

import 'maplibre-gl/dist/maplibre-gl.css';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  address: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  primaryColor: string;
  secondaryColor: string;
}

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validation schema
const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message is required'),
});

export default function ContactPage() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const { success, error: showError } = useToastWithTypes();

  const initialValues: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  // Fetch general settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings/general');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Initialize MapLibre-GL
  useEffect(() => {
    setMapLoaded(true);
  }, []);

  // Initialize map when loaded and settings are available
  useEffect(() => {
    if (mapLoaded && mapRef.current && settings?.location && !mapInstanceRef.current) {
      const map = new maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors'
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [
          settings.location.longitude || 90.4125,
          settings.location.latitude || 23.8103
        ],
        zoom: 15,
        interactive: false, // Disable user interaction for contact page
      });

      mapInstanceRef.current = map;

      // Add marker
      new maplibregl.Marker({
        color: settings.primaryColor || '#3b82f6'
      })
        .setLngLat([
          settings.location.longitude || 90.4125,
          settings.location.latitude || 23.8103
        ])
        .addTo(map);
    }
  }, [mapLoaded, settings]);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      success(`${label} copied`);
    } catch (e) {
      showError(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleSubmit = async (values: ContactForm, { setSubmitting, resetForm }: any) => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to send message');
      }

      success('Message sent successfully');
      setSubmitted(true);
      resetForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      showError('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16 md:pt-20 mb-20 md:mb-0">
      {/* Hero Section */}
      <div 
        className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-12 md:py-16"
        style={{
          background: settings?.primaryColor 
            ? `linear-gradient(135deg, ${settings.primaryColor} 0%, ${settings.secondaryColor || '#666666'} 100%)`
            : undefined
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get in touch with us. We'd love to hear from you and help with any questions you may have.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
                <p className="text-gray-600 leading-relaxed">
                  {settings?.siteDescription || 'We are here to help you with any questions or concerns you may have.'}
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {settings?.contactEmail && (
                  <div className="flex items-start justify-between space-x-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: settings.primaryColor || '#000000' }}
                    >
                      <Mail size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">{settings.contactEmail}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(settings.contactEmail, 'Email')}
                          className="text-gray-900"
                        >
                          <Copy size={14} className="mr-1 text-gray-900" /> Copy
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <a href={`mailto:${settings.contactEmail}`}>
                            <Mail size={14} className="mr-1" /> Send Email
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {settings?.contactPhone && (
                  <div className="flex items-start justify-between space-x-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: settings.primaryColor || '#000000' }}
                    >
                      <Phone size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Phone</h3>
                      <p className="text-gray-600">{settings.contactPhone}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(settings.contactPhone, 'Phone')}
                          className="text-gray-900"
                        >
                          <Copy size={14} className="mr-1 text-gray-900" /> Copy
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <a href={`tel:${settings.contactPhone}`}>
                            <Phone size={14} className="mr-1" /> Call
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {settings?.address && (
                  <div className="flex items-start justify-between space-x-4">
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: settings.primaryColor || '#000000' }}
                    >
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">Address</h3>
                      <p className="text-gray-600">{settings.address}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(settings.address, 'Address')}
                          className="text-gray-900"
                        >
                          <Copy size={14} className="mr-1 text-gray-900" /> Copy
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <a
                            href={
                              settings.location
                                ? `https://www.google.com/maps?q=${encodeURIComponent(
                                    settings.location.latitude
                                  )},${encodeURIComponent(settings.location.longitude)}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} className="mr-1" /> Google Maps
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: settings?.primaryColor || '#000000' }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Friday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Contact Person */}
              {settings?.contactPerson && (
                <div className="bg-primary-light p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center space-x-3 mb-3">
                    <User size={20} style={{ color: settings.primaryColor || '#000000' }} />
                    <h3 className="font-semibold text-gray-900">Contact Person</h3>
                  </div>
                  <p className="text-gray-600">{settings.contactPerson}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form & Map */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-8">
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white"
                      style={{ backgroundColor: settings?.primaryColor || '#000000' }}
                    >
                      <Send size={24} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600">Thank you for your message. We'll get back to you soon.</p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="mt-4"
                      style={{ 
                        backgroundColor: settings?.primaryColor || '#000000',
                        borderColor: settings?.primaryColor || '#000000'
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Field
                              as={Input}
                              id="name"
                              name="name"
                              placeholder="Enter your full name"
                              className={errors.name && touched.name ? 'border-red-500' : ''}
                            />
                            <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Field
                              as={Input}
                              id="email"
                              name="email"
                              type="email"
                              placeholder="Enter your email address"
                              className={errors.email && touched.email ? 'border-red-500' : ''}
                            />
                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Field
                            as={Input}
                            id="subject"
                            name="subject"
                            placeholder="Enter message subject"
                            className={errors.subject && touched.subject ? 'border-red-500' : ''}
                          />
                          <ErrorMessage name="subject" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <div>
                          <Label htmlFor="message">Message *</Label>
                          <Field
                            as={Textarea}
                            id="message"
                            name="message"
                            rows={6}
                            placeholder="Enter your message here..."
                            className={errors.message && touched.message ? 'border-red-500' : ''}
                          />
                          <ErrorMessage name="message" component="div" className="text-red-500 text-sm mt-1" />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full"
                          style={{ 
                            backgroundColor: settings?.primaryColor || '#000000',
                            borderColor: settings?.primaryColor || '#000000'
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send size={16} className="mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                )}
              </CardContent>
            </Card>

            {/* Map */}
            {settings?.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Find Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      ref={mapRef}
                      className="w-full h-60 sm:h-64 md:h-80 bg-gray-100 rounded-lg border overflow-hidden"
                    >
                      {!mapLoaded && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Loading map...</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {settings.location.formattedAddress && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <MapPin size={16} className="inline mr-1" />
                          {settings.location.formattedAddress}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </div>
      <div className="hidden md:block">
        <Footer />
      </div>
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
