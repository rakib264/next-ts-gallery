'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle,
  Crown,
  Gift,
  Star,
  Truck,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function PrivilegeMembersPage() {
  const membershipTiers = [
    {
      name: 'Silver Member',
      price: 'Free',
      description: 'Perfect for occasional shoppers',
      icon: Star,
      color: 'from-slate-400 to-slate-600',
      features: [
        '5% discount on all purchases',
        'Free shipping on orders above ৳1500',
        'Early access to sales',
        'Birthday surprise gift',
        'Priority customer support'
      ],
      popular: false
    },
    {
      name: 'Gold Member',
      price: '৳500/year',
      description: 'For regular fashion enthusiasts',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      features: [
        '10% discount on all purchases',
        'Free shipping on all orders',
        'Exclusive early access to new collections',
        'Personal style consultation',
        'VIP customer support',
        'Monthly exclusive offers',
        'Free returns and exchanges'
      ],
      popular: true
    },
    {
      name: 'Platinum Member',
      price: '৳1000/year',
      description: 'Ultimate luxury experience',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      features: [
        '15% discount on all purchases',
        'Free express shipping on all orders',
        'First access to limited edition items',
        'Personal shopper service',
        '24/7 dedicated support',
        'Exclusive member-only events',
        'Free alterations and customization',
        'Quarterly luxury gift box'
      ],
      popular: false
    }
  ];

  const benefits = [
    {
      title: 'Exclusive Discounts',
      description: 'Enjoy special member-only pricing on all our premium collections',
      icon: Gift,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Early Access',
      description: 'Be the first to shop new arrivals and limited edition pieces',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Free Shipping',
      description: 'Complimentary shipping on all orders, no minimum required',
      icon: Truck,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'VIP Support',
      description: 'Priority customer service with dedicated support team',
      icon: Users,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Ahmed',
      tier: 'Gold Member',
      comment: 'The exclusive early access to new collections is amazing! I always get the best pieces before they sell out.',
      rating: 5
    },
    {
      name: 'Rahim Khan',
      tier: 'Platinum Member',
      comment: 'The personal shopper service has completely transformed my wardrobe. Highly recommended!',
      rating: 5
    },
    {
      name: 'Fatima Begum',
      tier: 'Silver Member',
      comment: 'Great value for money. The discounts and free shipping make shopping so much better.',
      rating: 5
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
            <Badge className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 px-4 py-2">
              <Crown className="w-4 h-4 mr-2" />
              Exclusive Membership
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-yellow-100 to-orange-100 bg-clip-text text-transparent">
              Privilege Members
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Unlock exclusive benefits and elevate your fashion experience
            </p>
            
            <p className="text-lg text-slate-400 mb-10 max-w-3xl mx-auto">
              Join our exclusive membership program and enjoy premium benefits, early access to new collections, 
              special discounts, and personalized services that make you feel like a VIP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 text-lg">
                Join Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/about">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Exclusive Benefits
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Discover the premium advantages that come with being a Privilege Member
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <benefit.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Choose Your Membership
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Select the membership tier that best fits your fashion needs and lifestyle
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`h-full border-2 transition-all duration-300 hover:shadow-xl ${
                  tier.popular 
                    ? 'border-yellow-500 shadow-lg' 
                    : 'border-slate-200 hover:border-yellow-300'
                }`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-r ${tier.color}`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900">{tier.name}</CardTitle>
                    <div className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                      {tier.price}
                    </div>
                    <p className="text-slate-600 font-medium">{tier.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full mt-6 ${
                        tier.popular 
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' 
                          : 'bg-slate-900 hover:bg-slate-800'
                      } text-white`}
                    >
                      {tier.price === 'Free' ? 'Join Free' : 'Subscribe Now'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              What Our Members Say
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Hear from our satisfied Privilege Members about their experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50">
                  <CardContent className="p-8">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 italic">"{testimonial.comment}"</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                        <p className="text-sm text-slate-600">{testimonial.tier}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to know about our Privilege Membership program
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              {
                question: "How do I become a Privilege Member?",
                answer: "Simply sign up for any membership tier on our website. Silver membership is free, while Gold and Platinum memberships require an annual subscription fee."
              },
              {
                question: "Can I upgrade or downgrade my membership?",
                answer: "Yes, you can upgrade or downgrade your membership at any time. Changes will be reflected in your next billing cycle."
              },
              {
                question: "Are the discounts stackable with other promotions?",
                answer: "Member discounts can be combined with most promotions, but some exclusions may apply during special sales events."
              },
              {
                question: "What happens if I cancel my membership?",
                answer: "You'll retain your membership benefits until the end of your current billing period. After that, you'll return to standard customer status."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{faq.question}</h3>
                    <p className="text-slate-700">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
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
              Ready to Join the Elite?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Start your journey to exclusive fashion experiences today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 text-lg">
                Join Privilege Members
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Contact Us
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
