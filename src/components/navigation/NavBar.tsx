"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Pill, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/store';

export function NavBar() {
  const pathname = usePathname();
  const { t } = useClinic();

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Users, label: t('patients'), href: '/clients' },
    { icon: Calendar, label: t('appointments'), href: '/appointments' },
    { icon: Pill, label: t('medications'), href: '/medications' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ];

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 dark:bg-card/90 backdrop-blur-xl border-t h-[calc(4.5rem+env(safe-area-inset-bottom))] flex items-start justify-around px-2 z-50 pt-2 pb-safe-area-inset-bottom transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1 py-1 active:scale-90",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-all duration-300",
              isActive ? "bg-primary/10" : "bg-transparent"
            )}>
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px] scale-110")} />
            </div>
            <span className={cn(
              "text-[9px] font-bold whitespace-nowrap transition-opacity",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
