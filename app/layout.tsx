import ClientOnly from '@/components/providers/ClientOnly';
import { FaviconProvider } from '@/components/providers/FaviconProvider';
import NextAuthProvider from '@/components/providers/NextAuthProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import AutoStartup from '@/components/startup/AutoStartup';
import ShoppingCart from '@/components/ui/shopping-cart';
import { Toaster } from '@/components/ui/toaster';
import StoreProvider from '@/lib/providers/StoreProvider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial']
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://tsrgallery.com'),
  title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Premium Fashion E-commerce Platform`,
  description: 'The most advanced e-commerce platform in Bangladesh with AI-powered features, smart logistics, and seamless shopping experience.',
  keywords: ['ecommerce', 'bangladesh', 'online shopping', 'smart commerce', 'ai shopping'],
  authors: [{ name: 'Redwan Rakib' }],
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Premium Fashion E-commerce Platform`,
    description: 'Experience the future of online shopping in Bangladesh',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://tsrgallery.com',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: process.env.NEXT_PUBLIC_SITE_NAME || 'TSR Gallery',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} font-sans`}>
      <head>
        <Script
          id="hydration-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent hydration mismatches
              if (typeof window !== 'undefined') {
                window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
                window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider>
            <StoreProvider>
              {children}
              <ClientOnly>
                <ShoppingCart />
              </ClientOnly>
              <ClientOnly>
                <Toaster />
              </ClientOnly>
              <ClientOnly>
                <FaviconProvider />
              </ClientOnly>
              <ClientOnly>
                <AutoStartup />
              </ClientOnly>
            </StoreProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}