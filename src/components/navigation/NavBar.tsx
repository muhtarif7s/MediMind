
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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-background/80 backdrop-blur-md border-t h-20 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-all",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "p-2 rounded-xl transition-colors",
              isActive && "bg-primary/10"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
