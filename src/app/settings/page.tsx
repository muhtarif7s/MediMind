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

export default function SettingsPage() {
  const { profile, setProfile, isLoaded } = useMediMind();

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen pb-20">
      <header className="p-6 bg-background">
        <h1 className="text-2xl font-bold">Settings</h1>
      </header>

      <div className="px-6 space-y-8 flex-1 overflow-auto no-scrollbar">
        <div className="flex flex-col items-center py-4 bg-primary/5 rounded-3xl mb-4">
          <Avatar className="h-24 w-24 border-4 border-background mb-4">
            <AvatarImage src="https://picsum.photos/seed/user1/200/200" />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-xs text-muted-foreground">MediMind Premium Member</p>
          <Button variant="ghost" className="mt-2 text-primary text-xs font-bold h-8">Edit Profile</Button>
        </div>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Install as App</h3>
          <Card className="border-none shadow-sm bg-accent/5">
            <CardContent className="p-4">
              <Accordion type="single" collapsible>
                <AccordionItem value="install-guide" className="border-none">
                  <AccordionTrigger className="py-0 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent/10 rounded-lg"><Smartphone className="h-4 w-4 text-accent" /></div>
                      <div className="text-left">
                        <p className="text-sm font-medium">How to install</p>
                        <p className="text-[10px] text-muted-foreground">Add MediMind to your home screen</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 text-xs text-muted-foreground space-y-2">
                    <p><strong>iOS:</strong> Tap the <Download className="inline h-3 w-3" /> Share icon and select "Add to Home Screen".</p>
                    <p><strong>Android:</strong> Tap the menu icon (three dots) and select "Install app" or "Add to Home screen".</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preferences</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg"><Bell className="h-4 w-4 text-accent" /></div>
                  <Label htmlFor="notifications" className="text-sm font-medium">Notifications</Label>
                </div>
                <Switch 
                  id="notifications" 
                  checked={profile.notificationsEnabled} 
                  onCheckedChange={(val) => setProfile({...profile, notificationsEnabled: val})} 
                />
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg"><Moon className="h-4 w-4 text-primary" /></div>
                  <Label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode</Label>
                </div>
                <Switch 
                  id="dark-mode" 
                  checked={profile.theme === 'dark'} 
                  onCheckedChange={(val) => setProfile({...profile, theme: val ? 'dark' : 'light'})} 
                />
              </div>
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Globe className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">Language</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>English</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Security</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600"><ShieldCheck className="h-4 w-4" /></div>
                  <span className="text-sm font-medium">Biometric Lock</span>
                </div>
                <Switch id="biometric" />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4 pb-10">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">About</h3>
          <Card className="border-none shadow-sm">
            <CardContent className="p-0 divide-y">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg"><Info className="h-4 w-4 text-muted-foreground" /></div>
                  <span className="text-sm font-medium">Version</span>
                </div>
                <span className="text-xs text-muted-foreground">1.0.2 (PWA)</span>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <NavBar />
    </div>
  );
}