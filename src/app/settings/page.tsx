
"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Moon, 
  Globe, 
  ShieldCheck, 
  Info, 
  Smartphone, 
  Download,
  LogOut,
  Database,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { profile, setProfile, isLoaded, t, clearPatients, clearAppointments } = useMediMind();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');

  if (!isLoaded) return null;

  const handleUpdateName = () => {
    setProfile({ name: newName });
    setEditingName(false);
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdateSuccess'),
    });
  };

  const handleLanguageChange = (val: 'en' | 'ar') => {
    setProfile({ language: val });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleResetData = (type: 'patients' | 'appointments') => {
    if (type === 'patients') clearPatients();
    else clearAppointments();
    
    toast({
      title: t('resetSuccess'),
      description: t('resetSuccess'),
    });
  };

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-background">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
      </header>

      <div className="px-6 space-y-8 flex-1 overflow-auto no-scrollbar">
        <div className="flex flex-col items-center py-6 bg-primary/5 rounded-3xl mb-4">
          <Avatar className="h-24 w-24 border-4 border-background mb-4">
            <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
            <AvatarFallback>{profile?.name ? profile.name[0] : 'D'}</AvatarFallback>
          </Avatar>
          
          {editingName ? (
            <div className="flex flex-col items-center gap-2 w-full px-10">
              <Input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                className="text-center font-bold"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>{t('cancel')}</Button>
                <Button size="sm" onClick={handleUpdateName}>{t('save')}</Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold">{profile?.name}</h2>
              <p className="text-xs text-muted-foreground">{t('premiumMember')}</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-primary text-xs font-bold h-8"
                onClick={() => {
                  setNewName(profile?.name || '');
                  setEditingName(true);
                }}
              >
                {t('editProfile')}
              </Button>
            </>
          )}
        </div>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('dataManagement')}</h3>
          <Card className="border-none shadow-sm bg-rose-50/50">
            <CardContent className="p-0 divide-y divide-rose-100/50">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Trash2 className="h-4 w-4" /></div>
                      <span className="text-sm font-medium text-rose-700">{t('clearPatients')}</span>
                    </div>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]" dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">{t('clearPatients')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      {t('confirmClear')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogAction onClick={() => handleResetData('patients')} className="bg-rose-600 hover:bg-rose-700 rounded-xl flex-1">
                      {t('save')}
                    </AlertDialogAction>
                    <AlertDialogCancel className="rounded-xl flex-1 mt-0">
                      {t('cancel')}
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-rose-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><Database className="h-4 w-4" /></div>
                      <span className="text-sm font-medium text-rose-700">{t('clearAppointments')}</span>
                    </div>
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-[2rem]" dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-right">{t('clearAppointments')}</AlertDialogTitle>
                    <AlertDialogDescription className="text-right">
                      {t('confirmClear')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-row-reverse gap-2">
                    <AlertDialogAction onClick={() => handleResetData('appointments')} className="bg-rose-600 hover:bg-rose-700 rounded-xl flex-1">
                      {t('save')}
                    </AlertDialogAction>
                    <AlertDialogCancel className="rounded-xl flex-1 mt-0">
                      {t('cancel')}
                    </AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('preferences')}</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg"><Bell className="h-4 w-4 text-accent" /></div>
                  <Label htmlFor="notifications" className="text-sm font-medium">{t('reminders')}</Label>
                </div>
                <Switch 
                  id="notifications" 
                  checked={profile?.notificationsEnabled} 
                  onCheckedChange={(val) => setProfile({ notificationsEnabled: val })} 
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Moon className="h-4 w-4 text-primary" /></div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium">{t('darkMode')}</Label>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={profile?.theme === 'dark'} 
                  onCheckedChange={(val) => {
                    setProfile({ theme: val ? 'dark' : 'light' });
                    document.documentElement.classList.toggle('dark', val);
                  }} 
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Globe className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">{t('language')}</span>
                </div>
                <Select value={profile?.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[100px] h-8 text-xs border-none bg-muted/50 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <Button 
            variant="ghost" 
            className="w-full h-12 justify-between px-4 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-2xl border border-destructive/20"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-3">
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-bold">{t('logout')}</span>
            </div>
          </Button>
        </section>

        <section className="space-y-4 pb-10">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('about')}</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg"><Info className="h-4 w-4 text-muted-foreground" /></div>
                  <span className="text-sm font-medium">{t('version')}</span>
                </div>
                <span className="text-xs text-muted-foreground">1.1.0 (Auth)</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <NavBar />
    </div>
  );
}
