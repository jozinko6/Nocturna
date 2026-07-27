'use client';

import { type HTMLAttributes } from 'react';
import { Home, Compass, Swords, Users, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  id: string;
  label: string;
  labelSk?: string;
  icon: React.ReactNode;
  href?: string;
  active?: boolean;
}

const defaultNavItems: NavItem[] = [
  { id: 'home', label: 'Home', labelSk: 'Domov', icon: <Home className="h-5 w-5" /> },
  { id: 'expeditions', label: 'Expeditions', labelSk: 'Výpravy', icon: <Compass className="h-5 w-5" /> },
  { id: 'character', label: 'Character', labelSk: 'Postava', icon: <Swords className="h-5 w-5" /> },
  { id: 'pvp', label: 'PvP', labelSk: 'PvP', icon: <Users className="h-5 w-5" /> },
  { id: 'more', label: 'More', labelSk: 'Viac', icon: <MoreHorizontal className="h-5 w-5" /> },
];

interface MobileNavProps extends HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  locale?: 'en' | 'sk';
}

function MobileNav({ items, activeId, onNavigate, locale = 'en', className, ...props }: MobileNavProps) {
  const navItems = items || defaultNavItems;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-[#0e0e1a] border-t border-[#2a2a44] safe-area-bottom',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = item.id === activeId;
          const label = locale === 'sk' && item.labelSk ? item.labelSk : item.label;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors',
                isActive ? 'text-[#6366f1]' : 'text-[#64748b] hover:text-[#94a3b8]'
              )}
            >
              <div className="relative">
                {item.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#6366f1]" />
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface DesktopSidebarProps extends HTMLAttributes<HTMLElement> {
  items?: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  locale?: 'en' | 'sk';
  collapsed?: boolean;
}

function DesktopSidebar({ items, activeId, onNavigate, locale = 'en', collapsed, className, ...props }: DesktopSidebarProps) {
  const navItems = items || defaultNavItems;

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-full bg-[#0e0e1a] border-r border-[#2a2a44]',
        collapsed ? 'w-16' : 'w-52',
        className
      )}
      {...props}
    >
      <div className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = item.id === activeId;
          const label = locale === 'sk' && item.labelSk ? item.labelSk : item.label;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-[#e2e8f0] bg-[#1a1a2e] border-r-2 border-[#6366f1]'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#12121e]'
              )}
            >
              {item.icon}
              {!collapsed && <span>{label}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export { MobileNav, DesktopSidebar, type NavItem };
