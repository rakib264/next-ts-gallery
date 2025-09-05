'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    CheckCircle,
    Clock,
    Info,
    MapPin,
    Package,
    Shield,
    Star,
    Truck
} from 'lucide-react';
import Link from 'next/link';

export default function ShippingDeliveryPage() {
  const shippingOptions = [
    {
      name: 'Standard Delivery',
      duration: '3-5 Business Days',
      price: '৳100',
      description: 'Regular shipping for most areas',
      icon: Package,
      popular: false
    },
    {
      name: 'Express Delivery',
      duration: '1-2 Business Days',
      price: '৳200',
      description: 'Fast delivery for urgent orders',
      icon: Truck,
      popular: true
    },
    {
      name: 'Same Day Delivery',
      duration: 'Same Day',
      price: '৳300',
      description: 'Available in selected areas only',
      icon: Clock,
      popular: false
    }
  ];

  const deliverySteps = [
    {
      step: 1,
      title: 'Order Placed',
      description: 'Your order is confirmed and payment is processed',
      icon: CheckCircle
    },
    {
      step: 2,
      title: 'Processing',
      description: 'We prepare your items with care and quality check',
      icon: Package
    },
    {
      step: 3,
      title: 'Shipped',
      description: 'Your order is dispatched with tracking information',
      icon: Truck
    },
    {
      step: 4,
      title: 'Delivered',
      description: 'Your order arrives safely at your doorstep',
      icon: MapPin
    }
  ];

  const coverageAreas = [
    { area: 'Dhaka', status: 'Available', delivery: '1-2 days' },
    { area: 'Chittagong', status: 'Available', delivery: '2-3 days' },
    { area: 'Sylhet', status: 'Available', delivery: '2-3 days' },
    { area: 'Rajshahi', status: 'Available', delivery: '3-4 days' },
    { area: 'Khulna', status: 'Available', delivery: '3-4 days' },
    { area: 'Barisal', status: 'Available', delivery: '3-4 days' },
    { area: 'Rangpur', status: 'Available', delivery: '4-5 days' },
    { area: 'Mymensingh', status: 'Available', delivery: '3-4 days' }
  ];

  const policies = [
    {
      title: 'Free Shipping',
      description: 'Free shipping on orders above ৳2000',
      icon: Star,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Secure Packaging',
      description: 'All items are carefully packaged for safe delivery',
      icon: Shield,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Real-time Tracking',
      description: 'Track your order from dispatch to delivery',
      icon: MapPin,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Easy Returns',
      description: '30-day return policy for all items',
      icon: CheckCircle,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
              <Header />
      {/* Hero Section */}
      <section className="pt-16 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-4 py-2">
              <Truck className="w-4 h-4 mr-2" />
              Fast & Reliable Delivery
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Shipping & Delivery
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Get your fashion items delivered quickly and safely to your doorstep
            </p>
            
            <p className="text-lg text-slate-400 mb-10 max-w-3xl mx-auto">
              We understand that waiting for your favorite fashion items can be exciting yet anxious. 
              That's why we've partnered with the best logistics providers to ensure your orders 
              reach you in perfect condition and on time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shipping Options */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Choose Your Delivery Speed
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Select the delivery option that best fits your needs and budget
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {option.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full border-2 transition-all duration-300 hover:shadow-xl ${
                  option.popular 
                    ? 'border-indigo-500 shadow-lg' 
                    : 'border-slate-200 hover:border-indigo-300'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                      option.popular 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                        : 'bg-gradient-to-r from-slate-500 to-slate-600'
                    }`}>
                      <option.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{option.name}</CardTitle>
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                      {option.price}
                    </div>
                    <p className="text-slate-600 font-medium">{option.duration}</p>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-slate-600 mb-6">{option.description}</p>
                    <Button 
                      className={`w-full ${
                        option.popular 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600' 
                          : 'bg-slate-900 hover:bg-slate-800'
                      } text-white`}
                    >
                      Choose This Option
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Process */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              From order placement to delivery, here's what happens with your order
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {deliverySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  {index < deliverySteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 transform translate-x-10" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Step {step.step}</h3>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h4>
                <p className="text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Delivery Coverage
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              We deliver to all major cities and districts across Bangladesh
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coverageAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{area.area}</h3>
                    <p className="text-sm text-slate-600 mb-1">{area.status}</p>
                    <p className="text-sm font-medium text-indigo-600">{area.delivery}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Policies */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Our Shipping Policies
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Transparent policies designed to give you peace of mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${policy.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <policy.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{policy.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{policy.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12 text-center">
              Important Information
            </h2>

            <div className="space-y-6">
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Delivery Timeframes</h3>
                      <p className="text-slate-700">
                        Delivery times are calculated from the day your order is dispatched, not from the order date. 
                        Processing time is typically 1-2 business days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <AlertCircle className="w-6 h-6 text-orange-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Delivery Attempts</h3>
                      <p className="text-slate-700">
                        We make up to 3 delivery attempts. If unsuccessful, your package will be held at the nearest 
                        delivery center for 7 days before being returned to us.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-2">Contact Information</h3>
                      <p className="text-slate-700">
                        Please ensure your contact information is accurate. Our delivery team will contact you 
                        before delivery to confirm the best time and location.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Place Your Order?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Experience fast, reliable delivery with our premium shipping services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 text-lg">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
