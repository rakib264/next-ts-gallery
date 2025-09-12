'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import ReturnTracker from '@/components/returns/ReturnTracker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MultiImageUpload from '@/components/ui/multi-image-upload';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldProps, Form, Formik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Globe,
  Heart,
  MessageCircle,
  Package,
  Plus,
  RefreshCw,
  Shield,
  TrendingUp,
  Truck,
  Users,
  X,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import * as Yup from 'yup';

// Bangladeshi phone number validation regex
const bangladeshiPhoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;

// Form validation schema with Yup
const validationSchema = Yup.object({
  orderId: Yup.string()
    .required('Order ID is required')
    .min(3, 'Order ID must be at least 3 characters')
    .matches(/^[A-Z0-9-]+$/i, 'Order ID can only contain letters, numbers, and hyphens'),
  customerName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  phone: Yup.string()
    .test('bangladeshi-phone', 'Please enter a valid Bangladeshi phone number', function(value) {
      if (!value) return true; // Optional field
      return bangladeshiPhoneRegex.test(value.replace(/\s/g, ''));
    })
    .transform((value) => value ? value.replace(/\s/g, '') : value),
  type: Yup.string()
    .oneOf(['return', 'exchange'], 'Please select a valid type')
    .required('Type is required'),
  reason: Yup.string()
    .required('Overall reason is required'),
  details: Yup.string()
    .max(500, 'Additional details must be less than 500 characters'),
  products: Yup.array()
    .of(
      Yup.object({
        productName: Yup.string()
          .required('Product name is required')
          .min(2, 'Product name must be at least 2 characters')
          .max(100, 'Product name must be less than 100 characters'),
        quantity: Yup.number()
          .min(1, 'Quantity must be at least 1')
          .max(99, 'Quantity cannot exceed 99')
          .required('Quantity is required')
          .integer('Quantity must be a whole number'),
        variant: Yup.string()
          .max(50, 'Variant must be less than 50 characters'),
        reason: Yup.string()
          .required('Product reason is required')
          .min(3, 'Please provide a more detailed reason'),
        details: Yup.string()
          .max(200, 'Product details must be less than 200 characters')
      })
    )
    .min(1, 'At least one product is required')
    .max(10, 'Cannot return more than 10 products at once'),
  attachments: Yup.array()
    .of(Yup.string())
    .max(5, 'Cannot upload more than 5 images')
});

interface ReturnExchangeFormData {
  orderId: string;
  customerName: string;
  email: string;
  phone: string;
  type: 'return' | 'exchange';
  reason: string;
  details: string;
  products: {
    productName: string;
    quantity: number;
    variant: string;
    reason: string;
    details: string;
  }[];
  attachments: string[];
}

export default function ReturnsExchangesPage() {
  const [activeTab, setActiveTab] = useState<'policy' | 'request' | 'track'>('policy');
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const initialValues: ReturnExchangeFormData = {
    orderId: '',
    customerName: '',
    email: '',
    phone: '',
    type: 'return',
    reason: '',
    details: '',
    products: [{ productName: '', quantity: 1, variant: '', reason: '', details: '' }],
    attachments: []
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const slideIn = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, ease: "easeOut" }
  };

  const steps = [
    { id: 1, title: 'Order Details', description: 'Enter your order information' },
    { id: 2, title: 'Product Selection', description: 'Select items to return/exchange' },
    { id: 3, title: 'Upload Images', description: 'Add photos (optional)' },
    { id: 4, title: 'Review & Submit', description: 'Review your request' }
  ];

  const onSubmit = async (values: ReturnExchangeFormData, { setSubmitting, setFieldError }: any) => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Validate form data before submission
      const validatedData = {
        ...values,
        phone: values.phone ? values.phone.replace(/\s/g, '') : '',
        products: values.products.map(product => ({
          ...product,
          quantity: Number(product.quantity),
          productName: product.productName.trim(),
          variant: product.variant?.trim() || '',
          reason: product.reason.trim(),
          details: product.details?.trim() || ''
        }))
      };
      
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(validatedData)
      });

      const result = await response.json();

      if (response.ok) {
        setSubmittedRequestId(result.requestId || result.id || 'REQ-' + Date.now());
        setIsSubmitted(true);
        setCurrentStep(1); // Reset form
      } else {
        // Handle specific field errors
        if (result.errors) {
          Object.keys(result.errors).forEach(field => {
            setFieldError(field, result.errors[field]);
          });
        }
        throw new Error(result.error || result.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit request. Please try again.';
      setSubmitError(errorMessage);
      
      // Show user-friendly error messages
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setSubmitError('Network error. Please check your connection and try again.');
      } else if (errorMessage.includes('validation')) {
        setSubmitError('Please check your form data and try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  const nextStep = async (validateForm: any, values: ReturnExchangeFormData, errors: any, setTouched: any) => {
    // Validate current step before proceeding
    let canProceed = true;
    let fieldsToTouch: any = {};
    
    if (currentStep === 1) {
      // Validate step 1 fields
      if (!values.orderId || !values.customerName || !values.email || !values.type || !values.reason) {
        canProceed = false;
        fieldsToTouch = {
          orderId: true,
          customerName: true,
          email: true,
          type: true,
          reason: true
        };
      }
    } else if (currentStep === 2) {
      // Validate step 2 fields
      if (!values.products || values.products.length === 0) {
        canProceed = false;
        fieldsToTouch.products = true;
      } else {
        for (let i = 0; i < values.products.length; i++) {
          const product = values.products[i];
          if (!product.productName || !product.quantity || !product.reason) {
            canProceed = false;
            if (!fieldsToTouch.products) fieldsToTouch.products = [];
            fieldsToTouch.products[i] = {
              productName: !product.productName,
              quantity: !product.quantity,
              reason: !product.reason
            };
          }
        }
      }
    } else if (currentStep === 3) {
      // Step 3 (Upload Images) is optional, always allow proceeding
      canProceed = true;
    }
    
    if (canProceed && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (!canProceed) {
      // Touch fields to show validation errors
      setTouched(fieldsToTouch);
      // Trigger validation to show errors
      await validateForm();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full min-h-screen bg-white">
      <Header />
      <MobileBottomNav />

      <main className="w-full pb-20 md:pb-0 ">
      {/* Hero Section with Enhanced Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-secondary p-8 md:p-12 lg:p-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0-10c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative w-full text-center">
          <motion.div 
            className="flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-8 shadow-2xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <RefreshCw className="text-white" size={40} />
          </motion.div>
          
          <motion.h1 
            className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Returns & Exchanges
          </motion.h1>
          
          <motion.p 
            className="text-sm md:text-xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Experience seamless returns and exchanges with our customer-first approach. Your satisfaction is our top priority.
          </motion.p>
          
          {/* Enhanced Feature Cards */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { icon: Clock, title: "30", subtitle: "Days Return Policy", color: "from-blue-400 to-blue-600" },
              { icon: CheckCircle, title: "Free", subtitle: "Return Shipping", color: "from-green-400 to-green-600" },
              { icon: RefreshCw, title: "24h", subtitle: "Quick Processing", color: "from-purple-400 to-purple-600" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="col-span-1 group bg-white/15 backdrop-blur-md rounded-2xl p-4 md:p-8 border border-white/30 hover:bg-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl"
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`flex items-center justify-center w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl mx-auto mb-2 md:mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <item.icon className="text-white" size={28} />
                </div>
                <h3 className="text-lg md:text-3xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/90 font-medium text-xs md:text-md">{item.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

        {/* Enhanced Tab Navigation */}
        <section className="py-6 border-b sticky top-16 lg:top-20 bg-white/95 backdrop-blur-sm z-40 shadow-sm">
          <div className="container mx-auto px-4">
            <motion.nav 
              className="flex space-x-2 bg-muted/50 p-2 rounded-2xl max-w-3xl mx-auto border border-border/50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[
                { id: 'policy', label: 'Policy', icon: FileText, description: 'Return guidelines' },
                { id: 'request', label: 'Submit Request', icon: Package, description: 'Start return' },
                { id: 'track', label: 'Track Status', icon: Truck, description: 'Check progress' }
              ].map(({ id, label, icon: Icon, description }) => (
                <motion.button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex-1 flex flex-col items-center justify-center px-4 py-4 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                    activeTab === id
                      ? 'bg-white text-primary shadow-lg border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/50'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg mb-2 transition-colors ${
                    activeTab === id 
                      ? 'bg-primary/10' 
                      : 'bg-muted group-hover:bg-primary/5'
                  }`}>
                    <Icon size={18} className={activeTab === id ? 'text-primary' : ''} />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm">{label}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block mt-1">
                    {description}
                  </span>
                  {activeTab === id && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                      layoutId="activeTab"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </motion.nav>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {activeTab === 'policy' && (
              <motion.div 
                className="w-full mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {/* Enhanced Hero Section */}
                <motion.div 
                  className="text-center mb-16 relative"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-3xl -z-10"></div>
                  <div className="relative py-12 px-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full mb-6 shadow-lg"
                    >
                      <Award className="w-10 h-10 text-primary" />
                    </motion.div>
                  
                    
                    <motion.h1 
                      className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      Hassle-Free Returns
                      <span className="block text-2xl md:text-5xl lg:text-6xl mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        & Easy Exchanges
                      </span>
                    </motion.h1>
                    
                    <motion.p 
                      className="text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                    >
                      Experience shopping with complete peace of mind. Our customer-first approach ensures 
                      <span className="text-primary font-semibold"> seamless returns</span> and 
                      <span className="text-secondary font-semibold"> quick exchanges</span> every time.
                    </motion.p>
                    
                    {/* Trust Indicators */}
                    <motion.div 
                      className="flex flex-wrap items-center justify-center gap-6 mt-8"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      {[
                        { icon: Shield, text: "30-Day Guarantee", color: "text-green-600" },
                        { icon: Truck, text: "Free Returns", color: "text-blue-600" },
                        { icon: Clock, text: "Quick Processing", color: "text-purple-600" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                          <span className="text-sm font-semibold text-gray-700">{item.text}</span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Enhanced Policy Cards Section */}
                <div className="grid lg:grid-cols-2 gap-10 mb-20">
                  {/* Return Policy Card */}
                  <motion.div
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300 }}
                    className="w-full"
                  >
                    <Card className="h-full border-0 bg-gradient-to-br from-white via-white to-green-50/30 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden relative">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <CardHeader className="pb-8 pt-8 relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center">
                            <motion.div 
                              className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-3xl mr-5 group-hover:scale-110 transition-all duration-300 shadow-lg border border-green-200/50"
                              whileHover={{ rotate: 5 }}
                            >
                              <Package className="text-green-600" size={32} />
                            </motion.div>
                            <div>
                              <CardTitle className="text-md lg:text-3xl font-bold text-gray-900 mb-2">
                                Return Policy
                              </CardTitle>
                              <p className="text-xs md:text-sm text-gray-600 font-medium">Money-back guarantee</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                            <Heart className="w-4 h-4 mr-2" />
                            Customer First
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 pb-8 relative z-10">
                        {[
                          { 
                            icon: CheckCircle, 
                            color: "text-green-600", 
                            bgGradient: "bg-gradient-to-br from-green-50 to-green-100/50", 
                            borderColor: "border-green-200/50",
                            title: "30-Day Return Window", 
                            desc: "Full refund guaranteed within 30 days of delivery",
                            highlight: true,
                            badge: "Most Popular"
                          },
                          { 
                            icon: Shield, 
                            color: "text-blue-600", 
                            bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100/50", 
                            borderColor: "border-blue-200/50",
                            title: "Quality Assurance", 
                            desc: "Items must be in original condition with tags and packaging" 
                          },
                          { 
                            icon: Truck, 
                            color: "text-purple-600", 
                            bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100/50", 
                            borderColor: "border-purple-200/50",
                            title: "Free Return Shipping", 
                            desc: "We cover all return shipping costs - no hidden fees" 
                          },
                          { 
                            icon: AlertCircle, 
                            color: "text-amber-600", 
                            bgGradient: "bg-gradient-to-br from-amber-50 to-amber-100/50", 
                            borderColor: "border-amber-200/50",
                            title: "Special Items Policy", 
                            desc: "Personalized, intimate wear, and perishable items excluded" 
                          }
                        ].map((item, index) => (
                          <motion.div 
                            key={index}
                            className={`flex items-start space-x-4 p-5 rounded-2xl ${item.bgGradient} border ${item.borderColor} ${item.highlight ? 'ring-2 ring-green-300/50 shadow-lg' : 'shadow-sm'} hover:shadow-md transition-all duration-300 relative overflow-hidden group/item`}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            whileHover={{ x: 5 }}
                          >
                            {item.highlight && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                                  {item.badge}
                                </Badge>
                              </div>
                            )}
                            <motion.div 
                              className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bgGradient} border ${item.borderColor} flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-300`}
                              whileHover={{ rotate: 10 }}
                            >
                              <item.icon className={`${item.color}`} size={24} />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 text-md lg:text-lg">{item.title}</h4>
                              <p className="text-gray-600 leading-relaxed font-medium text-xs md:text-sm">{item.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Exchange Policy Card */}
                  <motion.div
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 300, delay: 0.1 }}
                    className="w-full"
                  >
                    <Card className="h-full border-0 bg-gradient-to-br from-white via-white to-blue-50/30 shadow-2xl hover:shadow-3xl transition-all duration-500 group overflow-hidden relative">
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <CardHeader className="pb-8 pt-8 relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center">
                            <motion.div 
                              className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-3xl mr-5 group-hover:scale-110 transition-all duration-300 shadow-lg border border-blue-200/50"
                              whileHover={{ rotate: -5 }}
                            >
                              <RefreshCw className="text-blue-600" size={32} />
                            </motion.div>
                            <div>
                              <CardTitle className="text-md lg:text-3xl font-bold text-gray-900 mb-2">
                                Exchange Policy
                              </CardTitle>
                              <p className="text-xs md:text-sm text-gray-600 font-medium">Size & color flexibility</p>
                            </div>
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Quick & Easy
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-5 pb-8 relative z-10">
                        {[
                          { 
                            icon: RefreshCw, 
                            color: "text-blue-600", 
                            bgGradient: "bg-gradient-to-br from-blue-50 to-blue-100/50", 
                            borderColor: "border-blue-200/50",
                            title: "Size & Color Exchanges", 
                            desc: "Perfect fit guarantee - exchange sizes or colors instantly",
                            highlight: true,
                            badge: "Popular"
                          },
                          { 
                            icon: CheckCircle, 
                            color: "text-green-600", 
                            bgGradient: "bg-gradient-to-br from-green-50 to-green-100/50", 
                            borderColor: "border-green-200/50",
                            title: "Same Product Line", 
                            desc: "Exchange within the same product family for consistency" 
                          },
                          { 
                            icon: Zap, 
                            color: "text-", 
                            bgGradient: "bg-gradient-to-br from-orange-50 to-orange-100/50", 
                            borderColor: "border-orange-200/50",
                            title: "Lightning Fast Processing", 
                            desc: "Express exchanges processed in just 2-3 business days" 
                          },
                          { 
                            icon: DollarSign, 
                            color: "text-purple-600", 
                            bgGradient: "bg-gradient-to-br from-purple-50 to-purple-100/50", 
                            borderColor: "border-purple-200/50",
                            title: "Price Lock Protection", 
                            desc: "Zero extra charges even during promotional price changes" 
                          }
                        ].map((item, index) => (
                          <motion.div 
                            key={index}
                            className={`flex items-start space-x-4 p-5 rounded-2xl ${item.bgGradient} border ${item.borderColor} ${item.highlight ? 'ring-2 ring-blue-300/50 shadow-lg' : 'shadow-sm'} hover:shadow-md transition-all duration-300 relative overflow-hidden group/item`}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index + 4) * 0.15, duration: 0.5 }}
                            whileHover={{ x: -5 }}
                          >
                            {item.highlight && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                                  {item.badge}
                                </Badge>
                              </div>
                            )}
                            <motion.div 
                              className={`flex items-center justify-center w-12 h-12 rounded-xl ${item.bgGradient} border ${item.borderColor} flex-shrink-0 shadow-sm group-hover/item:scale-110 transition-transform duration-300`}
                              whileHover={{ rotate: -10 }}
                            >
                              <item.icon className={`${item.color}`} size={24} />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 text-md lg:text-lg">{item.title}</h4>
                              <p className="text-gray-600 leading-relaxed font-medium text-xs md:text-sm">{item.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Enhanced Process Timeline */}
                <motion.div
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  className="w-full"
                >
                  <Card className="border-0 bg-gradient-to-br from-white via-gray-50/30 to-white shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3"></div>
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-32 blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-tl from-secondary/5 to-transparent rounded-full translate-y-32 blur-3xl"></div>
                    
                    <CardHeader className="text-center pb-12 pt-16 relative z-10">
                      <motion.div 
                        className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-full mx-auto mb-8 shadow-2xl border border-primary/20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                      >
                        <Clock className="text-primary" size={48} />
                      </motion.div>
                      
                      <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                      >
                        <Badge className="mb-6 px-6 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 text-white border-primary/20 text-sm md:text-lg font-bold shadow-lg">
                          <Zap className="w-5 h-5 mr-2" />
                          Lightning Fast Process
                        </Badge>
                        
                        <CardTitle className="text-2xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent">
                          Your Return Journey
                        </CardTitle>
                        <p className="text-sm md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                          Four simple steps to a hassle-free return experience. 
                          <span className="text-primary font-semibold"> Track every moment</span> of your return process.
                        </p>
                      </motion.div>
                    </CardHeader>
                    
                    <CardContent className="pb-16 relative z-10">
                      {/* Timeline Steps */}
                      <div className="grid md:grid-cols-4 gap-8 mb-16 relative">
                        {/* Connection Line */}
                        <div className="hidden md:block absolute top-12 left-1/8 right-1/8 h-1 bg-gradient-to-r from-blue-200 via-orange-200 to-green-200 rounded-full"></div>
                        
                        {[
                          { 
                            step: 1, 
                            title: 'Start Your Return', 
                            desc: 'Quick online form - takes just 2 minutes', 
                            icon: FileText,
                            gradient: 'from-blue-500 to-blue-600',
                            bgGradient: 'from-blue-50 to-blue-100/50',
                            shadowColor: 'shadow-blue-200/50'
                          },
                          { 
                            step: 2, 
                            title: 'Get Your Label', 
                            desc: 'Instant download - print at home or office', 
                            icon: Package,
                            gradient: 'from-purple-500 to-purple-600',
                            bgGradient: 'from-purple-50 to-purple-100/50',
                            shadowColor: 'shadow-purple-200/50'
                          },
                          { 
                            step: 3, 
                            title: 'Ship With Ease', 
                            desc: 'Drop off at any courier - free shipping', 
                            icon: Truck,
                            gradient: 'from-orange-500 to-orange-600',
                            bgGradient: 'from-orange-50 to-orange-100/50',
                            shadowColor: 'shadow-orange-200/50'
                          },
                          { 
                            step: 4, 
                            title: 'Receive Refund', 
                            desc: 'Money back in your account instantly', 
                            icon: CheckCircle,
                            gradient: 'from-green-500 to-green-600',
                            bgGradient: 'from-green-50 to-green-100/50',
                            shadowColor: 'shadow-green-200/50'
                          }
                        ].map(({ step, title, desc, icon: Icon, gradient, bgGradient, shadowColor }, index) => (
                          <motion.div 
                            key={step} 
                            className="text-center group relative"
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 + 0.5, duration: 0.6, type: "spring" }}
                            whileHover={{ y: -10 }}
                          >
                            <motion.div 
                              className={`relative mx-auto w-24 h-24 bg-gradient-to-br ${bgGradient} rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 shadow-xl ${shadowColor} border border-white/50`}
                              whileHover={{ rotate: 5 }}
                            >
                              <Icon className={`text-gray-700`} size={36} />
                              <motion.span 
                                className={`absolute -top-3 -right-3 bg-gradient-to-r ${gradient} text-white text-lg w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-lg border-2 border-white`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.2 + 0.8, type: "spring", stiffness: 500 }}
                              >
                                {step}
                              </motion.span>
                            </motion.div>
                            
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.2 + 1 }}
                            >
                              <h4 className="font-bold mb-3 text-gray-900 text-md lg:text-xl group-hover:text-primary transition-colors">{title}</h4>
                              <p className="text-gray-600 leading-relaxed font-medium text-base max-w-xs mx-auto">{desc}</p>
                            </motion.div>
                            
                            {/* Connecting Arrow */}
                            {index < 3 && (
                              <motion.div 
                                className="hidden md:block absolute top-12 left-full w-8 h-8 transform translate-x-4"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 + 1.2 }}
                              >
                                <ChevronRight className="w-8 h-8 text-gray-300 group-hover:text-primary transition-colors" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Enhanced Progress Section */}
                      <motion.div 
                        className="bg-gradient-to-r from-primary/8 via-white/50 to-secondary/8 rounded-3xl p-10 border border-primary/10 shadow-inner backdrop-blur-sm relative overflow-hidden"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.6 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-50"></div>
                        
                        <div className="relative z-10">
                          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <span className="text-md lg:text-xl font-bold text-gray-900">Processing Speed</span>
                                <p className="text-xs md:text-sm text-gray-600">Industry-leading turnaround time</p>
                              </div>
                            </div>
                            <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 text-sm md:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                              <Clock className="w-5 h-5 mr-2" />
                              2-4 Days
                            </Badge>
                          </div>
                          
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "85%" }}
                            transition={{ delay: 1.8, duration: 1.5, ease: "easeOut" }}
                          >
                            <Progress value={85} className="h-4 bg-white/70 shadow-inner" />
                          </motion.div>
                          
                          <div className="mt-6 text-center">
                            <p className="text-sm md:text-lg text-gray-700 font-semibold">
                              🚀 <span className="text-primary font-bold">85% faster</span> than industry average
                            </p>
                            <p className="text-gray-600 mt-2">
                              Most returns processed within 2-4 business days
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'request' && (
              <motion.div 
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="text-center py-12 border-2 border-green-200 bg-green-50/50">
                      <CardContent>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        >
                          <CheckCircle className="mx-auto mb-6 text-green-500" size={64} />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-4 text-green-800">Request Submitted Successfully!</h2>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          Your return/exchange request has been submitted. We'll process it within 24 hours and send you updates via email.
                        </p>
                        <div className="bg-white border border-green-200 p-6 rounded-lg mb-6 max-w-md mx-auto">
                          <div className="flex items-center justify-center mb-2">
                            <Package className="w-5 h-5 text-primary mr-2" />
                            <p className="font-semibold text-lg">Request ID</p>
                          </div>
                          <p className="font-mono text-lg font-bold text-primary mb-2">{submittedRequestId}</p>
                          <p className="text-sm text-muted-foreground">Keep this ID for tracking your request</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            onClick={() => setActiveTab('track')}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Truck className="w-4 h-4 mr-2" />
                            Track Status
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setIsSubmitted(false);
                              setCurrentStep(1);
                              setSubmitError('');
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Submit Another Request
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                  >
                    {({ values, errors, touched, setFieldValue, isSubmitting: formikSubmitting, validateForm, setTouched }) =>{

                      return (
                         <Form className="space-y-8">
                      {/* Enhanced Step Progress */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                          <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center">
                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mr-3">
                                  <Package className="text-primary" size={20} />
                                </div>
                                Return Request Progress
                              </CardTitle>
                              <Badge variant="outline" className="text-primary border-primary/20">
                                Step {currentStep} of {steps.length}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-6">
                              {/* Progress Bar */}
                              <div className="w-full">
                                <Progress value={(currentStep / steps.length) * 100} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  {Math.round((currentStep / steps.length) * 100)}% Complete
                                </p>
                              </div>
                              
                              {/* Step Indicators */}
                              <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                  <div key={step.id} className="flex flex-col items-center flex-1">
                                    <motion.div 
                                      className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                        currentStep >= step.id 
                                          ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                                          : 'border-muted-foreground text-muted-foreground bg-white'
                                      }`}
                                      whileHover={{ scale: 1.1 }}
                                      transition={{ type: "spring", stiffness: 300 }}
                                    >
                                      {currentStep > step.id ? (
                                        <CheckCircle size={20} />
                                      ) : (
                                        <span className="text-sm font-bold">{step.id}</span>
                                      )}
                                      {currentStep === step.id && (
                                        <motion.div
                                          className="absolute inset-0 bg-primary/20 rounded-full"
                                          animate={{ scale: [1, 1.2, 1] }}
                                          transition={{ duration: 2, repeat: Infinity }}
                                        />
                                      )}
                                    </motion.div>
                                    
                                    <div className="mt-3 text-center">
                                      <p className={`text-sm font-semibold ${
                                        currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                                      }`}>
                                        {step.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                                        {step.description}
                                      </p>
                                    </div>
                                    
                                    {index < steps.length - 1 && (
                                      <div className={`hidden sm:block absolute top-6 left-1/2 w-full h-0.5 transform translate-x-6 ${
                                        currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                                      }`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Step Content */}
                      <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                          <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                              <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center text-xl">
                                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl mr-3">
                                      <FileText className="text-primary" size={20} />
                                    </div>
                                    Order & Contact Information
                                  </CardTitle>
                                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                                    Required
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-2">
                                  Please provide your order details and contact information
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <Label htmlFor="orderId" className="text-sm font-semibold flex items-center">
                                      <Package className="w-4 h-4 mr-2 text-primary" />
                                      Order ID *
                                    </Label>
                                    <Field name="orderId">
                                      {({ field }: FieldProps) => (
                                        <Input 
                                          id="orderId"
                                          placeholder="e.g. ORD-123456789" 
                                          className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors"
                                          {...field} 
                                        />
                                      )}
                                    </Field>
                                    {errors.orderId && touched.orderId && (
                                      <motion.p 
                                        className="text-sm text-red-600 mt-2 flex items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.orderId}
                                      </motion.p>
                                    )}
                                  </motion.div>
                                  
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <Label htmlFor="type" className="text-sm font-semibold flex items-center">
                                      <RefreshCw className="w-4 h-4 mr-2 text-primary" />
                                      Request Type *
                                    </Label>
                                    <Field name="type">
                                      {({ field }: FieldProps) => (
                                        <Select 
                                          onValueChange={(value) => {
                                            field.onChange({ target: { value, name: field.name } });
                                          }} 
                                          value={field.value || ""} 
                                          name={field.name}
                                        >
                                          <SelectTrigger className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors">
                                            <SelectValue placeholder="Select type" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="return">
                                              <div className="flex items-center">
                                                <Package className="w-4 h-4 mr-2" />
                                                Return for Refund
                                              </div>
                                            </SelectItem>
                                            <SelectItem value="exchange">
                                              <div className="flex items-center">
                                                <RefreshCw className="w-4 h-4 mr-2" />
                                                Exchange Item
                                              </div>
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      )}
                                    </Field>
                                    {errors.type && touched.type && (
                                      <motion.p 
                                        className="text-sm text-red-600 mt-2 flex items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.type}
                                      </motion.p>
                                    )}
                                  </motion.div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <Label htmlFor="customerName" className="text-sm font-semibold flex items-center">
                                      <Users className="w-4 h-4 mr-2 text-primary" />
                                      Full Name *
                                    </Label>
                                    <Field name="customerName">
                                      {({ field }: FieldProps) => (
                                        <Input 
                                          id="customerName"
                                          placeholder="Your full name" 
                                          className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors"
                                          {...field} 
                                        />
                                      )}
                                    </Field>
                                    {errors.customerName && touched.customerName && (
                                      <motion.p 
                                        className="text-sm text-red-600 mt-2 flex items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.customerName}
                                      </motion.p>
                                    )}
                                  </motion.div>
                                  
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                  >
                                    <Label htmlFor="email" className="text-sm font-semibold flex items-center">
                                      <Globe className="w-4 h-4 mr-2 text-primary" />
                                      Email Address *
                                    </Label>
                                    <Field name="email">
                                      {({ field }: FieldProps) => (
                                        <Input 
                                          id="email"
                                          type="email" 
                                          placeholder="your@email.com" 
                                          className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors"
                                          {...field} 
                                        />
                                      )}
                                    </Field>
                                    {errors.email && touched.email && (
                                      <motion.p 
                                        className="text-sm text-red-600 mt-2 flex items-center"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                      >
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.email}
                                      </motion.p>
                                    )}
                                  </motion.div>
                                </div>
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.5 }}
                                >
                                  <Label htmlFor="phone" className="text-sm font-semibold flex items-center">
                                    <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                                    Phone Number (Optional)
                                  </Label>
                                  <Field name="phone">
                                    {({ field }: FieldProps) => (
                                      <Input 
                                        id="phone"
                                        placeholder="+880 1XXXXXXXXX or 01XXXXXXXXX" 
                                        className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={(e) => {
                                          let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                                          
                                          // Format Bangladeshi phone number only on blur
                                          if (value.length > 0) {
                                            if (value.startsWith('880') && value.length === 13) {
                                              value = '+' + value;
                                            } else if (value.startsWith('1') && value.length === 10) {
                                              value = '+880' + value;
                                            } else if (value.startsWith('01') && value.length === 11) {
                                              value = '+880' + value.substring(1);
                                            }
                                          }
                                          
                                          field.onChange({ target: { value } });
                                          field.onBlur(e);
                                        }}
                                      />
                                    )}
                                  </Field>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Enter a valid Bangladeshi phone number (e.g., +880 1XXXXXXXXX)
                                  </p>
                                  {errors.phone && touched.phone && (
                                    <motion.p 
                                      className="text-sm text-red-600 mt-2 flex items-center"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                    >
                                      <AlertCircle className="w-4 h-4 mr-1" />
                                      {errors.phone}
                                    </motion.p>
                                  )}
                                </motion.div>
                                <div>
                                  <Label htmlFor="reason">Overall Reason for {values.type === 'return' ? 'Return' : 'Exchange'} *</Label>
                                  <Field name="reason">
                                    {({ field }: FieldProps) => (
                                      <Select 
                                        onValueChange={(value) => {
                                          field.onChange({ target: { value, name: field.name } });
                                        }} 
                                        value={field.value || ""} 
                                        name={field.name}
                                      >
                                        <SelectTrigger className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors">
                                          <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="defective">Product is defective/damaged</SelectItem>
                                          <SelectItem value="wrong-item">Wrong item received</SelectItem>
                                          <SelectItem value="wrong-size">Wrong size</SelectItem>
                                          <SelectItem value="not-as-described">Not as described</SelectItem>
                                          <SelectItem value="changed-mind">Changed mind</SelectItem>
                                          <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </Field>
                                  {errors.reason && touched.reason && (
                                    <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                                  )}
                                </div>
                                <div>
                                  <Label className="mb-1" htmlFor="details">Additional Details (Optional)</Label>
                                  <Field name="details">
                                    {({ field }: FieldProps) => (
                                      <Textarea 
                                        id="details"
                                        placeholder="Please provide any additional details about your request..."
                                        className="min-h-[100px]"
                                        {...field} 
                                      />
                                    )}
                                  </Field>
                                  {errors.details && touched.details && (
                                    <p className="text-sm text-red-600 mt-1">{errors.details}</p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {currentStep === 2 && (
                          <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-lg">
                              <CardHeader className="pb-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg">
                                <CardTitle className="flex items-center text-xl lg:text-2xl">
                                  <div className="flex items-center justify-center w-12 h-12 bg-primary/15 rounded-xl mr-4">
                                    <Package className="text-primary" size={24} />
                                  </div>
                                  Products to {values.type === 'return' ? 'Return' : 'Exchange'}
                                </CardTitle>
                                <p className="text-muted-foreground mt-2">
                                  Select and provide details for each product you want to {values.type}
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {values.products.map((_, index) => (
                                  <Card key={index} className="border-dashed">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium text-gray-900">Product {index + 1}</h4>
                                        {values.products.length > 1 && (
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              const newProducts = values.products.filter((_, i) => i !== index);
                                              setFieldValue('products', newProducts);
                                            }}
                                          >
                                            <X size={16} />
                                          </Button>
                                        )}
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor={`products.${index}.productName`}>Product Name *</Label>
                                          <Field name={`products.${index}.productName`}>
                                            {({ field }: FieldProps) => (
                                              <Input 
                                                id={`products.${index}.productName`}
                                                placeholder="Enter product name" 
                                                {...field} 
                                              />
                                            )}
                                          </Field>
                                          {errors.products?.[index] && typeof errors.products[index] === 'object' && (errors.products[index] as any)?.productName && touched.products?.[index]?.productName && (
                                            <motion.p 
                                              className="text-sm text-red-600 mt-2 flex items-center"
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                            >
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              {(errors.products[index] as any).productName}
                                            </motion.p>
                                          )}
                                        </div>
                                        <div>
                                          <Label htmlFor={`products.${index}.quantity`} className="text-sm font-semibold flex items-center">
                                            <Package className="w-4 h-4 mr-2 text-primary" />
                                            Quantity *
                                          </Label>
                                          <Field name={`products.${index}.quantity`}>
                                            {({ field }: FieldProps) => (
                                              <Input 
                                                id={`products.${index}.quantity`}
                                                type="number" 
                                                min="1" 
                                                max="99"
                                                placeholder="1" 
                                                className="mt-2 h-12 border-2 focus:border-primary/50 transition-colors"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                  const value = e.target.value;
                                                  const numValue = parseInt(value);
                                                  if (value === '' || (numValue >= 1 && numValue <= 99)) {
                                                    field.onChange({ target: { value: value === '' ? '' : numValue, name: field.name } });
                                                  }
                                                }}
                                                onBlur={field.onBlur}
                                              />
                                            )}
                                          </Field>
                                          {errors.products?.[index] && typeof errors.products[index] === 'object' && (errors.products[index] as any)?.quantity && touched.products?.[index]?.quantity && (
                                            <motion.p 
                                              className="text-sm text-red-600 mt-2 flex items-center"
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                            >
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              {(errors.products[index] as any).quantity}
                                            </motion.p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor={`products.${index}.variant`}>Size/Color/Variant (Optional)</Label>
                                          <Field name={`products.${index}.variant`}>
                                            {({ field }: FieldProps) => (
                                              <Input 
                                                id={`products.${index}.variant`}
                                                placeholder="e.g. Large, Red, etc." 
                                                {...field} 
                                              />
                                            )}
                                          </Field>
                                          {errors.products?.[index] && typeof errors.products[index] === 'object' && (errors.products[index] as any)?.variant && touched.products?.[index]?.variant && (
                                            <motion.p 
                                              className="text-sm text-red-600 mt-2 flex items-center"
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                            >
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              {(errors.products[index] as any).variant}
                                            </motion.p>
                                          )}
                                        </div>
                                        <div>
                                          <Label htmlFor={`products.${index}.reason`}>Product Reason *</Label>
                                          <Field name={`products.${index}.reason`}>
                                            {({ field }: FieldProps) => (
                                              <Select 
                                                onValueChange={(value) => {
                                                  field.onChange({ target: { value, name: field.name } });
                                                }} 
                                                value={field.value || ""} 
                                                name={field.name}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select reason" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="defective">Defective/Damaged</SelectItem>
                                                  <SelectItem value="wrong-size">Wrong Size</SelectItem>
                                                  <SelectItem value="wrong-color">Wrong Color</SelectItem>
                                                  <SelectItem value="not-as-described">Not as Described</SelectItem>
                                                  <SelectItem value="quality-issue">Quality Issue</SelectItem>
                                                  <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            )}
                                          </Field>
                                          {errors.products?.[index] && typeof errors.products[index] === 'object' && (errors.products[index] as any)?.reason && touched.products?.[index]?.reason && (
                                            <motion.p 
                                              className="text-sm text-red-600 mt-2 flex items-center"
                                              initial={{ opacity: 0, x: -10 }}
                                              animate={{ opacity: 1, x: 0 }}
                                            >
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              {(errors.products[index] as any).reason}
                                            </motion.p>
                                          )}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    const newProducts = [...values.products, { productName: '', quantity: 1, variant: '', reason: '', details: '' }];
                                    setFieldValue('products', newProducts);
                                  }}
                                  className="w-full border-dashed"
                                >
                                  <Plus size={16} className="mr-2" />
                                  Add Another Product
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {currentStep === 3 && (
                          <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-lg">
                              <CardHeader className="pb-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg">
                                <CardTitle className="flex items-center text-xl lg:text-2xl">
                                  <div className="flex items-center justify-center w-12 h-12 bg-primary/15 rounded-xl mr-4">
                                    <FileText className="text-primary" size={24} />
                                  </div>
                                  Upload Images (Optional)
                                </CardTitle>
                                <p className="text-muted-foreground mt-2">
                                  Add photos to help us better understand your request
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-4">
                                    Upload photos to help us understand the issue better (max 5 images)
                                  </p>
                                  <MultiImageUpload
                                    maxFiles={5}
                                    onUpload={(urls) => {
                                      setFieldValue('attachments', urls);
                                    }}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {currentStep === 4 && (
                          <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="border-2 hover:border-primary/20 transition-all duration-300 shadow-lg">
                              <CardHeader className="pb-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-t-lg">
                                <CardTitle className="flex items-center text-xl lg:text-2xl">
                                  <div className="flex items-center justify-center w-12 h-12 bg-primary/15 rounded-xl mr-4">
                                    <CheckCircle className="text-primary" size={24} />
                                  </div>
                                  Review Your Request
                                </CardTitle>
                                <p className="text-muted-foreground mt-2">
                                  Please review all details before submitting your request
                                </p>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-2">Order Information</h4>
                                    <div className="space-y-1 text-sm">
                                      <p><span className="text-muted-foreground">Order ID:</span> {values.orderId}</p>
                                      <p><span className="text-muted-foreground">Type:</span> {values.type}</p>
                                      <p><span className="text-muted-foreground">Name:</span> {values.customerName}</p>
                                      <p><span className="text-muted-foreground">Email:</span> {values.email}</p>
                                      {values.phone && (
                                        <p><span className="text-muted-foreground">Phone:</span> {values.phone}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Products</h4>
                                    <div className="space-y-2">
                                      {values.products.map((product, index) => (
                                        <div key={index} className="text-sm p-3 bg-muted rounded-lg">
                                          <p className="font-medium">{product.productName}</p>
                                          <p className="text-muted-foreground">Qty: {product.quantity}</p>
                                          {product.variant && (
                                            <p className="text-muted-foreground">Variant: {product.variant}</p>
                                          )}
                                          <p className="text-muted-foreground">Reason: {product.reason}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-muted p-4 rounded-lg">
                                  <h4 className="font-medium mb-2 flex items-center">
                                    <Shield className="mr-2 text-green-500" size={20} />
                                    What happens next?
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• We'll review your request within 24 hours</li>
                                    <li>• You'll receive an email confirmation with your request ID</li>
                                    <li>• If approved, we'll send return instructions</li>
                                    <li>• Process your {values.type} within 3-5 business days</li>
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Error Display */}
                      {submitError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle size={16} />
                            <span className="text-sm">{submitError}</span>
                          </div>
                        </motion.div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          disabled={currentStep === 1}
                        >
                          <ArrowLeft size={16} className="mr-2" />
                          Previous
                        </Button>
                        
                        {currentStep < steps.length ? (
                          <Button
                            type="button"
                            onClick={() => nextStep(validateForm, values, errors, setTouched)}
                          >
                            Next
                            <ArrowRight size={16} className="ml-2" />
                          </Button>
                        ) : (
                          <Button
                            type="submit"
                            disabled={isSubmitting || formikSubmitting}
                          >
                            {isSubmitting || formikSubmitting ? 'Submitting...' : 'Submit Request'}
                          </Button>
                        )}
                      </div>
                      </Form>
                      )
                    }}
                  </Formik>
                )}
              </motion.div>
            )}

            {activeTab === 'track' && (
              <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <ReturnTracker />
              </motion.div>
            )}
          </div>
        </section>

              {/* Enhanced Help Section with Premium Gradient Background */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-secondary p-8 md:p-12 lg:p-16 mt-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Advanced Background Pattern */}
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.08\"%3E%3Cpath d=\"M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0-10c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative w-full text-center">
          <motion.div 
            className="flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mx-auto mb-8 shadow-2xl"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users className="text-white" size={36} />
          </motion.div>
          
          <motion.h2 
            className="text-2xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Need Help? We're Here for You
          </motion.h2>
          
          <motion.p 
            className="text-sm md:text-xl md:text-2xl text-white/95 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Our dedicated customer service team is ready to assist you with any questions about returns and exchanges.
          </motion.p>
        
          
          {/* Enhanced Support Links */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button 
              variant="outline" 
              className="h-14 px-8 bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              <Users className="mr-3" size={20} />
              Start Live Chat
            </Button>
            <Link href="/contact">
              <Button 
                variant="outline" 
                className="h-14 px-8 bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 font-semibold text-lg rounded-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <FileText className="mr-3" size={20} />
                Contact Us
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>


      </main>

      <Footer />
    </div>
  );
}
