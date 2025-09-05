'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import React from 'react';

type Tone = 'primary' | 'success' | 'warning' | 'info';

interface ActionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  isLoading?: boolean;
  tone?: Tone;
  icon?: React.ReactNode;
}

export default function ActionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  isLoading = false,
  tone = 'primary',
  icon,
}: ActionConfirmationDialogProps) {
  const toneStyles: Record<Tone, { bg: string; hover: string; ring: string; iconBg: string; iconColor: string }> = {
    primary: {
      bg: 'bg-blue-600',
      hover: 'hover:bg-blue-700',
      ring: 'focus:ring-blue-400',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    success: {
      bg: 'bg-green-600',
      hover: 'hover:bg-green-700',
      ring: 'focus:ring-green-400',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-600',
      hover: 'hover:bg-yellow-700',
      ring: 'focus:ring-yellow-400',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-sky-600',
      hover: 'hover:bg-sky-700',
      ring: 'focus:ring-sky-400',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
    },
  };

  const defaultIcon = tone === 'success' ? (
    <CheckCircle size={20} className={toneStyles[tone].iconColor} />
  ) : tone === 'warning' ? (
    <AlertTriangle size={20} className={toneStyles[tone].iconColor} />
  ) : (
    <Info size={20} className={toneStyles[tone].iconColor} />
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className={`p-2 rounded-full ${toneStyles[tone].iconBg}`}>
              {icon ?? defaultIcon}
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-white ${toneStyles[tone].bg} ${toneStyles[tone].hover} focus:outline-none focus:ring-2 ${toneStyles[tone].ring}`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span className={isLoading ? 'ml-2' : ''}>{confirmLabel}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


