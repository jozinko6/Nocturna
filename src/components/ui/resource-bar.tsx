import { type HTMLAttributes } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const resourceBarVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-sm bg-[#0a0a0f] border border-[#1a1a2e]'
);

const fillColors: Record<string, string> = {
  hp: 'bg-gradient-to-r from-[#991b1b] via-[#dc2626] to-[#ef4444]',
  energy: 'bg-gradient-to-r from-[#0369a1] via-[#0ea5e9] to-[#38bdf8]',
  shield: 'bg-gradient-to-r from-[#4338ca] via-[#6366f1] to-[#818cf8]',
  mana: 'bg-gradient-to-r from-[#5b21b6] via-[#7c3aed] to-[#a78bfa]',
  default: 'bg-gradient-to-r from-[#475569] via-[#64748b] to-[#94a3b8]',
};

export interface ResourceBarProps extends HTMLAttributes<HTMLDivElement> {
  current: number;
  max: number;
  variant?: 'hp' | 'energy' | 'shield' | 'mana' | 'default';
  showText?: boolean;
  label?: string;
}

function ResourceBar({
  current,
  max,
  variant = 'default',
  showText = true,
  label,
  className,
  ...props
}: ResourceBarProps) {
  const pct = Math.min(Math.max((current / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)} {...props}>
      {(showText || label) && (
        <div className="flex items-center justify-between mb-0.5">
          {label && <span className="text-[10px] font-medium text-[#94a3b8] uppercase tracking-wider">{label}</span>}
          {showText && (
            <span className="text-[10px] text-[#94a3b8] tabular-nums font-medium ml-auto">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div className={resourceBarVariants()}>
        <div
          className={cn('h-full rounded-sm transition-all duration-300 ease-out', fillColors[variant || 'default'])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export { ResourceBar };
