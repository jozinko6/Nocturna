import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Badge } from './badge';

const rarityColors: Record<string, string> = {
  common: 'bg-[#1e1e2a] border-[#3a3a5c]',
  uncommon: 'bg-[#0f1f14] border-[#22c55e]/20',
  rare: 'bg-[#0f152a] border-[#3b82f6]/20',
  epic: 'bg-[#1a0f2a] border-[#a855f7]/20',
  legendary: 'bg-[#2a2218] border-[#f59e0b]/20',
  cursed: 'bg-[#2a0f0f] border-[#dc2626]/20',
};

const rarityIconBg: Record<string, string> = {
  common: 'bg-[#2a2a3e]',
  uncommon: 'bg-[#122a18]',
  rare: 'bg-[#121a3a]',
  epic: 'bg-[#20123a]',
  legendary: 'bg-[#2a2418]',
  cursed: 'bg-[#3a1215]',
};

type ItemRarity = keyof typeof rarityColors;

interface ItemStat {
  label: string;
  value: string | number;
}

export interface ItemCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  type: string;
  rarity: ItemRarity;
  stats?: ItemStat[];
  icon?: React.ReactNode;
  compact?: boolean;
}

function ItemCard({ name, type, rarity, stats, icon, compact, className, ...props }: ItemCardProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-2 rounded-sm border',
          rarityColors[rarity],
          'hover:bg-[#1a1a2e] transition-colors',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center border',
            rarityIconBg[rarity],
            rarityColors[rarity]
          )}
        >
          {icon || <span className="text-[10px] text-[#64748b]">?</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-[#e2e8f0] truncate">{name}</span>
            <Badge variant={rarity as any} className="flex-shrink-0" />
          </div>
          <span className="text-[10px] text-[#64748b]">{type}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-sm border bg-[#12121e] p-3',
        rarityColors[rarity],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex-shrink-0 w-12 h-12 rounded-sm flex items-center justify-center border',
            rarityIconBg[rarity],
            rarityColors[rarity]
          )}
        >
          {icon || <span className="text-xs text-[#64748b]">?</span>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-[#e2e8f0] truncate">{name}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] text-[#64748b]">{type}</span>
            <Badge variant={rarity as any} />
          </div>
          {stats && stats.length > 0 && (
            <div className="space-y-0.5">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center justify-between text-[11px]">
                  <span className="text-[#94a3b8]">{stat.label}</span>
                  <span className="text-[#e2e8f0] font-medium tabular-nums">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ItemCard };
