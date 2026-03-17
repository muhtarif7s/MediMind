
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/store';

export function NavBar() {
  const pathname = usePathname();
  const { t } = useClinic();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Users, label: t('patients'), href: '/clients' },
    { icon: Calendar, label: t('appointments'), href: '/appointments' },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-xl border-t h-[calc(5rem+env(safe-area-inset-bottom))] flex items-start justify-around px-4 z-50 pt-2 pb-safe-area-inset-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1 py-2 active:scale-90",
              isActive ? "text-primary" : "text-slate-400"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-colors",
              isActive ? "bg-primary/10" : "bg-transparent"
            )}>
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
            </div>
            <span className={cn(
              "text-[10px] font-bold",
              isActive ? "opacity-100" : "opacity-70"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
