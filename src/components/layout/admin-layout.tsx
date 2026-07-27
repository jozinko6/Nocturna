'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Swords,
  Settings,
  Database,
  Shield,
  ScrollText,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '../ui/button';

interface AdminNavSection {
  title: string;
  items: { id: string; label: string; icon: React.ReactNode; href: string }[];
}

const adminNavSections: AdminNavSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, href: '/admin' },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'users', label: 'Users', icon: <Users className="h-4 w-4" />, href: '/admin/users' },
      { id: 'items', label: 'Items', icon: <Swords className="h-4 w-4" />, href: '/admin/items' },
      { id: 'factions', label: 'Factions', icon: <Shield className="h-4 w-4" />, href: '/admin/factions' },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'logs', label: 'Logs', icon: <ScrollText className="h-4 w-4" />, href: '/admin/logs' },
      { id: 'database', label: 'Database', icon: <Database className="h-4 w-4" />, href: '/admin/database' },
      { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/admin/settings' },
    ],
  },
];

export interface AdminLayoutProps {
  children: ReactNode;
  onBackToGame?: () => void;
}

function AdminLayout({ children, onBackToGame }: AdminLayoutProps) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <aside className="hidden md:flex flex-col w-52 h-screen sticky top-0 bg-[#0e0e1a] border-r border-[#2a2a44]">
        <div className="p-4 border-b border-[#2a2a44]">
          <h2 className="text-sm font-semibold text-[#e2e8f0]">Admin Panel</h2>
          {onBackToGame && (
            <Button variant="ghost" size="sm" onClick={onBackToGame} className="mt-2 -ml-2 text-[#64748b]">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back to game
            </Button>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {adminNavSections.map((section) => (
            <div key={section.title} className="mb-3">
              <span className="px-4 text-[10px] font-semibold uppercase tracking-wider text-[#4a4a6c]">
                {section.title}
              </span>
              <div className="mt-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-[#e2e8f0] bg-[#1a1a2e] border-r-2 border-[#6366f1]'
                          : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#12121e]'
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 min-h-screen p-6">{children}</main>
    </div>
  );
}

export { AdminLayout };
