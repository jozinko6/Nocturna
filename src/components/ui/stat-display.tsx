import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export interface StatDisplayProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  value: number | string;
  bonus?: number;
  icon?: React.ReactNode;
  compact?: boolean;
}

function StatDisplay({ name, value, bonus, icon, compact, className, ...props }: StatDisplayProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'gap-1.5' : 'gap-2',
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex-shrink-0 text-[#64748b]">{icon}</span>
      )}
      <span className={cn('text-[#94a3b8]', compact ? 'text-[11px]' : 'text-xs')}>
        {name}
      </span>
      <span className={cn('font-semibold text-[#e2e8f0] tabular-nums', compact ? 'text-xs' : 'text-sm')}>
        {value}
      </span>
      {bonus !== undefined && bonus !== 0 && (
        <span className="text-[10px] font-medium text-[#4ade80]">
          +{bonus}
        </span>
      )}
    </div>
  );
}

export { StatDisplay };
