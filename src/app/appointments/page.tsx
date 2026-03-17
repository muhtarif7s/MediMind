
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
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-white border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t('appointments')}</h1>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 rounded-xl px-4">
              <Plus className="h-4 w-4" />
              {t('bookAppointment')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs rounded-[2rem]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right">{t('bookAppointment')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 text-right pt-4">
              <div className="space-y-2">
                <Label>{t('selectPatient')}</Label>
                <Select onValueChange={v => setFormData({...formData, patientId: v})}>
                  <SelectTrigger className="h-12 rounded-xl text-right">
                    <SelectValue placeholder={t('selectPatient')} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('dateTime')}</Label>
                <Input 
                  type="datetime-local" 
                  required 
                  className="h-12 rounded-xl"
                  onChange={e => setFormData({...formData, dateTime: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>{t('treatment')}</Label>
                <Input 
                  className="h-12 rounded-xl"
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
            <Card key={app.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{app.patientName}</p>
                    <p className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      {format(new Date(app.dateTime), 'EEEE d MMMM, hh:mm a', { locale: ar })}
                      <Clock className="h-3 w-3" />
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    app.status === 'attended' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'no-show' ? 'bg-amber-100 text-amber-700' :
                    app.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {t(app.status as any)}
                  </div>
                </div>

                {app.status === 'pending' && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                      onClick={() => updateAppointmentStatus(app.id, 'attended')}
                    >
                      <Check className="h-3 w-3 ml-1" /> {t('attended')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-amber-100 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      onClick={() => updateAppointmentStatus(app.id, 'no-show')}
                    >
                      <X className="h-3 w-3 ml-1" /> {t('noShow')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[10px] h-9 rounded-xl border-rose-100 text-rose-700 bg-rose-50 hover:bg-rose-100"
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
            <div className="py-20 text-center text-slate-300">
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
