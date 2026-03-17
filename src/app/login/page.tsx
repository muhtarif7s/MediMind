
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const { t } = useClinic();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) router.push('/');
  }, [user, isUserLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    initiateEmailSignIn(auth, email, password, {
      onError: (err) => {
        setIsSubmitting(false);
        toast({ variant: "destructive", title: "خطأ في الدخول", description: "يرجى التأكد من البريد وكلمة المرور" });
      }
    });
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-primary rounded-3xl shadow-xl shadow-primary/20">
            <Stethoscope className="h-12 w-12 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">{t('appTitle')}</h1>
            <p className="text-sm text-slate-500 font-medium">نظام إدارة عيادات الأسنان</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white rounded-[2rem]">
          <CardHeader className="text-center">
            <CardTitle>{t('login')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 pr-1">{t('email')}</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 pr-1">{t('password')}</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-slate-50 border-none"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-bold">
                {isSubmitting ? <Loader2 className="animate-spin" /> : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
