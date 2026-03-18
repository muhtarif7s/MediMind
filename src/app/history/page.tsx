"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle2, XCircle, Activity, Loader2, LogIn, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

function HistorySkeleton() {
  return (
    <div className="flex flex-col h-screen p-6 space-y-6">
      <div className="h-10 w-48 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 bg-muted animate-pulse rounded-3xl" />
        <div className="h-24 bg-muted animate-pulse rounded-3xl" />
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-3xl" />
      <div className="space-y-4">
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
        <div className="h-16 bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { user, history, isLoaded, isHistoryLoading, loadMoreHistory, hasMoreHistory, t, profile } = useMediMind();
  const router = useRouter();

  if (!isLoaded && history.length === 0) {
    return <HistorySkeleton />;
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 space-y-4 bg-background">
        <p className="text-sm font-bold text-muted-foreground">{t('pleaseLoginFirst')}</p>
        <Button onClick={() => router.push('/login')} className="rounded-xl h-12 px-8">
          <LogIn className="h-4 w-4 mr-2" /> {t('signIn')}
        </Button>
      </div>
    );
  }

  const takenCount = history.filter(h => h.status === 'taken').length;
  const missedCount = history.filter(h => h.status === 'missed').length;
  const skippedCount = history.filter(h => h.status === 'skipped').length;
  const totalCompleted = takenCount + missedCount + skippedCount;

  const pieData = [
    { name: t('taken'), value: takenCount, color: 'hsl(var(--primary))' },
    { name: t('missed'), value: missedCount, color: 'hsl(var(--destructive))' },
    { name: t('skipped'), value: skippedCount, color: 'hsl(var(--muted-foreground))' },
  ];

  const adherence = totalCompleted > 0 ? Math.round((takenCount / totalCompleted) * 100) : 0;
  const isRTL = profile.language === 'ar';

  return (
    <div className="flex flex-col h-screen pb-20 animate-page-enter" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-6 bg-background text-start pt-safe-area-inset-top">
        <h1 className="text-2xl font-bold">{t('adherenceStats')}</h1>
        <p className="text-xs text-muted-foreground">{t('trackProgress')}</p>
      </header>

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-primary/10 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center">
                <Activity className="h-5 w-5 text-primary mb-2" />
                <span className="text-2xl font-bold">{adherence}%</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('adherenceRate')}</span>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-accent/10 rounded-3xl">
              <CardContent className="p-4 flex flex-col items-center">
                <CheckCircle2 className="h-5 w-5 text-accent mb-2" />
                <span className="text-2xl font-bold">{takenCount}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">{t('totalTaken')}</span>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl">
            <CardHeader className="pb-2 text-start">
              <CardTitle className="text-sm font-bold">{t('overview')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[200px] w-full">
              {totalCompleted > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground text-sm opacity-50">
                  {t('noHistoryData')}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4 pb-6">
            <h3 className="font-bold text-sm text-start">{t('recentHistory')}</h3>
            <div className="space-y-3">
              {history.map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-2xl bg-card border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${log.status === 'taken' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {log.status === 'taken' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="text-start">
                      <p className="text-xs font-bold capitalize">{log.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t(log.status as any)} • {new Date(log.recordedAt || '').toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              ))}

              {hasMoreHistory && (
                <div className="py-2 flex justify-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={loadMoreHistory} 
                    disabled={isHistoryLoading}
                    className="gap-2 text-xs font-bold text-primary rounded-xl"
                  >
                    {isHistoryLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ChevronDown className="h-4 w-4" /> {t('viewAll')}</>}
                  </Button>
                </div>
              )}

              {history.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="text-xs">{t('noHistoryData')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
