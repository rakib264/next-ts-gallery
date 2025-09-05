'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/use-settings';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Mail, Phone, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

type Step = 'method' | 'phone' | 'email' | 'otp' | 'password';
type VerificationMethod = 'phone' | 'email';

interface PhoneFormValues {
  phone: string;
}

interface EmailFormValues {
  email: string;
}

interface OTPFormValues {
  otp: string;
}

interface PasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const phoneValidationSchema = Yup.object({
  phone: Yup.string()
    .required('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/, 'Invalid phone number format'),
});

const emailValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .required('Verification code is required')
    .matches(/^[0-9]{6}$/, 'Code must be 6 digits'),
});

const passwordValidationSchema = Yup.object({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('method');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [authSettings, setAuthSettings] = useState({
    otpAuthEnabled: false,
    requireEmailVerification: false
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const router = useRouter();
  const { settings } = useSettings();
  const { siteName, logo1 } = settings ?? {};

  useEffect(() => {
    const fetchAuthSettings = async () => {
      try {
        const response = await fetch('/api/auth-settings');
        if (response.ok) {
          const settings = await response.json();
          setAuthSettings({
            otpAuthEnabled: settings.otpAuthEnabled,
            requireEmailVerification: settings.requireEmailVerification
          });
        }
      } catch (error) {
        console.error('Failed to fetch auth settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchAuthSettings();
  }, []);

  const handleMethodSelection = (method: VerificationMethod) => {
    setVerificationMethod(method);
    if (method === 'phone') {
      setStep('phone');
    } else {
      setStep('email');
    }
  };

  const handleSendOTP = async (values: PhoneFormValues | EmailFormValues, { setSubmitting }: any) => {
    setLoading(true);
    setError('');

    try {
      const payload = verificationMethod === 'phone' 
        ? { phone: (values as PhoneFormValues).phone, type: 'password_reset' }
        : { email: (values as EmailFormValues).email, type: 'password_reset' };

      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP sent successfully');
        setStep('otp');
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleVerifyOTP = async (values: OTPFormValues, { setSubmitting }: any) => {
    setLoading(true);
    setError('');

    try {
      const payload = verificationMethod === 'phone' 
        ? { phone, otp: values.otp, type: 'password_reset' }
        : { email, otp: values.otp, type: 'password_reset' };

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP verified successfully');
        setStep('password');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (values: PasswordFormValues, { setSubmitting }: any) => {
    setLoading(true);
    setError('');

    try {
      const payload = verificationMethod === 'phone' 
        ? { phone, newPassword: values.newPassword }
        : { email, newPassword: values.newPassword };

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password reset successfully');
        setTimeout(() => {
          router.push('/auth/signin?message=Password reset successfully');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'method':
        const availableMethods = [];
        
        if (authSettings.otpAuthEnabled) {
          availableMethods.push(
            <Button
              key="phone"
              type="button"
              variant="outline"
              onClick={() => handleMethodSelection('phone')}
              className="h-16 text-left px-6"
            >
              <div className="flex items-center space-x-4">
                <Phone className="text-primary" size={24} />
                <div>
                  <div className="font-medium">Phone Number</div>
                  <div className="text-sm text-muted-foreground">
                    Receive code via SMS
                  </div>
                </div>
              </div>
            </Button>
          );
        }

        if (authSettings.requireEmailVerification) {
          availableMethods.push(
            <Button
              key="email"
              type="button"
              variant="outline"
              onClick={() => handleMethodSelection('email')}
              className="h-16 text-left px-6"
            >
              <div className="flex items-center space-x-4">
                <Mail className="text-primary" size={24} />
                <div>
                  <div className="font-medium">Email Address</div>
                  <div className="text-sm text-muted-foreground">
                    Receive code via email
                  </div>
                </div>
              </div>
            </Button>
          );
        }

        if (availableMethods.length === 0) {
          return (
            <div className="text-center space-y-4">
              <div className="text-muted-foreground">
                Password reset is currently unavailable. Please contact support.
              </div>
            </div>
          );
        }

        if (availableMethods.length === 1) {
          // Auto-select the only available method
          const method = authSettings.otpAuthEnabled ? 'phone' : 'email';
          setTimeout(() => handleMethodSelection(method), 0);
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-4">Choose Verification Method</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Select how you'd like to receive your verification code
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {availableMethods}
            </div>
          </div>
        );

      case 'phone':
        return (
          <Formik
            initialValues={{ phone }}
            validationSchema={phoneValidationSchema}
            onSubmit={handleSendOTP}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Field name="phone">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="tel"
                          placeholder="Enter your phone number"
                          className="pl-10 h-12"
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-muted-foreground">
                    We'll send a verification code to this number
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('method')}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="flex-1 h-12 text-lg font-medium"
                  >
                    {loading || isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        );

      case 'email':
        return (
          <Formik
            initialValues={{ email }}
            validationSchema={emailValidationSchema}
            onSubmit={handleSendOTP}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Field name="email">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email address"
                          className="pl-10 h-12"
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-muted-foreground">
                    We'll send a verification code to this email
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('method')}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="flex-1 h-12 text-lg font-medium"
                  >
                    {loading || isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Send OTP
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        );

      case 'otp':
        return (
          <Formik
            initialValues={{ otp }}
            validationSchema={otpValidationSchema}
            onSubmit={handleVerifyOTP}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Code</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Field name="otp">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter 6-digit code"
                          className="pl-10 h-12 text-center text-lg tracking-widest"
                          maxLength={6}
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="otp" component="div" className="text-red-500 text-sm mt-1" />
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to {verificationMethod === 'phone' ? phone : email}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(verificationMethod === 'phone' ? 'phone' : 'email')}
                    className="flex-1 h-12"
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="flex-1 h-12 text-lg font-medium"
                  >
                    {loading || isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Verify
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const values = verificationMethod === 'phone' ? { phone } : { email };
                      handleSendOTP(values, { setSubmitting: () => {} });
                    }}
                    className="text-sm text-primary hover:underline"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        );

      case 'password':
        return (
          <Formik
            initialValues={{ newPassword, confirmPassword }}
            validationSchema={passwordValidationSchema}
            onSubmit={handleResetPassword}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Field name="newPassword">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="password"
                          placeholder="Enter new password"
                          className="pl-10 h-12"
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="newPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Field name="confirmPassword">
                      {({ field }: any) => (
                        <Input
                          {...field}
                          type="password"
                          placeholder="Confirm new password"
                          className="pl-10 h-12"
                        />
                      )}
                    </Field>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <Button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full h-12 text-lg font-medium"
                >
                  {loading || isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        );
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'method': return 'Forgot Password';
      case 'phone': return 'Phone Verification';
      case 'email': return 'Email Verification';
      case 'otp': return 'Verify Code';
      case 'password': return 'Reset Password';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'method': return 'Choose how you want to verify your identity';
      case 'phone': return 'Enter your phone number to receive a verification code';
      case 'email': return 'Enter your email address to receive a verification code';
      case 'otp': return 'Enter the verification code sent to your contact method';
      case 'password': return 'Create a new password for your account';
    }
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header for desktop */}
        <div className="hidden md:block">
          <Header />
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4 py-6 md:py-8">
          <div className="w-full max-w-md mx-auto">
            <div className="max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-160px)] overflow-y-auto auth-scrollbar">
              <Card className="shadow-2xl border-0 w-full mx-auto">
              <CardContent className="flex items-center justify-center py-16 px-4 md:px-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Footer for desktop */}
        <div className="hidden md:block">
          <Footer />
        </div>
        
        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <MobileBottomNav />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header for desktop */}
      <div className="mb-16">
        <Header />
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center p-4 py-6 md:py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-160px)] overflow-y-auto auth-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <Card className="shadow-2xl border-0 w-full mx-auto">
          <CardHeader className="text-center pb-4 md:pb-8 px-4 md:px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className='flex justify-center mb-4'
            >
              {logo1 ? (
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="text-white" size={24} />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <Lock className="text-white" size={24} />
                </div>
              )}
            </motion.div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {getStepTitle()}
            </CardTitle>
            <p className="text-muted-foreground">{getStepDescription()}</p>
          </CardHeader>

          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6"
              >
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm mb-6"
              >
                {success}
              </motion.div>
            )}

            {renderStepContent()}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Remember your password?{' '}
                <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
              </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Footer for desktop */}
      <div className="hidden md:block">
        <Footer />
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}