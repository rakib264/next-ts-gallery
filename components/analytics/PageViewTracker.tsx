'use client';

import { trackPageView } from '@/lib/analytics';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();

  useEffect(() => {
    if (!pathname) {
      return;
    }

    const pagePath = searchQuery ? `${pathname}?${searchQuery}` : pathname;

    trackPageView({
      pagePath,
      pageTitle: document.title,
    });
  }, [pathname, searchQuery]);

  return null;
}
