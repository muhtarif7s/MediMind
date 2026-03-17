
"use client";

import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Calendar, Users, Activity, Stethoscope } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const { user, isUserLoading, isLoaded, t, patients, getTodayAppointments } = useClinic();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) router.push('/login');
  }, [user, isUserLoading, router]);

  if (isUserLoading || !isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const todayApps = getTodayAppointments();

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-primary text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">{t('appTitle')}</h1>
        </div>
        <p className="text-sm opacity-90">{t('welcome')}</p>
        <p className="text-2xl font-bold">{user?.displayName || 'دكتور'}</p>
      </header>

      <ScrollArea className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-md bg-sky-50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Calendar className="h-6 w-6 text-primary mb-2" />
              <p className="text-2xl font-bold text-primary">{todayApps.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{t('todayAppointments')}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-emerald-50">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <Users className="h-6 w-6 text-emerald-600 mb-2" />
              <p className="text-2xl font-bold text-emerald-600">{patients.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{t('totalPatients')}</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            {t('todayAppointments')}
          </h3>
          <div className="space-y-3">
            {todayApps.length > 0 ? (
              todayApps.map(app => (
                <Card key={app.id} className="border shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">{app.patientName}</p>
                      <p className="text-[10px] text-slate-500">
                        {format(new Date(app.dateTime), 'hh:mm a', { locale: ar })}
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
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-sm text-slate-400 py-6">{t('noAppointments')}</p>
            )}
          </div>
        </section>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
