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
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  entityName: string;
  entityCount?: number;
  isLoading?: boolean;
}

export default function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  entityName,
  entityCount = 1,
  isLoading = false
}: DeleteConfirmationDialogProps) {
  const isMultiple = entityCount > 1;
  const entityLabel = isMultiple ? `${entityName}s` : entityName;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-600" size={20} />
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
          <AlertDialogCancel 
            className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <span>
              Delete {isMultiple ? `${entityCount} ${entityLabel}` : entityLabel}
            </span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook for delete confirmation dialog
interface DeleteConfirmationOptions {
  title: string;
  description: string;
  entityName?: string;
  entityCount?: number;
  onConfirm: () => void;
}

export function useDeleteConfirmationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<DeleteConfirmationOptions | null>(null);

  const showDeleteConfirmation = (newOptions: DeleteConfirmationOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!options) return;
    
    setIsLoading(true);
    try {
      await options.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Delete confirmation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isLoading) {
      setIsOpen(open);
      if (!open) {
        setOptions(null);
      }
    }
  };

  const DeleteConfirmationComponent = () => {
    if (!options) return null;

    return (
      <DeleteConfirmationDialog
        open={isOpen}
        onOpenChange={handleOpenChange}
        onConfirm={handleConfirm}
        title={options.title}
        description={options.description}
        entityName={options.entityName || 'item'}
        entityCount={options.entityCount || 1}
        isLoading={isLoading}
      />
    );
  };

  return {
    showDeleteConfirmation,
    DeleteConfirmationComponent,
    isLoading
  };
}
