
"use client";

import { useState } from 'react';
import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, User, Phone, Users, ChevronRight, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from 'next/link';

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />
      ))}
    </div>
  );
}

export default function PatientsPage() {
  const { patients, addPatient, t, isLoaded } = useClinic();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });

  const filtered = (patients || []).filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    addPatient(formData);
    
    // Slight delay for feedback
    setTimeout(() => {
      setFormData({ name: '', phone: '', notes: '' });
      setIsAddOpen(false);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-background transition-colors animate-page-enter">
      <header className="p-6 bg-card border-b space-y-4 pt-safe-area-inset-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t('patients')}</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg active:scale-90 transition-transform">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs rounded-[2rem] p-6 bg-card border" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right text-foreground">{t('addPatient')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4 text-right">
                <div className="space-y-2">
                  <Label className="text-foreground">{t('patientName')}</Label>
                  <Input 
                    required 
                    className="h-12 rounded-xl bg-background border-input"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{t('phone')}</Label>
                  <Input 
                    required 
                    type="tel" 
                    className="h-12 rounded-xl bg-background border-input"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">{t('notes')}</Label>
                  <Input 
                    className="h-12 rounded-xl bg-background border-input"
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 rounded-xl mt-4">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : t('save')}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pr-10 h-12 bg-background border-input rounded-2xl text-foreground" 
            placeholder={t('searchPatients')} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        {!isLoaded ? (
          <ListSkeleton />
        ) : (
          <div className="space-y-3">
            {filtered.map(patient => (
              <Link key={patient.id} href={`/clients/${patient.id}`}>
                <Card className="border shadow-sm bg-card rounded-2xl active:scale-[0.98] transition-all group overflow-hidden">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-bold text-sm text-foreground">{patient.name}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        {patient.phone} <Phone className="h-3 w-3" />
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted" />
                  </CardContent>
                </Card>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="py-20 text-center text-muted animate-in fade-in zoom-in duration-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm">{t('noPatients')}</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <NavBar />
    </div>
  );
}
