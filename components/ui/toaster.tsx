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
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

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
              return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'error':
              return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'warning':
              return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case 'info':
              return <Info className="h-4 w-4 text-blue-600" />;
            default:
              return null;
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
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// Export toast hook for easy use
export { useToast } from '@/hooks/use-toast';
