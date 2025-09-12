import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        // Primary variant - Indigo 600
        default: 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-lg focus:ring-primary-500 active:bg-primary-800',
        
        // Secondary variant - Violet 600
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 hover:shadow-lg focus:ring-secondary-500 active:bg-secondary-800',
        
        // Semantic variants
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg focus:ring-destructive/50',
        success: 'bg-success text-success-foreground hover:bg-success/90 hover:shadow-lg focus:ring-success/50',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 hover:shadow-lg focus:ring-warning/50',
        info: 'bg-info text-info-foreground hover:bg-info/90 hover:shadow-lg focus:ring-info/50',
        
        // Outline variants
        outline: 'border border-primary-300 bg-transparent text-primary-700 hover:bg-primary-50 hover:border-primary-400 focus:ring-primary-500',
        'outline-secondary': 'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 hover:border-secondary-400 focus:ring-secondary-500',
        'outline-destructive': 'border border-destructive/30 bg-transparent text-destructive hover:bg-destructive/5 hover:border-destructive/50 focus:ring-destructive/50',
        
        // Ghost variants
        ghost: 'bg-transparent text-primary-700 hover:bg-primary-100 hover:text-primary-800 focus:ring-primary-500',
        'ghost-secondary': 'bg-transparent text-secondary-700 hover:bg-secondary-100 hover:text-secondary-800 focus:ring-secondary-500',
        
        // Link variants
        link: 'bg-transparent text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 focus:ring-primary-500',
        'link-secondary': 'bg-transparent text-secondary-600 underline-offset-4 hover:underline hover:text-secondary-700 focus:ring-secondary-500',
        
        // Special gradient variant
        gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 hover:shadow-lg focus:ring-primary-500 active:scale-95',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2 text-sm',
        lg: 'h-11 px-8 text-base rounded-lg',
        xl: 'h-12 px-10 text-lg rounded-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-12 w-12 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
