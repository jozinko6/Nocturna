'use client';

import { useEffect, useState, type HTMLAttributes } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Swords } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const toastVariants = cva(
  'flex items-start gap-3 p-3 rounded-sm border bg-[#12121e] shadow-lg max-w-sm w-full',
  {
    variants: {
      variant: {
        default: 'border-[#2a2a44]',
        success: 'border-[#22c55e]/30 bg-[#121a14]',
        danger: 'border-[#dc2626]/30 bg-[#1a1215]',
        warning: 'border-[#f59e0b]/30 bg-[#1a1812]',
        info: 'border-[#6366f1]/30 bg-[#12122e]',
        game: 'border-[#f59e0b]/20 bg-[#1a1610]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap: Record<string, React.ReactNode> = {
  default: <Info className="h-4 w-4 text-[#64748b]" />,
  success: <CheckCircle className="h-4 w-4 text-[#4ade80]" />,
  danger: <AlertTriangle className="h-4 w-4 text-[#f87171]" />,
  warning: <AlertTriangle className="h-4 w-4 text-[#fbbf24]" />,
  info: <Info className="h-4 w-4 text-[#818cf8]" />,
  game: <Swords className="h-4 w-4 text-[#fbbf24]" />,
};

export interface NotificationToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title: string;
  description?: string;
  onClose?: () => void;
  autoClose?: number;
}

function NotificationToast({
  title,
  description,
  variant,
  onClose,
  autoClose = 5000,
  className,
  ...props
}: NotificationToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose <= 0) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, autoClose);
    return () => clearTimeout(timer);
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <span className="flex-shrink-0 mt-0.5">
        {iconMap[variant || 'default']}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#e2e8f0]">{title}</p>
        {description && (
          <p className="text-xs text-[#94a3b8] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 p-0.5 text-[#64748b] hover:text-[#94a3b8] transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export { NotificationToast };
