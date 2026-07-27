'use client';

import { useState, useRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  tooltipContent: ReactNode;
  side?: 'top' | 'bottom';
  children: ReactNode;
}

function Tooltip({ tooltipContent, side = 'top', children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(true);
  };

  const hide = () => {
    timeoutRef.current = setTimeout(() => setVisible(false), 100);
  };

  return (
    <div
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 px-2.5 py-1.5 text-[11px] text-[#e2e8f0] bg-[#1a1a2e] border border-[#2a2a44] rounded-sm shadow-lg whitespace-nowrap pointer-events-none',
            side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-2'
          )}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

export { Tooltip };
