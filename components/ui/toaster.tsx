'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useHydration } from '@/hooks/use-hydration';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, AlertTriangle, CheckCircle, Heart, Info, ShoppingCart } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();
  const isHydrated = useHydration();

  if (!isHydrated) {
    return null;
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const getIcon = () => {
          switch (variant) {
            case 'success':
              return <CheckCircle className="h-5 w-5 text-green-600 drop-shadow-sm" />;
            case 'error':
              return <AlertCircle className="h-5 w-5 text-red-600 drop-shadow-sm" />;
            case 'warning':
              return <AlertTriangle className="h-5 w-5 text-yellow-600 drop-shadow-sm" />;
            case 'info':
              return <Info className="h-5 w-5 text-blue-600 drop-shadow-sm" />;
            case 'cart':
              return <ShoppingCart className="h-5 w-5 text-primary-600 drop-shadow-sm" />;
            case 'wishlist':
              return <Heart className="h-5 w-5 text-pink-600 drop-shadow-sm fill-current" />;
            default:
              return null;
          }
        };

        const getCloseButtonStyle = () => {
          switch (variant) {
            case 'cart':
              return 'text-primary-600 bg-primary-50/80 border-primary-200/50 hover:bg-primary-100 hover:text-primary-700 focus:ring-primary-500/50';
            case 'wishlist':
              return 'text-pink-600 bg-pink-50/80 border-pink-200/50 hover:bg-pink-100 hover:text-pink-700 focus:ring-pink-500/50';
            case 'success':
              return 'text-green-600 bg-green-50/80 border-green-200/50 hover:bg-green-100 hover:text-green-700 focus:ring-green-500/50';
            case 'error':
              return 'text-red-600 bg-red-50/80 border-red-200/50 hover:bg-red-100 hover:text-red-700 focus:ring-red-500/50';
            case 'warning':
              return 'text-yellow-600 bg-yellow-50/80 border-yellow-200/50 hover:bg-yellow-100 hover:text-yellow-700 focus:ring-yellow-500/50';
            case 'info':
              return 'text-blue-600 bg-blue-50/80 border-blue-200/50 hover:bg-blue-100 hover:text-blue-700 focus:ring-blue-500/50';
            default:
              return 'text-slate-600 bg-slate-50/80 border-slate-200/50 hover:bg-slate-100 hover:text-slate-700 focus:ring-slate-500/50';
          }
        };

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {getIcon()}
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose className={getCloseButtonStyle()} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// Export toast hook for easy use
export { useToast } from '@/hooks/use-toast';
