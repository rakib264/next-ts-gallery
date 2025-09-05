'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  CreditCard,
  FileText,
  Shield,
  Truck,
  Users
} from 'lucide-react';
import Link from 'next/link';

export default function TermsConditionsPage() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      content: `By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: 'Use License',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      content: `Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials.`
    },
    {
      title: 'User Accounts',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      content: `When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.`
    },
    {
      title: 'Payment Terms',
      icon: CreditCard,
      color: 'from-orange-500 to-red-500',
      content: `All payments are processed securely through our payment partners. By making a purchase, you agree to pay all charges incurred by you or any users of your account and credit card at the price(s) in effect when such charges are incurred.`
    },
    {
      title: 'Shipping & Delivery',
      icon: Truck,
      color: 'from-indigo-500 to-purple-500',
      content: `We will make every effort to deliver your order within the estimated timeframe. However, delivery times may vary due to factors beyond our control. Risk of loss and title for products purchased pass to you upon delivery to the carrier.`
    },
    {
      title: 'Returns & Refunds',
      icon: Shield,
      color: 'from-teal-500 to-green-500',
      content: `We offer a 30-day return policy for items in original condition. Refunds will be processed within 5-7 business days after we receive and inspect the returned item. Return shipping costs are the responsibility of the customer unless the item was defective.`
    }
  ];

  const importantPoints = [
    {
      title: 'Privacy Policy',
      description: 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website.',
      icon: Shield
    },
    {
      title: 'Prohibited Uses',
      description: 'You may not use our website for any unlawful purpose or to solicit others to perform unlawful acts.',
      icon: AlertTriangle
    },
    {
      title: 'Intellectual Property',
      description: 'The content, organization, graphics, design, and other matters related to the website are protected under applicable copyrights and other proprietary rights.',
      icon: FileText
    },
    {
      title: 'Limitation of Liability',
      description: 'In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use the materials on our website.',
      icon: AlertTriangle
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
              <FileText className="w-4 h-4 mr-2" />
              Legal Information
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Please read these terms carefully before using our services
            </p>
            
            <p className="text-lg text-slate-400 mb-10 max-w-3xl mx-auto">
              These terms and conditions outline the rules and regulations for the use of our website and services. 
              By accessing this website, we assume you accept these terms and conditions.
            </p>
            
            <div className="text-sm text-slate-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Terms Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Terms & Conditions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Comprehensive terms covering all aspects of our service
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${section.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                        <section.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-4">{section.title}</h3>
                        <p className="text-slate-700 leading-relaxed text-lg">{section.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Points */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Important Information
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Key points you should be aware of when using our services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {importantPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <point.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">{point.title}</h3>
                        <p className="text-slate-700 leading-relaxed">{point.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Terms */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12 text-center">
              Additional Terms
            </h2>

            <div className="space-y-8">
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Modifications</h3>
                  <p className="text-slate-700 leading-relaxed">
                    We reserve the right to revise these terms at any time without notice. By using this website, 
                    you are agreeing to be bound by the then current version of these terms and conditions.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Governing Law</h3>
                  <p className="text-slate-700 leading-relaxed">
                    These terms and conditions are governed by and construed in accordance with the laws of Bangladesh 
                    and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500 bg-purple-50/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h3>
                  <p className="text-slate-700 leading-relaxed">
                    If you have any questions about these Terms and Conditions, please contact us through our 
                    customer support channels or visit our contact page for more information.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Severability</h3>
                  <p className="text-slate-700 leading-relaxed">
                    If any provision of these terms is deemed invalid or unenforceable by a court, the remaining 
                    provisions of these terms will remain in effect.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Agreement Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                  Agreement to Terms
                </h2>
                <p className="text-xl text-slate-700 mb-8 leading-relaxed">
                  By using our website and services, you acknowledge that you have read and understood these 
                  terms and conditions and agree to be bound by them.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/products">
                    <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 text-lg">
                      Continue Shopping
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white px-8 py-4 text-lg">
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
              Questions About Our Terms?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Our legal team is here to help clarify any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 text-lg">
                  Contact Legal Team
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/faqs">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  View FAQs
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
