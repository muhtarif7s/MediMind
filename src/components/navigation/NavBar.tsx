
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, Pill, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClinic } from '@/lib/store';

/**
 * Main application navigation bar.
 * Uses a fixed grid layout to prevent layout shifts when icons change state.
 */
export function NavBar() {
  const pathname = usePathname();
  const { t, user } = useClinic();

  // Navigation items configuration
  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/' },
    { icon: Users, label: t('patients'), href: '/clients' },
    { icon: Calendar, label: t('appointments'), href: '/appointments' },
    { icon: Pill, label: t('medications'), href: '/medications' },
    { icon: Settings, label: t('settings'), href: '/settings' },
  ];

  // Hide navigation on auth-related and onboarding screens, or if user is not logged in
  if (!user || pathname === '/login' || pathname === '/welcome') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card/90 dark:bg-card/95 backdrop-blur-xl border-t h-[calc(4.5rem+env(safe-area-inset-bottom))] grid grid-cols-5 items-center px-2 z-50 pb-safe-area-inset-bottom transition-all shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        // Handle root path vs sub-path active state correctly
        const isActive = item.href === '/' 
          ? pathname === '/' 
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all py-1 active:scale-90 h-full",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {/* Fixed size container prevents layout shifts when background/size changes */}
            <div className={cn(
              "w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300",
              isActive ? "bg-primary/15" : "bg-transparent"
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
