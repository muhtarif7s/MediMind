
"use client";

import { useMediMind } from '@/lib/store';
import { NavBar } from '@/components/navigation/NavBar';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Bell, Moon, Globe, ShieldCheck, Info, Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { profile, setProfile, isLoaded, t } = useMediMind();
  const { toast } = useToast();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(profile.name);

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

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-background">
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
      </header>

      <div className="px-6 space-y-8 flex-1 overflow-auto no-scrollbar">
        <div className="flex flex-col items-center py-6 bg-primary/5 rounded-3xl mb-4">
          <Avatar className="h-24 w-24 border-4 border-background mb-4">
            <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
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
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-xs text-muted-foreground">{t('premiumMember')}</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-primary text-xs font-bold h-8"
                onClick={() => {
                  setNewName(profile.name);
                  setEditingName(true);
                }}
              >
                {t('editProfile')}
              </Button>
            </>
          )}
        </div>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('installGuide')}</h3>
          <Card className="border-none shadow-sm bg-accent/5">
            <CardContent className="p-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="install-guide" className="border-none">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg"><Smartphone className="h-4 w-4 text-accent" /></div>
                      <div className="text-start">
                        <p className="text-sm font-medium">{t('installGuide')}</p>
                        <p className="text-[10px] text-muted-foreground">{t('installSubtitle')}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 text-xs text-muted-foreground space-y-2 text-start">
                    <p><strong>iOS:</strong> Tap the <Download className="inline h-3 w-3" /> Share icon and select "Add to Home Screen".</p>
                    <p><strong>Android:</strong> Tap the menu icon (three dots) and select "Install app" or "Add to Home screen".</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
                  checked={profile.notificationsEnabled} 
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
                  checked={profile.theme === 'dark'} 
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
                <Select value={profile.language} onValueChange={handleLanguageChange}>
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
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('security')}</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><ShieldCheck className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">{t('biometricLock')}</span>
                </div>
                <Switch id="biometric" />
              </div>
            </CardContent>
          </Card>
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
                <span className="text-xs text-muted-foreground">1.0.5 (PWA)</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <NavBar />
    </div>
  );
}
