
"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { MedicationList } from '@/components/medications/MedicationList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

export default function MedicationsPage() {
  const { medications = [], isLoaded, isUserLoading, t, profile } = useMediMind();
  const [search, setSearch] = useState('');

  const filtered = (medications || []).filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const isRTL = profile.language === 'ar';

  return (
    <div className="flex flex-col h-screen pb-20 bg-background transition-colors animate-page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b space-y-4 pt-safe-area-inset-top">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('medications')}</h2>
          <Link href="/medications/add">
            <Button size="icon" className="rounded-full h-10 w-10 shadow-lg active:scale-90 transition-transform">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input 
            className={`${isRTL ? 'pr-10' : 'pl-10'} h-12 bg-background border-input rounded-2xl text-foreground`} 
            placeholder={t('searchMedications')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="pb-10">
          {!isLoaded || isUserLoading ? (
            <ListSkeleton />
          ) : (
            <MedicationList medications={filtered} />
          )}
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
