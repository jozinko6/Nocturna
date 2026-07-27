import { type HTMLAttributes } from 'react';
import { Shield, Coins, Gem } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Progress } from './progress';

export interface CharacterHeaderProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  level: number;
  faction?: string;
  factionIcon?: React.ReactNode;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  gold: number;
  premium?: number;
  avatar?: React.ReactNode;
}

function CharacterHeader({
  name,
  level,
  faction,
  factionIcon,
  hp,
  maxHp,
  energy,
  maxEnergy,
  gold,
  premium = 0,
  avatar,
  className,
  ...props
}: CharacterHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 bg-[#12121e] border-b border-[#2a2a44]',
        className
      )}
      {...props}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-[#1a1a2e] border border-[#2a2a44] flex items-center justify-center overflow-hidden">
        {avatar || <Shield className="h-5 w-5 text-[#64748b]" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-[#e2e8f0] truncate">{name}</span>
          {faction && factionIcon && (
            <span className="flex-shrink-0 text-[#64748b]" title={faction}>
              {factionIcon}
            </span>
          )}
          <span className="flex-shrink-0 text-[10px] font-medium text-[#94a3b8] bg-[#1a1a2e] px-1.5 py-0.5 rounded-sm border border-[#2a2a44]">
            Lv. {level}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <Progress variant="health" value={hp} max={maxHp} label="HP" className="col-span-1" />
          <Progress variant="energy" value={energy} max={maxEnergy} label="EN" className="col-span-1" />
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <Coins className="h-3 w-3 text-[#fbbf24]" />
          <span className="text-xs font-medium text-[#fbbf24] tabular-nums">{gold.toLocaleString()}</span>
        </div>
        {premium > 0 && (
          <div className="flex items-center gap-1">
            <Gem className="h-3 w-3 text-[#a78bfa]" />
            <span className="text-xs font-medium text-[#a78bfa] tabular-nums">{premium.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export { CharacterHeader };
