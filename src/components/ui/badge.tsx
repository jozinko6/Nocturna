import { type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border',
  {
    variants: {
      variant: {
        common: 'bg-[#1e1e2a] text-[#94a3b8] border-[#3a3a5c]',
        uncommon: 'bg-[#122a18] text-[#4ade80] border-[#22c55e]/30',
        rare: 'bg-[#121a2e] text-[#60a5fa] border-[#3b82f6]/30',
        epic: 'bg-[#1e122e] text-[#c084fc] border-[#a855f7]/30',
        legendary: 'bg-[#2a2218] text-[#fbbf24] border-[#f59e0b]/30',
        cursed: 'bg-[#2a1215] text-[#f87171] border-[#dc2626]/30',
        danger: 'bg-[#2a1215] text-[#f87171] border-[#dc2626]/30',
        sangvari: 'bg-[#2a1215] text-[#fca5a5] border-[#dc2626]/40',
        lunari: 'bg-[#12122e] text-[#a5b4fc] border-[#6366f1]/30',
        default: 'bg-[#1a1a2e] text-[#cbd5e1] border-[#3a3a5c]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
