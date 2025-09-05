'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Phone,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function FAQsPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'General Questions',
      icon: HelpCircle,
      color: 'from-blue-500 to-cyan-500',
      faqs: [
        {
          question: "What is your return policy?",
          answer: "We offer a 30-day return policy for all items in original condition with tags attached. Returns are free for Privilege Members, while standard customers pay a small return shipping fee."
        },
        {
          question: "How do I track my order?",
          answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order by logging into your account and visiting the 'My Orders' section."
        },
        {
          question: "Do you ship internationally?",
          answer: "Currently, we only ship within Bangladesh. We're working on expanding our international shipping options in the near future."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, mobile banking (bKash, Rocket, Nagad), and cash on delivery for orders within Bangladesh."
        }
      ]
    },
    {
      title: 'Shipping & Delivery',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      faqs: [
        {
          question: "How long does shipping take?",
          answer: "Standard delivery takes 3-5 business days, express delivery takes 1-2 business days, and same-day delivery is available in selected areas of Dhaka."
        },
        {
          question: "Is shipping free?",
          answer: "Free shipping is available on orders above ৳2000. Privilege Members enjoy free shipping on all orders regardless of amount."
        },
        {
          question: "Can I change my delivery address after placing an order?",
          answer: "You can change your delivery address within 2 hours of placing your order by contacting our customer support team."
        },
        {
          question: "What if I'm not available during delivery?",
          answer: "Our delivery team will attempt delivery 3 times. If unsuccessful, your package will be held at the nearest delivery center for 7 days before being returned."
        }
      ]
    },
    {
      title: 'Account & Orders',
      icon: Phone,
      color: 'from-purple-500 to-pink-500',
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click on 'Sign Up' in the top right corner, enter your email and password, and verify your email address. You can also sign up using your Google or Facebook account."
        },
        {
          question: "Can I cancel my order?",
          answer: "You can cancel your order within 2 hours of placement if it hasn't been processed yet. Contact our customer support team for assistance."
        },
        {
          question: "How do I update my account information?",
          answer: "Log into your account, go to 'My Profile', and update your information. Changes will be saved immediately."
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email."
        }
      ]
    }
  ];

  const allFAQs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({ ...faq, category: category.title }))
  );

  const filteredFAQs = searchTerm 
    ? allFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allFAQs;

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
              <HelpCircle className="w-4 h-4 mr-2" />
              Help Center
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Find answers to common questions about our services
            </p>
            
            <p className="text-lg text-slate-400 mb-10 max-w-3xl mx-auto">
              Can't find what you're looking for? Our customer support team is here to help you 24/7.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      {!searchTerm && (
        <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                Browse by Category
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Find answers organized by topic for easier navigation
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {faqCategories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer group">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4">{category.title}</h3>
                      <p className="text-slate-600 mb-6">{category.faqs.length} questions</p>
                      <Button 
                        variant="outline" 
                        className="border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white"
                        onClick={() => setSearchTerm(category.title)}
                      >
                        Browse Questions
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ List */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              {searchTerm ? `Search Results (${filteredFAQs.length})` : 'All Questions'}
            </h2>
            {searchTerm && (
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Showing results for "{searchTerm}"
              </p>
            )}
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.question}</h3>
                        {!searchTerm && (
                          <Badge variant="outline" className="text-xs">
                            {faq.category}
                          </Badge>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: openFAQ === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {openFAQ === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="border-t border-slate-200 pt-4">
                              <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredFAQs.length === 0 && searchTerm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">No results found</h3>
              <p className="text-slate-600 mb-6">Try searching with different keywords or browse our categories above.</p>
              <Button 
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white"
              >
                Clear Search
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-slate-600 mb-10">
              Our customer support team is available 24/7 to assist you with any questions or concerns.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Live Chat</h3>
                  <p className="text-slate-600 mb-6">Get instant help from our support team</p>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Phone Support</h3>
                  <p className="text-slate-600 mb-6">Call us for immediate assistance</p>
                  <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                    Call Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Email Support</h3>
                  <p className="text-slate-600 mb-6">Send us a detailed message</p>
                  <Link href="/contact">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Send Email
                    </Button>
                  </Link>
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
              Ready to Shop?
            </h2>
            <p className="text-xl text-slate-300 mb-10">
              Now that you have all the answers, explore our amazing collection of fashion items.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 text-lg">
                  Browse Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/privilege-members">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Join Privilege Members
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
