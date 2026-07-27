'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { CharacterHeader, type CharacterHeaderProps } from '../ui/character-header';
import { MobileNav, DesktopSidebar } from '../ui/navigation';

export interface GameLayoutProps {
  children: ReactNode;
  character: CharacterHeaderProps;
  activeNav: string;
  onNavigate: (id: string) => void;
  locale?: 'en' | 'sk';
}

function GameLayout({ children, character, activeNav, onNavigate, locale = 'en' }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0] flex flex-col md:flex-row">
      <DesktopSidebar
        activeId={activeNav}
        onNavigate={onNavigate}
        locale={locale}
        className="hidden md:flex h-screen sticky top-0"
      />

      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        <CharacterHeader {...character} className="sticky top-0 z-30" />

        <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
          {children}
        </main>
      </div>

      <MobileNav
        activeId={activeNav}
        onNavigate={onNavigate}
        locale={locale}
        className="md:hidden"
      />
    </div>
  );
}

export { GameLayout };
