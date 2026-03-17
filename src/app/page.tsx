
"use client";

import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, Calendar, Users, Activity, Stethoscope, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isUserLoading, isLoaded, t, patients, getTodayAppointments, profile } = useClinic();
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
      <header className="p-6 bg-primary text-white rounded-b-[2.5rem] shadow-xl shadow-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold">{t('appTitle')}</h1>
          </div>
          <Button variant="ghost" size="icon" className="bg-white/10 rounded-full" onClick={() => router.push('/settings')}>
            <div className="h-8 w-8 rounded-full bg-white text-primary flex items-center justify-center font-bold">
              {(profile?.name || 'D')[0]}
            </div>
          </Button>
        </div>
        <div className="space-y-1">
          <p className="text-sm opacity-80">{t('welcome')}</p>
          <p className="text-2xl font-bold">{profile?.name || t('doctor')}</p>
        </div>
      </header>

      <ScrollArea className="flex-1 p-6 space-y-8">
        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            {t('quickActions')}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/clients" className="block">
              <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-blue-50 rounded-2xl">
                  <Plus className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">{t('addPatient')}</span>
              </div>
            </Link>
            <Link href="/appointments" className="block">
              <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 flex flex-col items-center text-center gap-2">
                <div className="p-3 bg-emerald-50 rounded-2xl">
                  <Calendar className="h-6 w-6 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-slate-700">{t('bookAppointment')}</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-slate-50 rounded-3xl">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <p className="text-2xl font-bold text-slate-900">{todayApps.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{t('todayAppointments')}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-slate-50 rounded-3xl">
            <CardContent className="p-4 flex flex-col items-center text-center">
              <p className="text-2xl font-bold text-slate-900">{patients.length}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{t('totalPatients')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {t('todayAppointments')}
            </h3>
            <Link href="/appointments" className="text-[10px] font-bold text-primary flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {todayApps.length > 0 ? (
              todayApps.map(app => (
                <Card key={app.id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{app.patientName}</p>
                        <p className="text-[10px] text-slate-500">
                          {format(new Date(app.dateTime), 'hh:mm a', { locale: ar })}
                        </p>
                      </div>
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
              <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">{t('noAppointments')}</p>
              </div>
            )}
          </div>
        </section>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
