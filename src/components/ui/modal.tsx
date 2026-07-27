'use client';

import { forwardRef, type HTMLAttributes, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, open, onClose, title, children, ...props }, ref) => {
    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      },
      [onClose]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }, [open, handleKeyDown]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[#0a0a0f]/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            'relative z-10 w-full max-w-lg mx-4 rounded-sm border border-[#2a2a44] bg-[#12121e] shadow-2xl',
            'animate-in fade-in zoom-in-95 duration-150',
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-[#2a2a44]">
              <h2 className="text-base font-semibold text-[#e2e8f0]">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-sm text-[#64748b] hover:text-[#94a3b8] hover:bg-[#1a1a2e] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

const ModalFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-end gap-2 pt-4 border-t border-[#2a2a44]', className)}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter';

export { Modal, ModalFooter };
