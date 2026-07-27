'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1a1a2e] text-[#e2e8f0] border border-[#3a3a5c] hover:bg-[#22223a] hover:border-[#4a4a6c] active:bg-[#14142a] focus-visible:ring-[#6366f1] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        secondary:
          'bg-[#12121e] text-[#94a3b8] border border-[#2a2a44] hover:bg-[#1a1a2e] hover:text-[#cbd5e1] hover:border-[#3a3a5c] active:bg-[#0e0e1a] focus-visible:ring-[#6366f1]',
        danger:
          'bg-[#2a1215] text-[#fca5a5] border border-[#5c2a2e] hover:bg-[#3a181c] hover:border-[#7c3a3e] active:bg-[#1a0c0f] focus-visible:ring-[#dc2626] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
        ghost:
          'bg-transparent text-[#94a3b8] border border-transparent hover:bg-[#1a1a2e] hover:text-[#cbd5e1] active:bg-[#14142a] focus-visible:ring-[#6366f1]',
        premium:
          'bg-gradient-to-b from-[#2a2218] to-[#1a1610] text-[#fbbf24] border border-[#5c4a1e] hover:from-[#322a1e] hover:to-[#221e14] hover:border-[#7c6a2e] active:from-[#1a1610] active:to-[#12100a] focus-visible:ring-[#fbbf24] shadow-[inset_0_1px_0_rgba(251,191,36,0.1)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
