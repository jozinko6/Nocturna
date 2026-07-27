import { type HTMLAttributes } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

export interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
}

function PageHeader({ title, subtitle, onBack, action, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 border-b border-[#2a2a44] bg-[#0e0e1a]',
        className
      )}
      {...props}
    >
      {onBack && (
        <Button variant="ghost" size="sm" onClick={onBack} className="flex-shrink-0 -ml-1">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-[#e2e8f0] truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[#64748b] truncate">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export { PageHeader };
