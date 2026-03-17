
"use client";

import { useClinic } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Calendar, CheckCircle2, Activity } from 'lucide-react';

export default function StatsPage() {
  const { appointments, patients, t, isLoaded } = useClinic();

  if (!isLoaded) return null;

  // Simple stats calculation
  const total = appointments.length;
  const attended = appointments.filter(a => a.status === 'attended').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;
  const noShow = appointments.filter(a => a.status === 'no-show').length;
  const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

  const statusData = [
    { name: t('attended'), value: attended, color: '#10b981' },
    { name: t('cancelled'), value: cancelled, color: '#f43f5e' },
    { name: t('noShow'), value: noShow, color: '#f59e0b' },
    { name: t('pending'), value: total - attended - cancelled - noShow, color: '#64748b' }
  ];

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-slate-900">{t('stats')}</h1>
        <p className="text-xs text-slate-500">{t('monthlyGrowth')}</p>
      </header>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6 pb-10">
          {/* Top Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-primary mb-2" />
                <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('attendanceRate')}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-emerald-50">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <Users className="h-6 w-6 text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-600">{patients.length}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{t('totalPatients')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown Chart */}
          <Card className="border-none shadow-sm bg-white rounded-3xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-bold">{t('status')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[250px] p-4">
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
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Placeholder */}
          <Card className="border-none shadow-sm bg-slate-900 text-white rounded-3xl">
            <CardContent className="p-6">
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
                    <div className="h-full bg-primary" style={{ width: '75%' }} />
                  </div>
                  <span className="font-bold">75%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span>{t('noShow')}</span>
                  <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '15%' }} />
                  </div>
                  <span className="font-bold">15%</span>
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
