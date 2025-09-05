'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (colors: ThemeColors) => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colors, setColors] = useState<ThemeColors>({
    primaryColor: '#000000',
    secondaryColor: '#666666',
  });
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode and fetch theme colors from API
  useEffect(() => {
    const detectDarkMode = () => {
      if (typeof window !== 'undefined') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        
        // Apply dark class to html element
        const html = document.documentElement;
        if (prefersDark) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      }
    };

    const fetchThemeColors = async () => {
      try {
        const response = await fetch('/api/settings/general');
        if (response.ok) {
          const settings = await response.json();
          setColors({
            primaryColor: settings.primaryColor || '#000000',
            secondaryColor: settings.secondaryColor || '#666666',
          });
        }
      } catch (error) {
        console.error('Error fetching theme colors:', error);
      } finally {
        setLoading(false);
      }
    };

    detectDarkMode();
    fetchThemeColors();

    // Listen for dark mode changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
        const html = document.documentElement;
        if (e.matches) {
          html.classList.add('dark');
        } else {
          html.classList.remove('dark');
        }
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Apply CSS custom properties when colors change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      
      // Set the custom color variables
      root.style.setProperty('--color-primary', colors.primaryColor);
      root.style.setProperty('--color-secondary', colors.secondaryColor);
      
      // Convert hex to HSL for better CSS integration
      const primaryHsl = hexToHsl(colors.primaryColor);
      const secondaryHsl = hexToHsl(colors.secondaryColor);
      
      // Only override the primary and secondary colors, preserve the existing light/dark mode system
      // This ensures dialogs, cards, and other components maintain proper light/dark backgrounds
      root.style.setProperty('--primary', primaryHsl);
      root.style.setProperty('--secondary', secondaryHsl);
      
      // Set primary foreground (white or black based on primary color brightness)
      const primaryForeground = getContrastColor(colors.primaryColor);
      root.style.setProperty('--primary-foreground', primaryForeground);
      
      // Set secondary foreground (white or black based on secondary color brightness)
      const secondaryForeground = getContrastColor(colors.secondaryColor);
      root.style.setProperty('--secondary-foreground', secondaryForeground);
      
      // Update ring color to use primary for focus states
      root.style.setProperty('--ring', primaryHsl);
      
      // Don't override background, card, popover, muted, accent, border, input, or destructive
      // These should remain as defined in the CSS for proper light/dark mode switching
    }
  }, [colors]);

  const updateColors = (newColors: ThemeColors) => {
    setColors(newColors);
  };

  const contextValue: ThemeContextType = {
    colors,
    updateColors,
    loading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Convert to HSL
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
      case gNorm: h = (bNorm - rNorm) / d + 2; break;
      case bNorm: h = (rNorm - gNorm) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Helper function to get contrast color (white or black) based on background color
function getContrastColor(hex: string): string {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');

  // Parse r, g, b values
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark colors, black for light colors
  return luminance > 0.5 ? '0 0% 9%' : '0 0% 98%';
}