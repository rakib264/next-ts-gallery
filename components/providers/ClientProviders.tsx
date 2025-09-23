'use client';

import NextAuthProvider from '@/components/providers/NextAuthProvider';
import dynamic from 'next/dynamic';

const FaviconProvider = dynamic(() => import('@/components/providers/FaviconProvider').then(m => m.FaviconProvider), { ssr: false });
const ThemeProvider = dynamic(() => import('@/components/providers/ThemeProvider').then(m => m.ThemeProvider), { ssr: false });
const AutoStartup = dynamic(() => import('@/components/startup/AutoStartup'), { ssr: false });
const ShoppingBasket = dynamic(() => import('@/components/ui/shopping-cart'), { ssr: false });
const Toaster = dynamic(() => import('@/components/ui/toaster').then(m => m.Toaster), { ssr: false });

export { AutoStartup, FaviconProvider, NextAuthProvider, ShoppingBasket, ThemeProvider, Toaster };

