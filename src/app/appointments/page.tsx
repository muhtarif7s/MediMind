"use client";

import { useState } from 'react';
import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Clock, Check, X, Ban, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function AppointmentsPage() {
  const { appointments, patients, addAppointment, updateAppointmentStatus, t, isLoaded } = useClinic();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ patientId: '', dateTime: '', treatment: '' });

  if (!isLoaded) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patientId);
    if (!patient || !formData.dateTime) return;
    
    addAppointment({
      patientId: formData.patientId,
      patientName: patient.name,
      dateTime: formData.dateTime,
      treatment: formData.treatment
    });
    
    setIsAddOpen(false);
    setFormData({ patientId: '', dateTime: '', treatment: '' });
  };

  return (
    <div className="flex flex-col h-screen pb-20 bg-background transition-colors">
      <header className="p-6 bg-card border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('appointments')}</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-xl px-4">
              <Plus className="h-4 w-4" />
              {t('bookAppointment')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs rounded-[2rem] bg-card border" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right text-foreground">{t('bookAppointment')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 text-right pt-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t('selectPatient')}</Label>
                <Select onValueChange={v => setFormData({...formData, patientId: v})}>
                  <SelectTrigger className="h-12 rounded-xl text-right bg-background border-input">
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent className="bg-card">
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('dateTime')}</Label>
                <Input 
                  type="datetime-local" 
                  required 
                  className="h-12 rounded-xl bg-background border-input"
                  onChange={e => setFormData({...formData, dateTime: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('treatment')}</Label>
                <Input 
                  className="h-12 rounded-xl bg-background border-input"
                  value={formData.treatment} 
                  onChange={e => setFormData({...formData, treatment: e.target.value})} 
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl mt-4">{t('save')}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {appointments.map(app => (
            <Card key={app.id} className="border shadow-sm bg-card rounded-2xl overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-right">
                    <p className="font-bold text-foreground">{app.patientName}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                      {format(new Date(app.dateTime), 'EEEE d MMMM, hh:mm a', { locale: ar })}
                      <Clock className="h-3 w-3" />
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    app.status === 'attended' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    app.status === 'no-show' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    app.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {t(app.status as any)}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400"
                      onClick={() => updateAppointmentStatus(app.id, 'attended')}
                    >
                      <Check className="h-3 w-3 ml-1" /> {t('attended')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-amber-100 text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400"
                      onClick={() => updateAppointmentStatus(app.id, 'no-show')}
                    >
                      <X className="h-3 w-3 ml-1" /> {t('noShow')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-rose-100 text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30 dark:text-rose-400"
                      onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                    >
                      <Ban className="h-3 w-3 ml-1" /> {t('cancelled')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && (
            <div className="py-20 text-center text-muted">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm">{t('noAppointments')}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
