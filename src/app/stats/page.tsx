"use client";

import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  Loader2, 
  Pill, 
  CheckCircle2, 
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function StatsPage() {
  const { appointments, patients, medications, history, t, isLoaded, profile } = useClinic();

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- Clinical Data Processing ---
  const totalApps = appointments.length;
  const attendedApps = appointments.filter(a => a.status === 'attended').length;
  const cancelledApps = appointments.filter(a => a.status === 'cancelled').length;
  const noShowApps = appointments.filter(a => a.status === 'no-show').length;
  const attendanceRate = totalApps > 0 ? Math.round((attendedApps / totalApps) * 100) : 0;

  const appStatusData = [
    { name: t('attended'), value: attendedApps, color: 'hsl(var(--primary))' },
    { name: t('cancelled'), value: cancelledApps, color: 'hsl(var(--destructive))' },
    { name: t('noShow'), value: noShowApps, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // --- Medication Data Processing ---
  const totalLogs = history.length;
  const takenLogs = history.filter(h => h.status === 'taken').length;
  const adherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 0;
  const lowStockMeds = medications.filter(m => m.remainingQuantity <= m.refillThreshold).length;

  const medStatusData = [
    { name: t('taken'), value: takenLogs, color: 'hsl(var(--primary))' },
    { name: t('missed'), value: history.filter(h => h.status === 'missed').length, color: 'hsl(var(--destructive))' },
    { name: t('skipped'), value: history.filter(h => h.status === 'skipped').length, color: 'hsl(var(--muted-foreground))' },
  ].filter(d => d.value > 0);

  const isRTL = profile.language === 'ar';

  return (
    <div className="flex flex-col h-screen pb-20 bg-background transition-colors" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b text-start pt-safe-area-inset-top">
        <h1 className="text-2xl font-bold text-foreground">{t('stats')}</h1>
        <p className="text-xs text-muted-foreground">{t('overview')}</p>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-8 pb-10">
          
          {/* Section: Clinical Performance */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
              {t('clinicalPerformance')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-primary/5 rounded-3xl">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Activity className="h-6 w-6 text-primary mb-2" />
                  <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('attendanceRate')}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-muted/20 rounded-3xl">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Users className="h-6 w-6 text-foreground/70 mb-2" />
                  <p className="text-2xl font-bold text-foreground">{patients.length}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('totalPatients')}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border shadow-sm bg-card rounded-[2rem]">
              <CardHeader className="pb-0 text-start">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {t('appointments')}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-4">
                {appStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={appStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {appStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted/30">
                    <Activity className="h-10 w-10 opacity-20 mb-2" />
                    <p className="text-xs">{t('noAppointments')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Section: Personal Health (MediMind) */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
              {t('personalHealth')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{adherenceRate}%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('adherenceRate')}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-rose-50 dark:bg-rose-900/10 rounded-3xl">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 mb-2" />
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{lowStockMeds}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('lowStockWarning')}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border shadow-sm bg-card rounded-[2rem]">
              <CardHeader className="pb-0 text-start">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  {t('medications')}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[220px] p-4">
                {medStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={medStatusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {medStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted/30">
                    <Pill className="h-10 w-10 opacity-20 mb-2" />
                    <p className="text-xs">{t('noPastAppointments')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Activity Section */}
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-[2rem] overflow-hidden">
            <CardContent className="p-6 text-start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('monthlyGrowth')}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span>{t('clinicalPerformance')}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${attendanceRate}%` }} />
                  </div>
                  <span className="font-bold">{attendanceRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>{t('personalHealth')}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${adherenceRate}%` }} />
                  </div>
                  <span className="font-bold">{adherenceRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}