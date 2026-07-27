import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Swords } from 'lucide-react';

export interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366f1]/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#dc2626]/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className={cn('relative z-10 w-full max-w-md', className)}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-[#12121e] border border-[#2a2a44] mb-4">
            <Swords className="h-7 w-7 text-[#6366f1]" />
          </div>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">Nocturna</h1>
          <p className="text-sm text-[#64748b] mt-1">Enter the darkness</p>
        </div>

        <div className="bg-[#12121e] border border-[#2a2a44] rounded-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export { AuthLayout };
