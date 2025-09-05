'use client';

import { useEffect, useRef, useState } from 'react';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  address: string;
  logo1: string;
  logo2: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
  };
  currency: string;
  timezone: string;
  language: string;
}

interface CourierSettingsPublic {
  insideDhaka: number;
  outsideDhaka: number;
}

const memoryCache: Record<string, { data: any; expiry: number }> = {};
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Backward-compatible general settings hook
export function useSettings() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cacheKey = 'settings:general';
        const now = Date.now();
        const cached = memoryCache[cacheKey];
        if (cached && cached.expiry > now) {
          setSettings(cached.data);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/settings/general', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          memoryCache[cacheKey] = { data, expiry: now + DEFAULT_TTL_MS };
        } else {
          setError('Failed to fetch settings');
        }
      } catch (err) {
        setError('Error fetching settings');
        console.error('Error fetching settings:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted.current = false; };
  }, []);

  return { settings, loading, error };
}

// Dedicated courier settings hook
export function useCourierSettings() {
  const [settings, setSettings] = useState<CourierSettingsPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const cacheKey = 'settings:courier';
        const now = Date.now();
        const cached = memoryCache[cacheKey];
        if (cached && cached.expiry > now) {
          setSettings(cached.data);
          setLoading(false);
          return;
        }

        const response = await fetch('/api/settings/courier', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          memoryCache[cacheKey] = { data, expiry: now + DEFAULT_TTL_MS };
        } else {
          setError('Failed to fetch courier settings');
        }
      } catch (err) {
        setError('Error fetching courier settings');
        console.error('Error fetching courier settings:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchSettings();
    return () => { isMounted.current = false; };
  }, []);

  return { settings, loading, error };
}
