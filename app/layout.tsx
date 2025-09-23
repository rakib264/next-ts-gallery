import ClientOnly from '@/components/providers/ClientOnly';
import { AutoStartup, FaviconProvider, NextAuthProvider, ShoppingBasket, ThemeProvider, Toaster } from '@/components/providers/ClientProviders';
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
  metadataBase: new URL('https://www.tsrgallery.com'),
  title: {
    default: 'TSR Gallery - Premium Fashion & Clothing Store',
    template: '%s | TSR Gallery'
  },
  description: 'TSR Gallery - Your premier destination for premium fashion and clothing. Discover exclusive collections, latest trends, and quality garments. Shop online with fast delivery across Bangladesh.',
  keywords: [
    'TSR Gallery', 'tsrgallery', 'TSR', 'premium fashion', 'clothing store', 
    'fashion Bangladesh', 'online shopping', 'trendy clothes', 'quality garments',
    'fashion boutique', 'style clothing', 'designer wear', 'fashion ecommerce'
  ],
  authors: [{ name: 'TSR Gallery' }],
  creator: 'TSR Gallery',
  publisher: 'TSR Gallery',
  category: 'Fashion & Clothing',
  classification: 'Business',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'TSR Gallery',
    title: 'TSR Gallery - Premium Fashion & Clothing Store',
    description: 'Discover premium fashion and quality clothing at TSR Gallery. Shop the latest trends with fast delivery across Bangladesh.',
    url: 'https://www.tsrgallery.com',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'TSR Gallery - Premium Fashion Store',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    countryName: 'Bangladesh',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@tsrgallery',
    creator: '@tsrgallery',
    title: 'TSR Gallery - Premium Fashion & Clothing Store',
    description: 'Discover premium fashion and quality clothing at TSR Gallery. Shop the latest trends with fast delivery.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'wrOspiyoBW1XKkXx0Rb_vNpPe539pPXeVLv6vu-1HBI',
  },
  alternates: {
    canonical: 'https://www.tsrgallery.com',
    languages: {
      'en-US': 'https://www.tsrgallery.com',
      'bn-BD': 'https://www.tsrgallery.com/bn',
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
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.pexels.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.pexels.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* Structured Data for LocalBusiness */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["LocalBusiness", "ClothingStore"],
              "name": "TSR Gallery",
              "alternateName": "TSR Gallery Bangladesh",
              "description": "Premium fashion and clothing store offering exclusive collections and latest trends with quality garments.",
              "url": "https://www.tsrgallery.com",
              "logo": "https://www.tsrgallery.com/logo.png",
              "image": "https://www.tsrgallery.com/logo.png",
              "telephone": "+880-XXX-XXXXXX", // Replace with actual phone
              "email": "info@tsrgallery.com", // Replace with actual email
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address", // Replace with actual address
                "addressLocality": "Dhaka", // Replace with actual city
                "addressRegion": "Dhaka Division", // Replace with actual region
                "postalCode": "1000", // Replace with actual postal code
                "addressCountry": "BD"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 23.8103, // Replace with actual coordinates
                "longitude": 90.4125 // Replace with actual coordinates
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
                ],
                "opens": "09:00",
                "closes": "21:00"
              },
              "sameAs": [
                "https://www.facebook.com/tsrgallery", // Replace with actual social media links
                "https://www.instagram.com/tsrgallery",
                "https://www.twitter.com/tsrgallery"
              ],
              "priceRange": "$$",
              "servesCuisine": null,
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Fashion Products",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Premium Fashion Clothing"
                    }
                  }
                ]
              }
            })
          }}
        />

        {/* Organization Schema */}
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "TSR Gallery",
              "alternateName": ["TSR", "TSR Gallery Bangladesh"],
              "url": "https://www.tsrgallery.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.tsrgallery.com/logo.png",
                "width": 400,
                "height": 400
              },
              "image": "https://www.tsrgallery.com/logo.png",
              "description": "TSR Gallery is a premium fashion and clothing store in Bangladesh, offering exclusive collections and latest fashion trends.",
              "foundingDate": "2020", // Replace with actual founding date
              "founders": [
                {
                  "@type": "Person",
                  "name": "TSR Gallery Team"
                }
              ],
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Your Street Address", // Replace with actual address
                "addressLocality": "Dhaka",
                "addressRegion": "Dhaka Division",
                "postalCode": "1000",
                "addressCountry": "BD"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+880-XXX-XXXXXX", // Replace with actual phone
                "contactType": "customer service",
                "availableLanguage": ["English", "Bengali"]
              },
              "sameAs": [
                "https://www.facebook.com/tsrgallery",
                "https://www.instagram.com/tsrgallery",
                "https://www.twitter.com/tsrgallery"
              ]
            })
          }}
        />

        {/* Website Schema */}
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "TSR Gallery",
              "alternateName": "TSR Gallery Fashion Store",
              "url": "https://www.tsrgallery.com",
              "description": "Premium fashion and clothing store with exclusive collections and latest trends.",
              "publisher": {
                "@type": "Organization",
                "name": "TSR Gallery"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://www.tsrgallery.com/products?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />

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
                <ShoppingBasket />
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