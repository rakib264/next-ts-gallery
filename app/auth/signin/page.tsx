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
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { getSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

interface AuthSettings {
  googleAuthEnabled: boolean;
  facebookAuthEnabled: boolean;
  emailAuthEnabled: boolean;
  otpAuthEnabled: boolean;
  allowSelfRegistration: boolean;
}

interface SignInFormValues {
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const initialValues: SignInFormValues = {
    email: '',
    password: '',
  };

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

  const handleSubmit = async (values: SignInFormValues, { setSubmitting }: any) => {
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        const session = await getSession();
        if (session?.user?.role === 'admin' || session?.user?.role === 'manager') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (error) {
      setError('Something went wrong');
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
    <div className="min-h-screen flex flex-col">
      {/* Header for desktop */}
      <div className="mb-20">
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
            <Link href="/" className="flex justify-center">
                             <>
                  {logo1 ? (
                    <img
                      src={logo1 ?? '/lib/assets/images/tsrgallery.png'}
                      alt={siteName ?? process.env.NEXT_PUBLIC_SITE_NAME}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <div className="font-bold text-xl bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                      {siteName ?? process.env.NEXT_PUBLIC_SITE_NAME}
                    </div>
                  )}
                </>
            </Link>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground">Sign in to your {siteName ?? process.env.NEXT_PUBLIC_SITE_NAME} account</p>
          </CardHeader>
          

          <CardContent className="px-4 md:px-6 pb-4 md:pb-6">
            {/* Social Authentication Buttons */}
            {(authSettings.googleAuthEnabled || authSettings.facebookAuthEnabled) && (
              <div className="space-y-3 mb-6">

                {authSettings.googleAuthEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignIn('google')}
                    className="w-full h-11 md:h-12 text-sm md:text-base font-medium border-2 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
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
                    className="w-full h-11 md:h-12 text-sm md:text-base font-medium border-2 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </Button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
              </div>
            )}

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Field name="email">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 h-10 md:h-12"
                          />
                        )}
                      </Field>
                    </div>
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Field name="password">
                        {({ field }: any) => (
                          <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 h-10 md:h-12"
                          />
                        )}
                      </Field>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="w-full h-11 md:h-12 text-base md:text-lg font-medium"
                  >
                    {loading || isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </Formik>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
                {' | '}
                <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </p>
            </div>

            {/* <div className="mt-6 pt-6 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Admin Login:</strong></p>
                <p>Email: redwan.rakib264@gmail.com</p>
                <p>Password: Admin@123</p>
              </div>
            </div> */}
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