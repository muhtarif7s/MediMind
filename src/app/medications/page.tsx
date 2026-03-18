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

export default function MedicationsPage() {
  const { medications = [], isLoaded, isUserLoading, t, profile } = useMediMind();
  const [search, setSearch] = useState('');

  if (isUserLoading || !isLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-bold text-muted-foreground">{t('loadingMedications')}</p>
      </div>
    );
  }

  const filtered = (medications || []).filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const isRTL = profile.language === 'ar';

  return (
    <div className="flex flex-col h-screen pb-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-background space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('medications')}</h2>
          <Link href="/medications/add">
            <Button size="icon" className="rounded-full h-10 w-10 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
          <Input 
            className={`${isRTL ? 'pr-10' : 'pl-10'} h-10 bg-muted/50 border-none rounded-xl`} 
            placeholder={t('searchMedications')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <ScrollArea className="flex-1 px-6">
        <div className="pb-10">
          <MedicationList medications={filtered} />
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}