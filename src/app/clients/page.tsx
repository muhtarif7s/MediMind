"use client";

import { useState } from 'react';
import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, User, Phone, Users, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from 'next/link';

export default function PatientsPage() {
  const { patients, addPatient, t, isLoaded } = useClinic();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', notes: '' });

  if (!isLoaded) return null;

  const filtered = (patients || []).filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search)
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    addPatient(formData);
    setFormData({ name: '', phone: '', notes: '' });
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-white border-b space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">{t('patients')}</h1>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
                <Plus className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xs rounded-[2rem] p-6" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">{t('addPatient')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4 pt-4 text-right">
                <div className="space-y-2">
                  <Label>{t('patientName')}</Label>
                  <Input 
                    required 
                    className="h-12 rounded-xl"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input 
                    required 
                    type="tel" 
                    className="h-12 rounded-xl"
                    value={formData.phone} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('notes')}</Label>
                  <Input 
                    className="h-12 rounded-xl"
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl mt-4">{t('save')}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            className="pr-10 h-12 bg-slate-50 border-none rounded-2xl" 
            placeholder={t('searchPatients')} 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-3">
          {filtered.map(patient => (
            <Link key={patient.id} href={`/clients/${patient.id}`}>
              <Card className="border-none shadow-sm bg-white rounded-2xl active:scale-[0.98] transition-all">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-slate-50 rounded-2xl">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-sm text-slate-900">{patient.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                      {patient.phone} <Phone className="h-3 w-3" />
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-300">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('noPatients')}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}