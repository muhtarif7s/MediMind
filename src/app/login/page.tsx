"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
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
    
    const callbacks = {
      onError: (err: any) => {
        setIsSubmitting(false);
        toast({ 
          variant: "destructive", 
          title: t('authError'), 
          description: err.message || t('authError')
        });
      }
    };

    if (isLogin) {
      initiateEmailSignIn(auth, email, password, callbacks);
    } else {
      initiateEmailSignUp(auth, email, password, callbacks);
    }
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="rtl">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-primary rounded-3xl shadow-xl shadow-primary/20">
            <Stethoscope className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">{t('appTitle')}</h1>
            <p className="text-sm text-muted-foreground font-medium">{t('appSubtitle')}</p>
          </div>
        </div>

        <Card className="border shadow-xl bg-card rounded-[2rem]">
          <CardHeader className="text-center">
            <CardTitle className="text-foreground">{isLogin ? t('login') : t('register')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground pr-1">{t('email')}</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground pr-1">{t('password')}</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl text-lg font-bold mt-2">
                {isSubmitting ? <Loader2 className="animate-spin" /> : (isLogin ? t('login') : t('register'))}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-primary font-bold hover:underline"
              >
                {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}