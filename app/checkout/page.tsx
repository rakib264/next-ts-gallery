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
  
  // Error dialog hook
  const { showError, ErrorDialogComponent } = useErrorDialog();
  
  // Geonames service instance (memoized to avoid recreation on every render)
  const geonamesService = useMemo(() => new GeonamesService(), []);
  
  // Formik + Yup for step validation
  const step1Schema = useMemo(() => Yup.object({
    firstName: Yup.string().trim().required('First name is required'),
    lastName: Yup.string().trim().required('Last name is required'),
    email: Yup.string().email('Invalid email').optional(),
    phone: Yup.string().trim().required('Phone is required'),
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
    validateOnMount: true,
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
    const district = (formik.values.district || formik.values.city || '').toLowerCase().trim();
    const isDhaka = district.includes('dhaka');
    const inside = courierSettings?.insideDhaka ?? 60;
    const outside = courierSettings?.outsideDhaka ?? 120;
    return isDhaka ? inside : outside;
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
      if (step === 1) {
        step1Schema.validateSync(formik.values, { abortEarly: false });
        return true;
      }
      if (step === 2) {
        step2Schema.validateSync(formik.values, { abortEarly: false });
        return true;
      }
      if (step === 3) {
        step3Schema.validateSync(formik.values, { abortEarly: false });
        return true;
      }
      return true;
    } catch {
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
        deliveryType: 'regular',
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-4 md:py-8 mt-16 md:mt-20 mb-20 md:mb-0">
        {/* Progress Steps */}
        <div className="mb-6 md:mb-8">
          {/* Mobile Progress Steps - Vertical/Compact */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Step {currentStep} of {steps.length}</h2>
              <span className="text-sm text-muted-foreground">
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
                <div className={`flex items-center space-x-2 ${
                  currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
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
                  <span className="font-medium">{step.title}</span>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User size={20} />
                        <span>Billing Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            {...formik.getFieldProps('firstName')}
                            placeholder="First Name"
                            required
                          />
                          {formik.touched.firstName && formik.errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...formik.getFieldProps('lastName')}
                            placeholder="Last Name"
                            required
                          />
                          {formik.touched.lastName && formik.errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email (Optional)</Label>
                          <Input
                            id="email"
                            type="email"
                            {...formik.getFieldProps('email')}
                            placeholder="your@email.com"
                          />
                          {formik.touched.email && formik.errors.email && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone *</Label>
                          <Input
                            id="phone"
                            {...formik.getFieldProps('phone')}
                            placeholder="01721456789"
                            required
                          />
                          {formik.touched.phone && formik.errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          {...formik.getFieldProps('address')}
                          onChange={(e) => {
                            formik.handleChange(e);
                            formik.setFieldValue('coordinates', { lat: 0, lng: 0, divisionName: '', district: '', thanaOrUpazilaName: '', placeName: '', countryCode: '' });
                          }}
                          placeholder="House 23, Jigatala Bus stand"
                          required
                        />
                        {formik.touched.address && formik.errors.address && (
                          <p className="text-red-500 text-xs mt-1">{formik.errors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="division">Division *</Label>
                          <Input
                            id="division"
                            {...formik.getFieldProps('division')}
                            placeholder="Dhaka"
                            required
                          />
                          {formik.touched.division && formik.errors.division && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.division}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="district">District *</Label>
                          <Input
                            id="district"
                            {...formik.getFieldProps('district')}
                            placeholder="Dhaka"
                            required
                          />
                          {formik.touched.district && formik.errors.district && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.district}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            {...formik.getFieldProps('postalCode')}
                            onChange={(e) => {
                              formik.handleChange(e);
                              // Clear coordinates when postal code changes to ensure fresh geocoding on next step
                              formik.setFieldValue('coordinates', { lat: 0, lng: 0, divisionName: '', district: '', thanaOrUpazilaName: '', placeName: '', countryCode: '' });
                            }}
                            placeholder="1209"
                          />
                          {formik.touched.postalCode && formik.errors.postalCode && (
                            <p className="text-red-500 text-xs mt-1">{formik.errors.postalCode}</p>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CreditCard size={20} />
                        <span>Payment Method</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Delivery Type */}
                      <div>
                        <Label className="text-base font-medium">Delivery Charge</Label>
                        <div className="mt-3 p-4 border rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-medium">{(formik.values.district || formik.values.city || '').toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka'}</p>
                            <p className="text-sm text-muted-foreground">Calculated based on district</p>
                          </div>
                          <span className="font-medium">৳{calculateShipping()}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Methods */}
                      <div>
                        <Label className="text-base font-medium">Payment Method</Label>
                        <RadioGroup value={formik.values.method} onValueChange={(value) => formik.setFieldValue('method', value)}>
                          <div className="space-y-3">
                            {/* Cash on Delivery */}
                            {paymentSettings.codEnabled && (
                              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                <RadioGroupItem value="cod" id="cod" />
                                <div className="flex-1">
                                  <Label htmlFor="cod" className="font-medium">Cash on Delivery</Label>
                                  <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                                </div>
                                <Truck size={20} className="text-muted-foreground" />
                              </div>
                            )}

                            {/* SSLCommerz */}
                             {paymentSettings.isPaymentGatewayEnabled && (
                              <div className="flex items-center space-x-3 p-4 border rounded-lg">
                                <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                                <div className="flex-1">
                                  <Label htmlFor="sslcommerz" className="font-medium">Online Payment</Label>
                                  <p className="text-sm text-muted-foreground">
                                    Pay securely with credit/debit card, mobile banking, or internet banking
                                  </p>
                                </div>
                                <CreditCard size={20} className="text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </RadioGroup>
                        {!validateStep(2) && (
                          <p className="text-red-500 text-xs mt-2">Please select a payment method.</p>
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle size={20} />
                        <span>Order Review</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="font-medium mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div key={`${item.id}-${item.variant || 'default'}`} className="flex items-center space-x-4 p-4 border rounded-lg">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  {item.variant && <span>Variant: {item.variant}</span>}
                                  <span>Qty: {item.quantity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">৳{formatNumber(item.price * item.quantity)}</div>
                                <div className="text-sm text-muted-foreground">৳{item.price} each</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Billing Information Summary */}
                      <div>
                        <h3 className="font-medium mb-4">Billing Information</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p><strong>Name:</strong> {formik.values.firstName} {formik.values.lastName}</p>
                          <p><strong>Email:</strong> {formik.values.email}</p>
                          <p><strong>Phone:</strong> {formik.values.phone}</p>
                          <p><strong>Address:</strong> {formik.values.address}{formik.values.district ? `, ${formik.values.district}` : ''}{formik.values.division ? `, ${formik.values.division}` : ''}{formik.values.postalCode ? `, ${formik.values.postalCode}` : ''}</p>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Information Summary */}
                      <div>
                        <h3 className="font-medium mb-4">Payment & Delivery</h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <p><strong>Payment Method:</strong> {
                            formik.values.method === 'cod' ? 'Cash on Delivery' : 'Online Payment'
                          }</p>
                          <p><strong>Delivery Area:</strong> { (formik.values.district || formik.values.city || '').toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka' }</p>
                        </div>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <Label htmlFor="notes">Order Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          {...formik.getFieldProps('notes')}
                          placeholder="Any special instructions for your order..."
                          rows={3}
                        />
                        {formik.touched.notes && formik.errors.notes && (
                          <p className="text-red-500 text-xs mt-1">{formik.errors.notes}</p>
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
                className="flex items-center justify-center space-x-2 order-2 sm:order-1"
                size="lg"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!validateStep(currentStep)}
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
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingBag size={20} />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasHydrated ? (
                  <>
                    {/* Items Count */}
                    <div className="flex justify-between text-sm">
                      <span suppressHydrationWarning>
                        Items ({items.reduce((sum, item) => sum + item.quantity, 0)})
                      </span>
                      <span suppressHydrationWarning>৳{formatNumber(total)}</span>
                    </div>

                    {/* Shipping */}
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>৳{shipping}</span>
                    </div>

                    {/* Discount */}
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span suppressHydrationWarning>-৳{formatNumber(discount)}</span>
                      </div>
                    )}

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between font-medium text-lg">
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
                            className="text-green-600 hover:text-green-700"
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
                              className="flex-1"
                            />
                            <Button
                              variant="outline"
                              onClick={handleCouponApply}
                              disabled={couponLoading || !couponCode.trim()}
                              size="sm"
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
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                      <span className="text-sm text-muted-foreground">Secure Checkout</span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Server-first placeholder to avoid hydration mismatch */}
                    <div className="flex justify-between text-sm">
                      <span>Items (0)</span>
                      <span>৳0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>৳{shipping}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span>৳{formatNumber(shipping)}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-9 bg-gray-100 rounded" />
                    </div>
                    <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <div className="w-4 h-4 bg-green-500 rounded-full" />
                      <span className="text-sm text-muted-foreground">Secure Checkout</span>
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