'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useErrorDialog } from '@/components/ui/error-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCourierSettings } from '@/hooks/use-settings';
import GeonamesService from '@/lib/geonames';
import { applyCoupon, clearCart, removeCoupon } from '@/lib/store/slices/cartSlice';
import { RootState } from '@/lib/store/store';
import { formatNumber } from '@/lib/utils';
import { useFormik } from 'formik';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight,
  CheckCircle,
  CreditCard,
  ShoppingBag, Tag,
  Truck,
  User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { items, total, discount, couponCode: appliedCoupon } = useSelector((state: RootState) => state.cart);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState({
    isPaymentGatewayEnabled: false,
    codEnabled: true
  });
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [displayErrors, setDisplayErrors] = useState<{[key: string]: string}>({});

  // Function to clear specific field error when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (displayErrors[fieldName]) {
      const newErrors = { ...displayErrors };
      delete newErrors[fieldName];
      setDisplayErrors(newErrors);
    }
  };
  
  // Error dialog hook
  const { showError, ErrorDialogComponent } = useErrorDialog();
  
  // Geonames service instance (memoized to avoid recreation on every render)
  const geonamesService = useMemo(() => new GeonamesService(), []);
  
  // Formik + Yup for step validation
  const step1Schema = useMemo(() => Yup.object({
    firstName: Yup.string().trim().required('First name is required'),
    lastName: Yup.string().trim().required('Last name is required'),
    email: Yup.string().email('Invalid email').optional(),
    phone: Yup.string().trim().matches(/^(\+880|880|0)?(1[3-9]\d{8})$/, 'Invalid phone number').required('Phone is required'),
    address: Yup.string().trim().required('Address is required'),
    division: Yup.string().trim().required('Division is required'),
    district: Yup.string().trim().required('District is required'),
    postalCode: Yup.string().trim().optional(),
  }), []);

  const step2Schema = useMemo(() => Yup.object({
    method: Yup.mixed<'cod' | 'sslcommerz'>().oneOf(['cod', 'sslcommerz']).required('Payment method is required'),
  }), []);

  const step3Schema = useMemo(() => Yup.object({
    notes: Yup.string().max(500, 'Notes must be at most 500 characters').optional(),
  }), []);

  const formik = useFormik({
    enableReinitialize: true,
    validateOnMount: false, // Disable auto-validation to handle it manually
    initialValues: {
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
      email: session?.user?.email || '',
      phone: '',
      address: '',
      city: '',
      district: '',
      division: '',
      postalCode: '',
      coordinates: { 
        lat: 0, 
        lng: 0,
        divisionName: '',
        district: '',
        thanaOrUpazilaName: '',
        placeName: '',
        countryCode: ''
      },
      method: 'cod' as 'cod' | 'sslcommerz',
      notes: ''
    },
    onSubmit: () => {}
  });

  // Prevent hydration mismatches by rendering client-derived values only after mount
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (items.length === 0 && hasHydrated && !loading && !orderPlaced) {
      router.push('/products');
    }
    fetchPaymentSettings();
  }, [items.length, hasHydrated, loading, orderPlaced, router]);

  const fetchPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment/settings');
      const data = await response.json();
      setPaymentSettings(data);
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const { settings: courierSettings } = useCourierSettings();

  const calculateShipping = () => {
    // Only calculate shipping if we're past step 1 and have district information
    if (currentStep === 1 || !formik.values.district?.trim()) {
      return 0;
    }
    
    console.log("shipping district", formik.values);
    const district = (formik.values.district || formik.values.city || '').toLowerCase().trim();
    const isDhaka = district.includes('dhaka');
    console.log("isDhaka", isDhaka);
    const inside = courierSettings?.insideDhaka ?? 60;
    const outside = courierSettings?.outsideDhaka ?? 120;
    return isDhaka ? inside : outside;
  };

  const getDeliveryType = () => {
    // Only determine delivery type if we have district information
    if (!formik.values.district?.trim()) {
      return 'regular';
    }
    
    const district = (formik.values.district || formik.values.city || '').toLowerCase().trim();
    const isDhaka = district.includes('dhaka');
    return isDhaka ? 'Inside Dhaka' : 'Outside Dhaka';
  };

  const handleCouponApply = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(applyCoupon({ code: couponCode, discount: data.discount }));
        setCouponCode('');
      } else {
        showError(data.error || 'Invalid coupon code', 'Coupon Error');
      }
    } catch (error) {
      showError('Failed to apply coupon', 'Error');
    } finally {
      setCouponLoading(false);
    }
  };

  // Removed autocomplete selection handler as manual entry is used

  const validateStep = (step: number) => {
    try {
      let schema;
      if (step === 1) {
        schema = step1Schema;
      } else if (step === 2) {
        schema = step2Schema;
      } else if (step === 3) {
        schema = step3Schema;
      } else {
        return true;
      }

      // Validate using the appropriate schema
      schema.validateSync(formik.values, { abortEarly: false });
      
      // Clear any existing errors for this step
      formik.setErrors({});
      setDisplayErrors({});
      return true;
    } catch (error) {
      // Set validation errors in formik
      if (error instanceof Yup.ValidationError) {
        const errors: { [key: string]: string } = {};
        error.inner.forEach((err) => {
          if (err.path) {
            errors[err.path] = err.message;
          }
        });
        
        console.log('Validation errors:', errors);
        
        // Set errors in both formik and local state for reliable display
        formik.setErrors(errors);
        setDisplayErrors(errors);
        
        // Mark all fields as touched to show errors
        const touched: { [key: string]: boolean } = {};
        Object.keys(errors).forEach(key => {
          touched[key] = true;
        });
        formik.setTouched(touched);
        
        // Trigger re-render to show errors
        setValidationTrigger(prev => prev + 1);
        
        console.log('Formik errors after setting:', errors);
        console.log('Display errors set:', errors);
      }
      return false;
    }
  };

  const ensureGeocodedIfNeeded = async () => {
    try {
      if (currentStep === 1) {
        // Geonames service requires postal code for geocoding
        if (!formik.values.postalCode?.trim()) return;

        const result = await geonamesService.geocodeByPostalCode(formik.values.postalCode.trim(), 'BD');
        
        if (result) {
          // Store coordinates object with Geonames data
          const coordinates = {
            lat: result.lat,
            lng: result.lng,
            // Additional Geonames data for potential future use
            divisionName: result.divisionName,
            district: result.district,
            thanaOrUpazilaName: result.thanaOrUpazilaName,
            placeName: result.placeName,
            countryCode: result.countryCode
          };
          
          formik.setFieldValue('coordinates', coordinates);
          
          // Optionally auto-fill division and district if not already provided
          if (!formik.values.division?.trim() && result.divisionName) {
            formik.setFieldValue('division', result.divisionName);
          }
          if (!formik.values.district?.trim() && result.district) {
            formik.setFieldValue('district', result.district);
          }
        }
      }
    } catch (e) {
      // Silently ignore to avoid blocking step transition
      console.error('Geocoding error (non-blocking):', e);
    }
  };

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      await ensureGeocodedIfNeeded();
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const shipping = calculateShipping();
  const finalTotal = total - discount + shipping;

  const steps = [
    { number: 1, title: 'Billing Information', icon: User },
    { number: 2, title: 'Payment Method', icon: CreditCard },
    { number: 3, title: 'Order Review', icon: CheckCircle }
  ];

  const placeOrder = async () => {
    setLoading(true);
    try {
      // Create order first
      const shippingAddress = {
        name: `${formik.values.firstName} ${formik.values.lastName}`.trim(),
        phone: formik.values.phone,
        email: formik.values.email,
        street: formik.values.address,
        city: formik.values.city || formik.values.district || formik.values.division,
        district: formik.values.district || '',
        division: formik.values.division || '',
        postalCode: formik.values.postalCode || '',
        coordinates: formik.values.coordinates && (formik.values.coordinates.lat !== 0 || formik.values.coordinates.lng !== 0)
          ? {
              lat: formik.values.coordinates.lat,
              lng: formik.values.coordinates.lng,
              // Include additional Geonames data if available
              ...(formik.values.coordinates.divisionName && {
                divisionName: formik.values.coordinates.divisionName,
                district: formik.values.coordinates.district,
                thanaOrUpazilaName: formik.values.coordinates.thanaOrUpazilaName,
                placeName: formik.values.coordinates.placeName,
                countryCode: formik.values.coordinates.countryCode
              })
            }
          : undefined
      };

      const orderData = {
        items: items.map(item => ({
          product: item.id,
          name: item.name,
          quantity: item.quantity,
          variant: item.variant
        })),
        paymentMethod: formik.values.method,
        shippingCost: shipping,
        discount,
        couponCode: appliedCoupon || undefined,
        shippingAddress,
        billingAddress: shippingAddress,
        deliveryType: getDeliveryType(),
        notes: formik.values.notes
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        const orderId = data.order._id;
        
        // Handle payment method
        if (formik.values.method === 'sslcommerz') {
          // Initiate SSLCommerz payment
          const paymentResponse = await fetch('/api/payment/sslcommerz/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId })
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.success) {
            // Clear cart and redirect to payment gateway
            dispatch(clearCart());
            window.location.href = paymentData.paymentUrl;
          } else {
            throw new Error(paymentData.error || 'Payment initiation failed');
          }
        } else {
          // COD - redirect to order confirmation first to avoid checkout empty-cart redirect
          setOrderPlaced(true);
          router.push(`/orders/${orderId}?success=true`);
          setTimeout(() => dispatch(clearCart()), 0);
        }
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      showError(error instanceof Error ? error.message : 'Failed to place order', 'Order Error');
    } finally {
      setLoading(false);
    }
  };

  console.log("formik.errors", formik.errors);
  console.log("formik.touched", formik.touched);
  console.log("displayErrors", displayErrors);
  console.log("currentStep", currentStep);
  console.log("validationTrigger", validationTrigger);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-6 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Progress Steps */}
        <div className="mb-6">
          {/* Mobile Progress Steps - Vertical/Compact */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Step {currentStep} of {steps.length}</h2>
              <span className="text-sm text-gray-600">
                {steps[currentStep - 1]?.title}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Desktop Progress Steps - Horizontal */}
          <div className="hidden md:flex items-center justify-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center space-x-3 ${
                  currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
                    currentStep >= step.number 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle size={20} />
                    ) : (
                      <step.icon size={20} />
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Billing Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-gray-900">
                        <div className="p-2 bg-primary rounded-lg">
                          <User size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold">Billing Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Name Fields - Always in single row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="firstName" className="text-gray-700 font-medium text-sm">First Name *</Label>
                          <Input
                            id="firstName"
                            {...formik.getFieldProps('firstName')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              clearFieldError('firstName');
                            }}
                            placeholder="First Name"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.firstName && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-gray-700 font-medium text-sm">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...formik.getFieldProps('lastName')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              clearFieldError('lastName');
                            }}
                            placeholder="Last Name"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.lastName && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      {/* Contact Fields - Always in a single row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="email" className="text-gray-700 font-medium text-sm">Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            {...formik.getFieldProps('email')}
                            placeholder="your@email.com"
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.email && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.email}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">Phone *</Label>
                          <Input
                            id="phone"
                            {...formik.getFieldProps('phone')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              clearFieldError('phone');
                            }}
                            placeholder="01721456789"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.phone && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Address Field - Full width */}
                      <div>
                        <Label htmlFor="address" className="text-gray-700 font-medium text-sm">Address *</Label>
                        <Input
                          id="address"
                          {...formik.getFieldProps('address')}
                          onChange={(e) => {
                            formik.handleChange(e);
                            clearFieldError('address');
                            formik.setFieldValue('coordinates', { lat: 0, lng: 0, divisionName: '', district: '', thanaOrUpazilaName: '', placeName: '', countryCode: '' });
                          }}
                          placeholder="House 23, Jigatala Bus stand"
                          required
                          className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                        />
                        {displayErrors.address && (
                          <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.address}</p>
                        )}
                      </div>

                      {/* Location Fields - 2 columns on mobile, 3 columns on large screens */}
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="division" className="text-gray-700 font-medium text-sm">Division *</Label>
                          <Input
                            id="division"
                            {...formik.getFieldProps('division')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              clearFieldError('division');
                            }}
                            placeholder="Dhaka"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.division && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.division}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="district" className="text-gray-700 font-medium text-sm">District *</Label>
                          <Input
                            id="district"
                            {...formik.getFieldProps('district')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              clearFieldError('district');
                            }}
                            placeholder="Dhaka"
                            required
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.district && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.district}</p>
                          )}
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                          <Label htmlFor="postalCode" className="text-gray-700 font-medium text-sm">Postal Code</Label>
                          <Input
                            id="postalCode"
                            {...formik.getFieldProps('postalCode')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              // Clear coordinates when postal code changes to ensure fresh geocoding on next step
                              formik.setFieldValue('coordinates', { lat: 0, lng: 0, divisionName: '', district: '', thanaOrUpazilaName: '', placeName: '', countryCode: '' });
                            }}
                            placeholder="1209"
                            className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                          />
                          {displayErrors.postalCode && (
                            <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.postalCode}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-gray-900">
                        <div className="p-2 bg-primary rounded-lg">
                          <CreditCard size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold">Payment Method</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Delivery Type */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Delivery Charge</Label>
                        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{getDeliveryType()}</p>
                            <p className="text-sm text-gray-600">Calculated based on district</p>
                          </div>
                          <span className="font-bold text-lg text-gray-900">৳{calculateShipping()}</span>
                        </div>
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Payment Methods */}
                      <div>
                        <Label className="text-base font-semibold text-gray-900">Payment Method</Label>
                        <RadioGroup value={formik.values.method} onValueChange={(value) => formik.setFieldValue('method', value)}>
                          <div className="space-y-3 mt-3">
                            {/* Cash on Delivery */}
                            {paymentSettings.codEnabled && (
                              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                                <RadioGroupItem value="cod" id="cod" />
                                <div className="flex-1">
                                  <Label htmlFor="cod" className="font-semibold text-gray-900">Cash on Delivery</Label>
                                  <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                </div>
                                <Truck size={20} className="text-gray-600" />
                              </div>
                            )}

                            {/* SSLCommerz */}
                             {paymentSettings.isPaymentGatewayEnabled && (
                              <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors">
                                <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                                <div className="flex-1">
                                  <Label htmlFor="sslcommerz" className="font-semibold text-gray-900">Online Payment</Label>
                                  <p className="text-sm text-gray-600">
                                    Pay securely with credit/debit card, mobile banking, or internet banking
                                  </p>
                                </div>
                                <CreditCard size={20} className="text-gray-600" />
                              </div>
                            )}
                          </div>
                        </RadioGroup>
                        {displayErrors.method && (
                          <p className="text-red-600 text-xs mt-2 p-2">{displayErrors.method}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3 text-gray-900">
                        <div className="p-2 bg-primary rounded-lg">
                          <CheckCircle size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold">Order Review</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Order Items</h3>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.variant || 'default'}`} className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900">{item.name}</h4>
                                <div className="flex items-center space-x-3 text-xs text-gray-600">
                                  {item.variant && <span>Variant: {item.variant}</span>}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">৳{formatNumber(item.price * item.quantity)}</div>
                                <div className="text-xs text-gray-600">৳{item.price} each</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Billing Information Summary */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Billing Information</h3>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-200">
                          <p className="text-sm text-gray-900"><strong>Name:</strong> {formik.values.firstName} {formik.values.lastName}</p>
                          <p className="text-sm text-gray-900"><strong>Email:</strong> {formik.values.email}</p>
                          <p className="text-sm text-gray-900"><strong>Phone:</strong> {formik.values.phone}</p>
                          <p className="text-sm text-gray-900"><strong>Address:</strong> {formik.values.address}{formik.values.district ? `, ${formik.values.district}` : ''}{formik.values.division ? `, ${formik.values.division}` : ''}{formik.values.postalCode ? `, ${formik.values.postalCode}` : ''}</p>
                        </div>
                      </div>

                      <Separator className="bg-gray-200" />

                      {/* Payment Information Summary */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Payment & Delivery</h3>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2 border border-gray-200">
                          <p className="text-sm text-gray-900"><strong>Payment Method:</strong> {
                            formik.values.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'
                          }</p>
                          <p className="text-sm text-gray-900"><strong>Delivery Area:</strong> {getDeliveryType()}</p>
                        </div>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <Label htmlFor="notes" className="text-gray-700 font-medium text-sm">Order Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          {...formik.getFieldProps('notes')}
                          placeholder="Any special instructions for your order..."
                          rows={3}
                          className="border-gray-300 focus:border-primary focus:ring-primary text-sm"
                        />
                        {displayErrors.notes && (
                          <p className="text-red-600 text-xs mt-1 p-2">{displayErrors.notes}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center justify-center space-x-2 order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                size="lg"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  // disabled={!validateStep(currentStep)}
                  className="flex items-center justify-center space-x-2 order-1 sm:order-2"
                  size="lg"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </Button>
              ) : (
                <Button
                  onClick={placeOrder}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 order-1 sm:order-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>Place Order</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="order-1 lg:order-2 lg:col-span-1">
            <Card className="lg:sticky lg:top-4 bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="p-2 bg-primary rounded-lg">
                    <ShoppingBag size={18} className="text-white" />
                  </div>
                  <span className="text-xl font-bold">Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasHydrated ? (
                  <>
                    {/* Items Count */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600" suppressHydrationWarning>
                        Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                      </span>
                      <span className="font-semibold text-gray-900" suppressHydrationWarning>৳{formatNumber(total)}</span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-900">৳{shipping}</span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-semibold" suppressHydrationWarning>-৳{formatNumber(discount)}</span>
                      </div>
                    )}

                    <Separator className="bg-gray-200" />

                    {/* Total */}
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span suppressHydrationWarning>৳{formatNumber(finalTotal)}</span>
                    </div>

                    {/* Coupon Section */}
                    <div className="space-y-3">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Tag size={16} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(removeCoupon())}
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              className="flex-1 border-gray-300 focus:border-primary focus:ring-primary"
                            />
                            <Button
                              variant="outline"
                              onClick={handleCouponApply}
                              disabled={couponLoading || !couponCode.trim()}
                              size="default"
                              className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              {couponLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                'Apply'
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-gray-600">Secure Checkout</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Server-first placeholder to avoid hydration mismatch */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Items (0)</span>
                      <span className="font-semibold text-gray-900">৳0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-semibold text-gray-900">৳{shipping}</span>
                    </div>
                    <Separator className="bg-gray-200" />
                    <div className="flex justify-between font-bold text-lg text-gray-900">
                      <span>Total</span>
                      <span>৳{formatNumber(shipping)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-9 bg-gray-100 rounded" />
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <span className="text-sm text-gray-600">Secure Checkout</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Error Dialog */}
      <ErrorDialogComponent />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}