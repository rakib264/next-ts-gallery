'use client';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/use-settings';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

// TypeScript interfaces
interface SignupFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormikHelpers {
  setSubmitting: (isSubmitting: boolean) => void;
  setFieldError: (field: string, message: string) => void;
}

interface AuthSettings {
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  emailAuthEnabled: boolean;
  otpAuthEnabled: boolean;
  allowSelfRegistration: boolean;
}

// Validation schema with Bangladeshi phone number format
const SignupSchema = Yup.object().shape({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(
      /^(\+880|880|0)?(1[3-9]\d{8})$/,
      'Please enter a valid Bangladeshi phone number (e.g., +8801712345678, 01712345678)'
    )
    .required('Phone number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    // .matches(
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    //   'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    // )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authSettings, setAuthSettings] = useState<AuthSettings>({
    googleAuthEnabled: false,
    facebookAuthEnabled: false,
    emailAuthEnabled: true,
    otpAuthEnabled: true,
    allowSelfRegistration: true,
  });
  const router = useRouter();
  const { settings } = useSettings();
  const { siteName, logo1 } = settings ?? {};

  useEffect(() => {
    // Fetch authentication settings
    const fetchAuthSettings = async () => {
      try {
        const response = await fetch('/api/auth-settings');
        if (response.ok) {
          const settings = await response.json();
          setAuthSettings(settings);
        }
      } catch (error) {
        console.error('Failed to fetch auth settings:', error);
      }
    };

    fetchAuthSettings();
  }, []);

  const handleSubmit = async (values: SignupFormValues, { setSubmitting, setFieldError }: FormikHelpers) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          password: values.password,
        }),
      });

      if (response.ok) {
        router.push('/auth/signin?message=Account created successfully');
      } else {
        const data = await response.json();
        if (data.error === 'Email already exists') {
          setFieldError('email', 'Email already exists');
        } else {
          setFieldError('general', data.error || 'Something went wrong');
        }
      }
    } catch (error) {
      setFieldError('general', 'Something went wrong');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: 'google' | 'facebook') => {
    try {
      await signIn(provider, { callbackUrl: '/' });
    } catch (error) {
      console.error('Social sign-in error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <style jsx>{`
        .auth-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .auth-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .auth-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 2px;
        }
        .auth-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .auth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        @media (max-width: 640px) {
          .auth-scrollbar {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }
      `}</style>
      {/* Header for desktop */}
      <div className="mb-8 sm:mb-12 md:mb-16 lg:mb-20">
        <Header />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <div className="max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-160px)] overflow-y-auto auth-scrollbar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full"
            >
              <Card className="shadow-2xl border-0 w-full mx-auto bg-white/90 backdrop-blur-sm" style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)' }}>
                <CardHeader className="text-center pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8 pt-6 sm:pt-8">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                    className="mb-4 sm:mb-6"
                  >
                    <Link href="/" className="flex justify-center">
                      {logo1 ? (
                        <div className="relative flex items-center justify-center">
                          <img
                            src={logo1 ?? '/lib/assets/images/tsrgallery.png'}
                            alt={siteName ?? process.env.NEXT_PUBLIC_SITE_NAME}
                            className="h-8 sm:h-10 w-auto relative z-10"
                          />
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center">
                          <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-full blur-sm opacity-30 -z-10"></div>
                          <div className="font-bold text-lg sm:text-xl md:text-2xl bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent relative z-10">
                            {siteName ?? process.env.NEXT_PUBLIC_SITE_NAME}
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                      Create Account
                    </CardTitle>
                    <p className="text-muted-foreground text-sm sm:text-base">
                      Join {siteName ?? process.env.NEXT_PUBLIC_SITE_NAME} today
                    </p>
                  </motion.div>
                </CardHeader>

                <CardContent className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                  {/* Social Authentication Buttons */}
                  {(authSettings.googleAuthEnabled || authSettings.facebookAuthEnabled) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="space-y-2 sm:space-y-3 mb-6 sm:mb-8"
                    >
                      {authSettings.googleAuthEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialSignIn('google')}
                          className="w-full h-10 sm:h-12 text-xs sm:text-sm md:text-base font-medium border-2 border-primary-200 hover:border-primary-300 hover:shadow-lg hover:bg-primary-50 transition-all duration-300 group"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Continue with Google
                        </Button>
                      )}

                      {authSettings.facebookAuthEnabled && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleSocialSignIn('facebook')}
                          className="w-full h-10 sm:h-12 text-xs sm:text-sm md:text-base font-medium border-2 border-secondary-200 hover:border-secondary-300 hover:shadow-lg hover:bg-secondary-50 transition-all duration-300 group"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200" fill="#1877F2" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Continue with Facebook
                        </Button>
                      )}

                      <div className="relative my-4 sm:my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-primary-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-3 sm:px-4 text-muted-foreground font-medium">Or continue with</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Formik
                    initialValues={{
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      password: '',
                      confirmPassword: '',
                      general: '',
                    }}
                    validationSchema={SignupSchema}
                    onSubmit={handleSubmit}
                    validateOnChange={true}
                    validateOnBlur={true}
                  >
                    {({ errors, touched, isSubmitting, isValid, dirty }) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        <Form className="space-y-4 sm:space-y-6">
                          {errors.general && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm"
                            >
                              {errors.general}
                            </motion.div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2 sm:space-y-3">
                              <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">First Name</label>
                              <div className="relative group">
                                <User className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                                <Field
                                  as={Input}
                                  name="firstName"
                                  id="firstName"
                                  type="text"
                                  placeholder="First name"
                                  className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                    errors.firstName && touched.firstName 
                                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                      : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                  }`}
                                />
                              </div>
                              <ErrorMessage name="firstName" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div className="space-y-2 sm:space-y-3">
                              <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Last Name</label>
                              <div className="relative group">
                                <User className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                                <Field
                                  as={Input}
                                  name="lastName"
                                  id="lastName"
                                  type="text"
                                  placeholder="Last name"
                                  className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                    errors.lastName && touched.lastName 
                                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                      : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                  }`}
                                />
                              </div>
                              <ErrorMessage name="lastName" component="div" className="text-red-500 text-xs mt-1" />
                            </div>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Email Address</label>
                            <div className="relative group">
                              <Mail className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                              <Field
                                as={Input}
                                name="email"
                                id="email"
                                type="email"
                                placeholder="Enter your email address"
                                className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                  errors.email && touched.email 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                    : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                }`}
                              />
                            </div>
                            <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Phone Number</label>
                            <div className="relative group">
                              <Phone className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                              <Field
                                as={Input}
                                name="phone"
                                id="phone"
                                type="tel"
                                placeholder="+88017******78"
                                className={`pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                  errors.phone && touched.phone 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                    : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                }`}
                              />
                            </div>
                            <ErrorMessage name="phone" component="div" className="text-red-500 text-xs mt-1" />
                            <p className="text-xs text-muted-foreground">
                              Format: 88017******78 or 017******78
                            </p>
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Password</label>
                            <div className="relative group">
                              <Lock className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                              <Field
                                as={Input}
                                name="password"
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a password"
                                className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                  errors.password && touched.password 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                    : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors duration-200"
                              >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                          </div>

                          <div className="space-y-2 sm:space-y-3">
                            <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">Confirm Password</label>
                            <div className="relative group">
                              <Lock className="absolute z-10 left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary-600 transition-colors duration-200" size={16} />
                              <Field
                                as={Input}
                                name="confirmPassword"
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className={`pl-10 sm:pl-12 pr-10 sm:pr-12 h-10 sm:h-12 text-sm sm:text-base border-2 transition-all duration-200 ${
                                  errors.confirmPassword && touched.confirmPassword 
                                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                    : 'border-primary-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary-600 transition-colors duration-200"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-xs mt-1" />
                          </div>

                          <Button
                            type="submit"
                            disabled={loading || isSubmitting || !isValid || !dirty}
                            className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <>
                                Create Account
                                <ArrowRight className="ml-1 sm:ml-2" size={16} />
                              </>
                            )}
                          </Button>
                        </Form>
                      </motion.div>
                    )}
                  </Formik>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="mt-6 sm:mt-8 text-center"
                  >
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 hover:underline font-semibold transition-colors duration-200">
                        Sign in
                      </Link>
                    </p>
                  </motion.div>
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