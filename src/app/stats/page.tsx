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
} from 'recharts';
import { TrendingUp, Users, Activity, Loader2 } from 'lucide-react';

export default function StatsPage() {
  const { appointments, patients, t, isLoaded, profile } = useClinic();

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const total = appointments.length;
  const attended = appointments.filter(a => a.status === 'attended').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const noShow = appointments.filter(a => a.status === 'no-show').length;
  const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

  const statusData = [
    { name: t('attended'), value: attended, color: '#10b981' },
    { name: t('cancelled'), value: cancelled, color: '#f43f5e' },
    { name: t('noShow'), value: noShow, color: '#f59e0b' },
    { name: t('pending'), value: Math.max(0, total - attended - cancelled - noShow), color: '#64748b' }
  ].filter(d => d.value > 0);

  return (
    <div className="flex flex-col h-screen pb-20 bg-background transition-colors" dir={profile.language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-card border-b text-start">
        <h1 className="text-2xl font-bold text-foreground">{t('stats')}</h1>
        <p className="text-xs text-muted-foreground">{t('monthlyGrowth')}</p>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-10">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('attendanceRate')}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-50 dark:bg-emerald-900/10">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{patients.length}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('totalPatients')}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border shadow-sm bg-card rounded-3xl">
            <CardHeader className="pb-0 text-start">
              <CardTitle className="text-sm font-bold">{t('status')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
              {statusData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-start">
                    {statusData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted/30">
                  <Activity className="h-10 w-10 opacity-20 mb-2" />
                  <p className="text-xs">{t('noAppointments')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-start">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  {t('last7Days')}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span>{t('attended')}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${attendanceRate}%` }} />
                  </div>
                  <span className="font-bold">{attendanceRate}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>{t('noShow')}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: total > 0 ? `${Math.round((noShow / total) * 100)}%` : '0%' }} />
                  </div>
                  <span className="font-bold">{total > 0 ? Math.round((noShow / total) * 100) : 0}%</span>
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
