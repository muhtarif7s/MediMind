
"use client";

import { useClinic } from '@/lib/store';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  FileText,
  Activity,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default function PatientDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { patients, appointments, t, isLoaded, profile } = useClinic();

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const patient = patients.find(p => p.id === id);
  const patientAppointments = appointments.filter(a => a.patientId === id);
  const locale = profile.language === 'ar' ? ar : enUS;

  if (!patient) {
    return (
      <div className="p-6 text-center space-y-4 flex flex-col items-center justify-center h-screen" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
        <h2 className="text-xl font-bold">{t('patientNotFound')}</h2>
        <Button onClick={() => router.push('/clients')}>{t('backToList')}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className={`h-6 w-6 ${profile.language === 'ar' ? 'rotate-180' : ''}`} />
        </Button>
        <h1 className="text-xl font-bold">{patient.name}</h1>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-20">
          <Card className="border-none shadow-sm bg-primary/5 rounded-3xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="text-start">
                  <h2 className="text-lg font-bold">{patient.name}</h2>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {patient.phone}
                  </p>
                </div>
              </div>
              
              {patient.notes && (
                <div className="pt-4 border-t border-primary/10 text-start">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                    <FileText className="h-3 w-3" /> {t('notes')}
                  </p>
                  <p className="text-sm text-slate-700">{patient.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 flex items-center gap-2 px-1 text-start">
              <Calendar className="h-4 w-4 text-primary" />
              {t('appointmentHistory')}
            </h3>
            
            <div className="space-y-3">
              {patientAppointments.length > 0 ? (
                patientAppointments.map(app => (
                  <Card key={app.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1 text-start">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <p className="text-sm font-bold">
                            {format(new Date(app.dateTime), 'EEEE d MMMM, hh:mm a', { locale })}
                          </p>
                        </div>
                        {app.treatment && (
                          <p className="text-xs text-slate-500">{app.treatment}</p>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        app.status === 'attended' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'no-show' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t(app.status as any)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">{t('noPastAppointments')}</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-emerald-50 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-600">
                  {patientAppointments.filter(a => a.status === 'attended').length}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('attended')}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-rose-50 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Calendar className="h-6 w-6 text-rose-600 mb-2" />
                <p className="text-2xl font-bold text-rose-600">
                  {patientAppointments.filter(a => a.status === 'cancelled').length}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('cancelled')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
