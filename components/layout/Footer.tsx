'use client';

import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { settings, loading } = useSettings();
  
  // Fallback values from environment variables
  const siteName = settings?.siteName || process.env.NEXT_PUBLIC_SITE_NAME || 'NextEcom';
  const siteDescription = settings?.siteDescription || process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your Trusted Online Shopping Destination';
  const contactEmail = settings?.contactEmail || process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@nextecom.com';
  const contactPhone = settings?.contactPhone || process.env.NEXT_PUBLIC_CONTACT_PHONE || '+880 1234-567890';
  const contactAddress = settings?.location?.formattedAddress || settings?.address || process.env.NEXT_PUBLIC_CONTACT_ADDRESS || '123 Technology Street\nDhaka, Bangladesh';
  const currentYear = new Date().getFullYear();

  // Show skeleton loading state for dynamic content
  const isLoading = loading && !settings;

  // Social links
  const socialLinks = {
    facebook: settings?.socialLinks?.facebook || '',
    instagram: settings?.socialLinks?.instagram || '',
    youtube: settings?.socialLinks?.youtube || '',
    tiktok: settings?.socialLinks?.tiktok || ''
  };

  const hasAnySocial = Object.values(socialLinks).some(Boolean);

  // Minimal inline TikTok icon to match lucide stroke style
 const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M13 3v9.5a3.5 3.5 0 1 1-3.5-3.5" />
      <path d="M13 6c1.2 1.8 3.2 3 5.5 3" />
    </svg>
  );

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700 hidden md:block relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <div className="h-8 bg-white/20 rounded animate-pulse w-48"></div>
              ) : (
                <>
                  {settings?.logo1 ? (
                    <img
                      src={settings.logo1 ?? '/lib/assets/images/tsrgallery.png'}
                      alt={settings.siteName || process.env.NEXT_PUBLIC_SITE_NAME}
                      className="h-8 w-auto"
                    />
                  ) : (
                    <div className="font-bold text-xl bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
                      {siteName}
                    </div>
                  )}
                </>
              )}
            </div>
            {isLoading ? (
              <div className="text-white/80 text-sm space-y-2">
                <div className="h-4 bg-white/20 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <p className="text-indigo-100/90 text-sm leading-relaxed">
                {siteDescription}
              </p>
            )}
            {hasAnySocial && (
              <div className="flex space-x-3">
                {socialLinks.facebook && (
                  <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <Button variant="ghost" size="sm" className="p-3 text-indigo-200 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/30 hover:border-indigo-400 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25">
                        <Facebook size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.instagram && (
                  <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                      <Button variant="ghost" size="sm" className="p-3 text-indigo-200 hover:text-white hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 border border-indigo-500/30 hover:border-pink-400 transition-all duration-300 shadow-lg hover:shadow-pink-500/25">
                        <Instagram size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.youtube && (
                  <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                      <Button variant="ghost" size="sm" className="p-3 text-indigo-2 00 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-orange-600 border border-indigo-500/30 hover:border-red-400 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                        <Youtube size={18} />
                      </Button>
                    </a>
                  </motion.div>
                )}
                {socialLinks.tiktok && (
                  <motion.div whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                      <Button variant="ghost" size="sm" className="p-3 text-indigo-200 hover:text-white hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-700 border border-indigo-500/30 hover:border-slate-400 transition-all duration-300 shadow-lg hover:shadow-slate-500/25">
                        <TikTokIcon />
                      </Button>
                    </a>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h4 className="font-bold text-lg text-indigo-100 mb-2 border-b-2 border-indigo-500/30 pb-2">Quick Links</h4>
            <div className="space-y-2">
              <Link href="/products" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Products
              </Link>
              <Link href="/categories" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Categories
              </Link>
              <Link href="/about" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                About Us
              </Link>
              <Link href="/terms-conditions" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Terms & Conditions
              </Link>
              <Link href="/signin" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Sign In
              </Link>
              <Link href="/blogs" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Blogs
              </Link>
            </div>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h4 className="font-bold text-lg text-indigo-100 mb-2 border-b-2 border-indigo-500/30 pb-2">Customer Service</h4>
            <div className="space-y-2">
              <Link href="/shipping-delivery" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Shipping & Delivery
              </Link>
              <Link href="/privilege-members" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Privilege Members
              </Link>
              <Link href="/returns" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Returns & Exchanges
              </Link>
              <Link href="/deals" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Special Deals
              </Link>
              <Link href="/faqs" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                FAQs
              </Link>
              <Link href="/contact" className="block text-sm text-indigo-200/90 hover:text-white hover:translate-x-2 transition-all duration-300 py-1 border-l-2 border-transparent hover:border-indigo-400 pl-2">
                Contact Us
              </Link>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h4 className="font-bold text-lg text-indigo-100 mb-2 border-b-2 border-indigo-500/30 pb-2">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm group hover:bg-indigo-900/20 p-2 rounded-lg transition-all duration-300">
                <Phone size={16} className="text-indigo-300 group-hover:text-indigo-200" />
                {isLoading ? (
                  <div className="h-4 bg-white/20 rounded animate-pulse w-32"></div>
                ) : (
                  <span className="text-indigo-100/90 group-hover:text-white">{contactPhone}</span>
                )}
              </div>
              <div className="flex items-center space-x-3 text-sm group hover:bg-indigo-900/20 p-2 rounded-lg transition-all duration-300">
                <Mail size={16} className="text-indigo-300 group-hover:text-indigo-200" />
                {isLoading ? (
                  <div className="h-4 bg-white/20 rounded animate-pulse w-40"></div>
                ) : (
                  <span className="text-indigo-100/90 group-hover:text-white">{contactEmail}</span>
                )}
              </div>
              <div className="flex items-start space-x-3 text-sm group hover:bg-indigo-900/20 p-2 rounded-lg transition-all duration-300">
                <MapPin size={16} className="text-indigo-300 group-hover:text-indigo-200 mt-0.5 flex-shrink-0" />
                {isLoading ? (
                  <div className="space-y-1">
                    <div className="h-4 bg-white/20 rounded animate-pulse w-36"></div>
                    <div className="h-4 bg-white/20 rounded animate-pulse w-28"></div>
                  </div>
                ) : (
                  <span className="whitespace-pre-line text-indigo-100/90 group-hover:text-white break-words">{contactAddress}</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-indigo-500/30 text-center text-sm text-indigo-200/80">
          {isLoading ? (
            <div className="h-4 bg-white/20 rounded animate-pulse w-64 mx-auto"></div>
          ) : (
            <p>
              &copy; {currentYear} {siteName}. All rights reserved. Developed By{' '}
              <a 
                href="https://wa.me/8801828123264?text=Hi%20there!%20How%20can%20I%20help%20you%3F" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-300 hover:text-white hover:underline transition-colors duration-300 font-medium"
              >
                Redwan Rakib
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}