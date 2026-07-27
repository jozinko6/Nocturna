'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const progressVariants = cva(
  'relative h-3 w-full overflow-hidden rounded-sm bg-[#0a0a0f]',
  {
    variants: {
      variant: {
        xp: '',
        energy: '',
        health: '',
        default: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const fillVariants: Record<string, string> = {
  xp: 'bg-gradient-to-r from-[#6366f1] to-[#818cf8]',
  energy: 'bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8]',
  health: 'bg-gradient-to-r from-[#dc2626] to-[#ef4444]',
  default: 'bg-gradient-to-r from-[#6366f1] to-[#818cf8]',
};

export interface ProgressProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, variant, value, max = 100, showLabel, label, animate = true, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className="w-full" ref={ref} {...props}>
        {(showLabel || label) && (
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#94a3b8]">{label}</span>
            <span className="text-xs text-[#94a3b8] tabular-nums">
              {value}/{max}
            </span>
          </div>
        )}
        <div className={cn(progressVariants({ variant, className }))}>
          <div
            className={cn(
              'h-full rounded-sm transition-all duration-500 ease-out',
              fillVariants[variant || 'default'],
              animate && 'animate-pulse'
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
