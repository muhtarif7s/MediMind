
"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from '@/components/ui/scroll-area';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { CheckCircle2, XCircle, Clock, Activity } from 'lucide-react';

export default function HistoryPage() {
  const { history, isLoaded } = useMediMind();

  if (!isLoaded) return null;

  const takenCount = history.filter(h => h.status === 'taken').length;
  const missedCount = history.filter(h => h.status === 'missed').length;
  const skippedCount = history.filter(h => h.status === 'skipped').length;
  const totalCompleted = takenCount + missedCount + skippedCount;

  const pieData = [
    { name: 'Taken', value: takenCount, color: 'hsl(var(--primary))' },
    { name: 'Missed', value: missedCount, color: 'hsl(var(--destructive))' },
    { name: 'Skipped', value: skippedCount, color: 'hsl(var(--muted-foreground))' },
  ];

  // Adherence Percentage
  const adherence = totalCompleted > 0 ? Math.round((takenCount / totalCompleted) * 100) : 0;

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-background">
        <h1 className="text-2xl font-bold">Adherence Stats</h1>
        <p className="text-xs text-muted-foreground">Track your progress and consistency.</p>
      </header>

      <ScrollArea className="flex-1 px-6 space-y-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-primary/10">
            <CardContent className="p-4 flex flex-col items-center">
              <Activity className="h-5 w-5 text-primary mb-2" />
              <span className="text-2xl font-bold">{adherence}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Adherence</span>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-accent/10">
            <CardContent className="p-4 flex flex-col items-center">
              <CheckCircle2 className="h-5 w-5 text-accent mb-2" />
              <span className="text-2xl font-bold">{takenCount}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Taken</span>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Overview</CardTitle>
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
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                No history data available yet.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4 pb-6">
          <h3 className="font-bold text-sm">Recent History</h3>
          <div className="space-y-3">
            {history.slice(-5).reverse().map(log => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-card border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${log.status === 'taken' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                    {log.status === 'taken' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold capitalize">{log.status}</p>
                    <p className="text-[10px] text-muted-foreground">Recorded at {new Date(log.recordedAt || '').toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>

      <NavBar />
    </div>
  );
}
