import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Deterministic formatters to avoid SSR/CSR locale mismatches
export function formatNumber(value: number): string {
  try {
    return new Intl.NumberFormat('en-US').format(value);
  } catch {
    return String(value);
  }
}

export function formatBDTCurrency(value: number, options: Intl.NumberFormatOptions = {}): string {
  try {
    // Handle invalid values
    if (value === null || value === undefined || isNaN(value)) {
      return '৳0';
    }
    
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      // minimumFractionDigits: 0,
      ...options,
    }).format(value);
  } catch {
    return `৳${formatNumber(value)}`;
  }
}

export function formatDhakaDate(input: string | number | Date): string {
  try {
    return new Intl.DateTimeFormat('en-BD', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      timeZone: 'Asia/Dhaka',
    }).format(new Date(input));
  } catch {
    const d = new Date(input);
    return d.toISOString().split('T')[0];
  }
}
