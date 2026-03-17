
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  sendVerificationEmail
} from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';
import { signOut } from 'firebase/auth';

type LoginState = 'login' | 'signup' | 'verify-email';

const COOLDOWN_DELAY = 60; // seconds

export default function LoginPage() {
  const [authState, setAuthState] = useState<LoginState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTimer, setEmailTimer] = useState(0);
  
  const { user, isUserLoading } = useUser();
  const { t, setProfile } = useClinic();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (emailTimer > 0) {
      emailTimerRef.current = setInterval(() => {
        setEmailTimer((prev) => prev - 1);
      }, 1000);
    } else if (emailTimer === 0 && emailTimerRef.current) {
      clearInterval(emailTimerRef.current);
    }
    return () => {
      if (emailTimerRef.current) clearInterval(emailTimerRef.current);
    };
  }, [emailTimer]);

  useEffect(() => {
    if (!isUserLoading && user) {
      user.reload().then(() => {
        if (!user.emailVerified) {
          setAuthState('verify-email');
        } else {
          router.push('/');
        }
      });
    }
  }, [user, isUserLoading, router]);

  const mapAuthError = (err: any) => {
    switch (err.code) {
      case 'auth/too-many-requests':
        return t('tooManyRequests');
      case 'auth/operation-not-allowed':
        return t('operationNotAllowed');
      default:
        return err.message;
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const callbacks = {
      onSuccess: (u: any) => {
        setIsSubmitting(false);
        if (authState === 'signup') {
          // Initialize profile with name and phone
          setProfile({ 
            name: name || t('doctor'),
            phone: phoneNumber 
          });
          setAuthState('verify-email');
          setEmailTimer(COOLDOWN_DELAY);
          toast({ title: t('registerSuccess'), description: t('checkEmail') });
        }
      },
      onError: (err: any) => {
        setIsSubmitting(false);
        toast({ 
          variant: "destructive", 
          title: t('authError'), 
          description: mapAuthError(err)
        });
      }
    };

    if (authState === 'login') {
      initiateEmailSignIn(auth, email, password, callbacks);
    } else {
      initiateEmailSignUp(auth, email, password, callbacks);
    }
  };

  const handleResendEmail = async () => {
    if (emailTimer > 0 || !user) return;
    
    setIsSubmitting(true);
    try {
      await sendVerificationEmail(user);
      setEmailTimer(COOLDOWN_DELAY);
      toast({ title: t('emailVerificationSent') });
    } catch (err: any) {
      toast({ variant: "destructive", title: t('authError'), description: mapAuthError(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthState('login');
    setEmailTimer(0);
  };

  if (isUserLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="auto">
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
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-foreground">
              {authState === 'login' ? t('login') : 
               authState === 'signup' ? t('register') : t('verifyEmail')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(authState === 'login' || authState === 'signup') && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                {authState === 'signup' && (
                  <>
                    <div className="space-y-2 text-start">
                      <Label className="text-xs font-bold text-muted-foreground">{t('patientName')}</Label>
                      <Input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                        placeholder={t('doctor')}
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label className="text-xs font-bold text-muted-foreground">{t('phone')}</Label>
                      <Input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                        placeholder="+1234567890"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2 text-start">
                  <Label className="text-xs font-bold text-muted-foreground">{t('email')}</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2 text-start">
                  <Label className="text-xs font-bold text-muted-foreground">{t('password')}</Label>
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
                  {isSubmitting ? <Loader2 className="animate-spin" /> : (authState === 'login' ? t('login') : t('register'))}
                </Button>
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setAuthState(authState === 'login' ? 'signup' : 'login')}
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    {authState === 'login' ? t('dontHaveAccount') : t('alreadyHaveAccount')}
                  </button>
                </div>
              </form>
            )}

            {authState === 'verify-email' && (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Mail className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                  {t('checkEmail')}
                </p>
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail} 
                    disabled={emailTimer > 0 || isSubmitting}
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-primary text-primary font-bold gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    {emailTimer > 0 ? t('waitOTP').replace('{seconds}', emailTimer.toString()) : t('resendEmail')}
                  </Button>
                  <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-xl font-bold">
                    {t('signIn')}
                  </Button>
                  <button onClick={handleLogout} className="text-xs text-muted-foreground hover:underline">
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
