'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

type BackButtonProps = React.ComponentProps<typeof Button> & {
  label?: string;
};

export default function BackButton({ label = 'Back', className, onClick, ...props }: BackButtonProps) {
  const router = useRouter();

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    router.back();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      onClick={handleClick}
      className={cn('inline-flex items-center', className)}
    >
      <ArrowLeft size={16} className="mr-2" />
      {label}
    </Button>
  );
}


