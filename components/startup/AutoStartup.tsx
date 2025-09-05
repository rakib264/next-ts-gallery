'use client';

import { useEffect } from 'react';

export default function AutoStartup() {
  useEffect(() => {
    // Call startup API when the app loads
    const initializeStartup = async () => {
      try {
        const response = await fetch('/api/startup');
        const data = await response.json();
        
        if (data.autoStartEnabled) {
          // console.log('🚀 Auto-startup enabled:', data);
        }
      } catch (error) {
        console.error('Startup initialization error:', error);
      }
    };

    // Call after a short delay to ensure the app is fully loaded
    const timer = setTimeout(initializeStartup, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything
  return null;
}
