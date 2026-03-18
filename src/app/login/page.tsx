
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  sendVerificationEmail,
  initiatePasswordReset
} from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Mail, RefreshCw, ChevronLeft, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';
import { signOut } from 'firebase/auth';

type LoginState = 'login' | 'signup' | 'verify-email' | 'forgot-password';

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
  const { t, setProfile, profile } = useClinic();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Spam protection timer
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

  // Auth synchronization
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
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return t('authError');
      case 'auth/email-already-in-use':
        return t('alreadyHaveAccount');
      default:
        return err.message;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (authState === 'forgot-password') {
      initiatePasswordReset(auth, email, {
        onSuccess: () => {
          setIsSubmitting(false);
          toast({ 
            title: t('resetPassword'), 
            description: t('resetLinkSent'),
          });
          setAuthState('login');
        },
        onError: (err) => {
          setIsSubmitting(false);
          toast({ 
            variant: "destructive", 
            title: t('authError'), 
            description: mapAuthError(err) 
          });
        }
      });
      return;
    }

    const callbacks = {
      onSuccess: (u: any) => {
        setIsSubmitting(false);
        if (authState === 'signup') {
          // Store basic profile info during signup
          setProfile({ 
            name: name || t('doctor'),
            phone: phoneNumber,
            role: 'doctor'
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
    } else if (authState === 'signup') {
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

  const isRTL = profile.language === 'ar';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 bg-primary rounded-[2rem] shadow-2xl shadow-primary/30 active:scale-95 transition-transform cursor-pointer" onClick={() => router.push('/welcome')}>
            <Stethoscope className="h-12 w-12 text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('appTitle')}</h1>
            <p className="text-sm text-slate-500 font-medium">{t('appSubtitle')}</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="text-center pb-2 relative">
            {authState === 'forgot-password' && (
              <button 
                onClick={() => setAuthState('login')}
                className={`absolute ${isRTL ? 'right-6' : 'left-6'} top-8 text-slate-400 hover:text-primary transition-colors`}
              >
                <ChevronLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
              </button>
            )}
            <CardTitle className="text-slate-900 dark:text-white font-bold text-xl pt-4">
              {authState === 'login' ? t('login') : 
               authState === 'signup' ? t('register') : 
               authState === 'forgot-password' ? t('resetPassword') : t('verifyEmail')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {(authState === 'login' || authState === 'signup' || authState === 'forgot-password') && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {authState === 'signup' && (
                  <>
                    <div className="space-y-2 text-start">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('patientName')}</Label>
                      <Input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                        placeholder={t('doctor')}
                      />
                    </div>
                    <div className="space-y-2 text-start">
                      <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('phone')}</Label>
                      <Input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                        placeholder="+123 456 789"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-2 text-start">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('email')}</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
                {authState !== 'forgot-password' && (
                  <div className="space-y-2 text-start">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('password')}</Label>
                    <Input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                
                {authState === 'login' && (
                  <div className="text-start">
                    <button 
                      type="button"
                      onClick={() => setAuthState('forgot-password')}
                      className="text-xs text-primary font-bold hover:opacity-80 transition-opacity"
                    >
                      {t('forgotPassword')}
                    </button>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl text-lg font-bold mt-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 
                    (authState === 'login' ? t('login') : 
                     authState === 'signup' ? t('register') : t('sendResetLink'))}
                </Button>
                
                <div className="text-center pt-2">
                  <button 
                    type="button"
                    onClick={() => setAuthState(authState === 'login' ? 'signup' : 'login')}
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    {authState === 'login' ? t('dontHaveAccount') : 
                     authState === 'signup' ? t('alreadyHaveAccount') : t('backToLogin')}
                  </button>
                </div>
              </form>
            )}

            {authState === 'verify-email' && (
              <div className="space-y-6 text-center py-4">
                <div className="flex justify-center">
                  <div className="p-6 bg-primary/10 rounded-full animate-bounce">
                    <Mail className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{t('verifyEmail')}</h3>
                  <p className="text-sm text-slate-500 px-4 leading-relaxed font-medium">
                    {t('checkEmail')}
                  </p>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleResendEmail} 
                    disabled={emailTimer > 0 || isSubmitting}
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-primary text-primary font-bold gap-2 active:scale-95 transition-all"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                    {emailTimer > 0 ? t('waitOTP').replace('{seconds}', emailTimer.toString()) : t('resendEmail')}
                  </Button>
                  <Button onClick={() => window.location.reload()} className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                    {t('signIn')}
                  </Button>
                  <button onClick={handleLogout} className="text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest mt-4">
                    {t('logout')}
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Medical Grade Encryption</span>
        </div>
      </div>
    </div>
  );
}
