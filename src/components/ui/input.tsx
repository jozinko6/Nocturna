'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#94a3b8] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-sm border bg-[#0e0e1a] px-3 py-2 text-sm text-[#e2e8f0] placeholder:text-[#4a4a6c]',
            'border-[#2a2a44] focus:border-[#4a4a6c] focus:outline-none focus:ring-1 focus:ring-[#4a4a6c]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-colors duration-150',
            error && 'border-[#dc2626]/50 focus:border-[#dc2626]/70 focus:ring-[#dc2626]/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-[#fca5a5]">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
