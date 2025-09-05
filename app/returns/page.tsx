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
    Clock,
    FileText,
    Globe,
    Heart,
    MessageCircle,
    Package,
    Plus,
    RefreshCw,
    Shield,
    Sparkles,
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
            fieldsToTouch[`products.${i}.productName`] = true;
            fieldsToTouch[`products.${i}.quantity`] = true;
            fieldsToTouch[`products.${i}.reason`] = true;
          }
        }
      }
    }
    
    if (canProceed && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
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
    <div className="min-h-screen bg-background">
      <Header />
      <MobileBottomNav />

      <main className="pt-16 lg:pt-20 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20 lg:py-24">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Icon with glow effect */}
              <motion.div 
                className="relative inline-block mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150"></div>
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full shadow-2xl">
                  <RefreshCw className="text-white" size={48} />
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Hassle-Free Returns
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Returns & Exchanges
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                  Experience seamless returns and exchanges with our customer-first approach. 
                  Your satisfaction is our top priority.
                </p>
              </motion.div>
              
              {/* Enhanced Stats */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
                variants={staggerContainer}
                animate="animate"
              >
                <motion.div 
                  variants={fadeInUp} 
                  className="group relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4 mx-auto group-hover:bg-primary/20 transition-colors">
                    <Clock className="text-primary" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">30</div>
                  <div className="text-sm text-muted-foreground font-medium">Days Return Window</div>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp} 
                  className="group relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl mb-4 mx-auto group-hover:bg-green-500/20 transition-colors">
                    <Truck className="text-green-500" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-green-500 mb-2">Free</div>
                  <div className="text-sm text-muted-foreground font-medium">Return Shipping</div>
                </motion.div>
                
                <motion.div 
                  variants={fadeInUp} 
                  className="group relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4 mx-auto group-hover:bg-blue-500/20 transition-colors">
                    <Zap className="text-blue-500" size={24} />
                  </div>
                  <div className="text-3xl font-bold text-blue-500 mb-2">24h</div>
                  <div className="text-sm text-muted-foreground font-medium">Quick Processing</div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Tab Navigation */}
        <section className="py-6 border-b sticky top-16 lg:top-20 bg-background/95 backdrop-blur-sm z-40 shadow-sm">
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
                      ? 'bg-background text-primary shadow-lg border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
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
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-12"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                >
                  <Badge variant="outline" className="mb-4 px-4 py-2">
                    <Award className="w-4 h-4 mr-2" />
                    Our Commitment to You
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Transparent Return & Exchange Policies
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    We believe in making returns and exchanges as simple and stress-free as possible
                  </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Return Policy */}
                  <motion.div
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-xl">
                            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mr-4 group-hover:bg-primary/20 transition-colors">
                              <Package className="text-primary" size={24} />
                            </div>
                            Return Policy
                          </CardTitle>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Heart className="w-3 h-3 mr-1" />
                            Customer First
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "30-Day Return Window", 
                            desc: "Return items within 30 days of delivery for a full refund",
                            highlight: true
                          },
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "Original Condition", 
                            desc: "Items must be unused with original tags and packaging" 
                          },
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "Free Return Shipping", 
                            desc: "We cover return shipping costs for most items" 
                          },
                          { 
                            icon: AlertCircle, 
                            color: "text-amber-500", 
                            bgColor: "bg-amber-50", 
                            title: "Non-Returnable Items", 
                            desc: "Personalized items, intimate wear, and perishables" 
                          }
                        ].map((item, index) => (
                          <motion.div 
                            key={index}
                            className={`flex items-start space-x-4 p-4 rounded-xl ${item.bgColor} ${item.highlight ? 'ring-2 ring-green-200' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${item.bgColor} flex-shrink-0`}>
                              <item.icon className={`${item.color} mt-0.5`} size={18} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Exchange Policy */}
                  <motion.div
                    variants={slideIn}
                    initial="initial"
                    animate="animate"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card className="h-full border-2 hover:border-primary/20 transition-all duration-300 group">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center text-xl">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mr-4 group-hover:bg-blue-500/20 transition-colors">
                              <RefreshCw className="text-blue-500" size={24} />
                            </div>
                            Exchange Policy
                          </CardTitle>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Quick & Easy
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "Size & Color Exchanges", 
                            desc: "Exchange for different size or color within 30 days",
                            highlight: true
                          },
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "Same Item Only", 
                            desc: "Exchanges must be for the same product" 
                          },
                          { 
                            icon: CheckCircle, 
                            color: "text-green-500", 
                            bgColor: "bg-green-50", 
                            title: "Quick Processing", 
                            desc: "Exchanges processed within 3-5 business days" 
                          },
                          { 
                            icon: Clock, 
                            color: "text-blue-500", 
                            bgColor: "bg-blue-50", 
                            title: "Price Protection", 
                            desc: "No additional charges for price differences during sale periods" 
                          }
                        ].map((item, index) => (
                          <motion.div 
                            key={index}
                            className={`flex items-start space-x-4 p-4 rounded-xl ${item.bgColor} ${item.highlight ? 'ring-2 ring-green-200' : ''}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (index + 4) * 0.1 }}
                          >
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${item.bgColor} flex-shrink-0`}>
                              <item.icon className={`${item.color} mt-0.5`} size={18} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
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
                >
                  <Card className="border-2 hover:border-primary/20 transition-all duration-300">
                    <CardHeader className="text-center pb-6">
                      <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl mx-auto mb-4">
                        <Clock className="text-primary" size={32} />
                      </div>
                      <CardTitle className="text-2xl">Return Process Timeline</CardTitle>
                      <p className="text-muted-foreground mt-2">
                        Simple steps to complete your return in just a few days
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-4 gap-8">
                        {[
                          { 
                            step: 1, 
                            title: 'Initiate Return', 
                            desc: 'Submit return request online', 
                            icon: FileText,
                            color: 'bg-blue-500',
                            bgColor: 'bg-blue-50'
                          },
                          { 
                            step: 2, 
                            title: 'Print Label', 
                            desc: 'Download & print return label', 
                            icon: Package,
                            color: 'bg-purple-500',
                            bgColor: 'bg-purple-50'
                          },
                          { 
                            step: 3, 
                            title: 'Ship Item', 
                            desc: 'Drop off at courier location', 
                            icon: Truck,
                            color: 'bg-orange-500',
                            bgColor: 'bg-orange-50'
                          },
                          { 
                            step: 4, 
                            title: 'Get Refund', 
                            desc: 'Refund processed within 3-5 days', 
                            icon: CheckCircle,
                            color: 'bg-green-500',
                            bgColor: 'bg-green-50'
                          }
                        ].map(({ step, title, desc, icon: Icon, color, bgColor }, index) => (
                          <motion.div 
                            key={step} 
                            className="text-center group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="relative mx-auto w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                              <Icon className="text-primary" size={24} />
                              <span className={`absolute -top-2 -right-2 ${color} text-white text-xs w-7 h-7 rounded-full flex items-center justify-center font-bold shadow-lg`}>
                                {step}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-2 text-foreground">{title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                            {index < 3 && (
                              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent transform translate-x-4"></div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-muted-foreground">Average Processing Time</span>
                          <span className="text-sm font-bold text-primary">3-5 Days</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          Most returns are processed within 3-5 business days
                        </p>
                      </div>
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
                                          : 'border-muted-foreground text-muted-foreground bg-background'
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
                                        currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
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
                                  <Label htmlFor="details">Additional Details (Optional)</Label>
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
                            <Card>
                              <CardHeader>
                                <CardTitle>Products to {values.type === 'return' ? 'Return' : 'Exchange'}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-6">
                                {values.products.map((_, index) => (
                                  <Card key={index} className="border-dashed">
                                    <CardContent className="pt-6">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-medium">Product {index + 1}</h4>
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
                                            <p className="text-sm text-red-600 mt-1">{(errors.products[index] as any).productName}</p>
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
                                            <p className="text-sm text-red-600 mt-1">{(errors.products[index] as any).variant}</p>
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
                                            <p className="text-sm text-red-600 mt-1">{(errors.products[index] as any).reason}</p>
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
                            <Card>
                              <CardHeader>
                                <CardTitle>Upload Images (Optional)</CardTitle>
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
                            <Card>
                              <CardHeader>
                                <CardTitle>Review Your Request</CardTitle>
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
                className="max-w-4xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  initial="initial"
                  animate="animate"
                >
                  <Badge variant="outline" className="mb-4 px-4 py-2">
                    <Truck className="w-4 h-4 mr-2" />
                    Real-time Tracking
                  </Badge>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                    Track Your Return Status
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Stay updated on your return request with our real-time tracking system
                  </p>
                </motion.div>

                <ReturnTracker />
              </motion.div>
            )}
          </div>
        </section>

        {/* Enhanced Contact Support */}
        <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div 
                className="relative inline-block mb-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl scale-150"></div>
                <div className="relative bg-gradient-to-br from-primary to-primary/80 p-6 rounded-full shadow-2xl">
                  <MessageCircle className="text-white" size={48} />
                </div>
              </motion.div>
              
              <Badge variant="secondary" className="mb-4 px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                24/7 Customer Support
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Need Help? We're Here for You
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Our dedicated customer service team is ready to assist you with any questions about returns and exchanges.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <motion.div 
                  className="group bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-xl mb-4 mx-auto group-hover:bg-green-500/20 transition-colors">
                    <MessageCircle className="text-green-500" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get instant help from our support team</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Start Chat
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="group bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-xl mb-4 mx-auto group-hover:bg-blue-500/20 transition-colors">
                    <Globe className="text-blue-500" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Email Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">Send us a detailed message</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Send Email
                  </Button>
                </motion.div>
                
                <motion.div 
                  className="group bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-xl mb-4 mx-auto group-hover:bg-purple-500/20 transition-colors">
                    <MessageCircle className="text-purple-500" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">Phone Support</h3>
                  <p className="text-sm text-muted-foreground mb-4">Call us for immediate assistance</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Call Now
                  </Button>
                </motion.div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" className="group">
                  <MessageCircle className="mr-2 group-hover:animate-pulse" size={20} />
                  Live Chat
                </Button>
                <Button variant="outline" size="lg" className="group">
                  <Link href="/contact" className="flex items-center">
                    <Globe className="mr-2 group-hover:animate-pulse" size={20} />
                    Contact Us
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
