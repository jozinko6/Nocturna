import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const cardVariants = cva(
  'rounded-sm border bg-[#12121e] transition-colors',
  {
    variants: {
      variant: {
        default: 'border-[#2a2a44]',
        highlighted: 'border-[#6366f1]/40 bg-[#14142a]',
        danger: 'border-[#dc2626]/30 bg-[#1a1215]',
        success: 'border-[#22c55e]/30 bg-[#121a14]',
      },
      glow: {
        none: '',
        common: 'shadow-[0_0_12px_rgba(148,163,184,0.08)]',
        uncommon: 'shadow-[0_0_12px_rgba(34,197,94,0.1)]',
        rare: 'shadow-[0_0_14px_rgba(59,130,246,0.12)]',
        epic: 'shadow-[0_0_16px_rgba(168,85,247,0.14)]',
        legendary: 'shadow-[0_0_18px_rgba(251,191,36,0.16)]',
        cursed: 'shadow-[0_0_18px_rgba(220,38,38,0.16)]',
      },
    },
    defaultVariants: {
      variant: 'default',
      glow: 'none',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, glow, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, glow, className }))}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-4 border-b border-[#2a2a44]', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold text-[#e2e8f0] leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center p-4 border-t border-[#2a2a44]', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
