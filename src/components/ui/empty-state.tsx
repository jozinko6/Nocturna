import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ icon, title, description, actionLabel, onAction, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-sm bg-[#1a1a2e] border border-[#2a2a44] mb-4 text-[#4a4a6c]">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-medium text-[#e2e8f0] mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-[#64748b] max-w-xs mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export { EmptyState };
