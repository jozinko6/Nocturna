import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'h-4 w-4 border',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-2',
};

function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} {...props}>
      <div
        className={cn(
          'rounded-full animate-spin',
          'border-[#2a2a44] border-t-[#6366f1]',
          sizeClasses[size]
        )}
      />
    </div>
  );
}

export { LoadingSpinner };
