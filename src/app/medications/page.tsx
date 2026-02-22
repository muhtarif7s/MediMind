
"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { MedicationList } from '@/components/medications/MedicationList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

export default function MedicationsPage() {
  const { medications, isLoaded } = useMediMind();
  const [search, setSearch] = useState('');

  if (!isLoaded) return null;

  const filtered = medications.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-background space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Medications</h1>
          <Link href="/medications/add">
            <Button size="icon" className="rounded-full h-10 w-10 shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </Link>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-10 bg-muted/50 border-none rounded-xl" 
            placeholder="Search medications..." 
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
