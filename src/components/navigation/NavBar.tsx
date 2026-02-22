"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: ClipboardList, label: 'Meds', href: '/medications' },
  { icon: BarChart3, label: 'Stats', href: '/history' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/95 backdrop-blur-xl border-t h-[calc(4.5rem+env(safe-area-inset-bottom))] flex items-start justify-around px-4 z-50 pt-2 pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all flex-1 h-full pt-1",
              isActive ? "text-primary scale-105" : "text-muted-foreground active:scale-95"
            )}
          >
            <div className={cn(
              "p-2 rounded-2xl transition-colors",
              isActive && "bg-primary/10 shadow-sm"
            )}>
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
            </div>
            <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
