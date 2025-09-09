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
      
      // Set the legacy custom color variables for backward compatibility
      root.style.setProperty('--color-primary', colors.primaryColor);
      root.style.setProperty('--color-secondary', colors.secondaryColor);
      
      // Generate comprehensive color palettes
      const primaryPalette = generateColorPalette(colors.primaryColor);
      const secondaryPalette = generateColorPalette(colors.secondaryColor);
      
      // Set primary color variants
      Object.entries(primaryPalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--primary-${shade}`, hsl);
      });
      
      // Set secondary color variants
      Object.entries(secondaryPalette).forEach(([shade, hsl]) => {
        root.style.setProperty(`--secondary-${shade}`, hsl);
      });
      
      // Set the main primary and secondary colors
      root.style.setProperty('--primary', primaryPalette['500'] || primaryPalette['600']);
      root.style.setProperty('--secondary', secondaryPalette['500'] || secondaryPalette['600']);
      
      // Set foreground colors with proper contrast
      const primaryForeground = getContrastColor(colors.primaryColor);
      const secondaryForeground = getContrastColor(colors.secondaryColor);
      root.style.setProperty('--primary-foreground', primaryForeground);
      root.style.setProperty('--secondary-foreground', secondaryForeground);
      
      // Update ring color to use primary for focus states
      root.style.setProperty('--ring', primaryPalette['500'] || primaryPalette['600']);
      
      // Update adaptive colors to use the new palette
      if (!isDarkMode) {
        // Light mode - use lighter variants
        root.style.setProperty('--muted', secondaryPalette['100']);
        root.style.setProperty('--accent', primaryPalette['100']);
        root.style.setProperty('--accent-foreground', primaryPalette['900']);
      } else {
        // Dark mode - use darker variants
        root.style.setProperty('--muted', secondaryPalette['800']);
        root.style.setProperty('--accent', primaryPalette['800']);
        root.style.setProperty('--accent-foreground', primaryPalette['100']);
      }
    }
  }, [colors, isDarkMode]);

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

// Helper function to generate a complete color palette from a base color
function generateColorPalette(baseColor: string): Record<string, string> {
  const hsl = hexToHslValues(baseColor);
  
  // Generate shades from 50 (lightest) to 950 (darkest)
  const palette: Record<string, string> = {};
  
  // Define lightness values for each shade
  const lightnessMap = {
    '50': 98,
    '100': 95,
    '200': 87,
    '300': 78,
    '400': 65,
    '500': hsl.l, // Use original lightness as 500
    '600': Math.max(hsl.l - 10, 25),
    '700': Math.max(hsl.l - 20, 20),
    '800': Math.max(hsl.l - 30, 15),
    '900': Math.max(hsl.l - 40, 10),
    '950': Math.max(hsl.l - 50, 5),
  };
  
  // Generate each shade
  Object.entries(lightnessMap).forEach(([shade, lightness]) => {
    // Adjust saturation for very light and very dark shades
    let saturation = hsl.s;
    if (shade === '50' || shade === '100') {
      saturation = Math.max(saturation - 20, 10);
    } else if (shade === '900' || shade === '950') {
      saturation = Math.min(saturation + 10, 100);
    }
    
    palette[shade] = `${hsl.h} ${saturation}% ${lightness}%`;
  });
  
  return palette;
}

// Helper function to convert hex to HSL values (separate h, s, l)
function hexToHslValues(hex: string): { h: number; s: number; l: number } {
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

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
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