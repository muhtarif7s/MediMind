
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  setupRecaptcha, 
  initiatePhoneSignIn,
  sendVerificationEmail
} from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Loader2, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';
import { signOut } from 'firebase/auth';

type LoginState = 'login' | 'signup' | 'verify-email' | 'verify-phone';

const MAX_OTP_ATTEMPTS = 3;
const COOLDOWN_DELAY = 60; // seconds

export default function LoginPage() {
  const [authState, setAuthState] = useState<LoginState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [timer, setTimer] = useState(0);
  const [emailTimer, setEmailTimer] = useState(0);
  const [otpAttempts, setOtpAttempts] = useState(0);
  
  const { user, isUserLoading } = useUser();
  const { t } = useClinic();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const emailTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer logic for OTP
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  // Countdown timer logic for Email
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
        } else if (!user.phoneNumber) {
          setAuthState('verify-phone');
        } else {
          router.push('/');
        }
      });
    }
  }, [user, isUserLoading, router]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const callbacks = {
      onSuccess: (u: any) => {
        setIsSubmitting(false);
        if (authState === 'signup') {
          setAuthState('verify-email');
          setEmailTimer(COOLDOWN_DELAY);
          toast({ title: t('registerSuccess'), description: t('checkEmail') });
        }
      },
      onError: (err: any) => {
        setIsSubmitting(false);
        const errorMessage = err.code === 'auth/too-many-requests' ? t('tooManyRequests') : err.message;
        toast({ 
          variant: "destructive", 
          title: t('authError'), 
          description: errorMessage
        });
      }
    };

    if (authState === 'login') {
      initiateEmailSignIn(auth, email, password, callbacks);
    } else {
      initiateEmailSignUp(auth, email, password, callbacks);
    }
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (timer > 0) return;

    setIsSubmitting(true);
    try {
      const verifier = setupRecaptcha(auth, 'recaptcha-container');
      const result = await initiatePhoneSignIn(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      setTimer(COOLDOWN_DELAY);
      setOtpAttempts(0);
      toast({ title: t('otpSent') });
    } catch (err: any) {
      const errorMessage = err.code === 'auth/too-many-requests' ? t('tooManyRequests') : err.message;
      toast({ variant: "destructive", title: t('authError'), description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpAttempts >= MAX_OTP_ATTEMPTS) {
      toast({ variant: "destructive", title: t('tooManyAttempts') });
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(otpCode);
      toast({ title: t('phoneVerified') });
      router.push('/');
    } catch (err: any) {
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);
      const errorMessage = err.code === 'auth/too-many-requests' ? t('tooManyRequests') : t('invalidOTP');
      toast({ 
        variant: "destructive", 
        title: t('authError'),
        description: newAttempts >= MAX_OTP_ATTEMPTS ? t('tooManyAttempts') : errorMessage
      });
    } finally {
      setIsSubmitting(false);
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
      const errorMessage = err.code === 'auth/too-many-requests' ? t('tooManyRequests') : err.message;
      toast({ variant: "destructive", title: t('authError'), description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthState('login');
    setConfirmationResult(null);
    setTimer(0);
    setEmailTimer(0);
  };

  if (isUserLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6" dir="auto">
      <div id="recaptcha-container"></div>
      
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
               authState === 'signup' ? t('register') : 
               authState === 'verify-email' ? t('verifyEmail') : t('verifyPhone')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(authState === 'login' || authState === 'signup') && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
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

            {authState === 'verify-phone' && (
              <div className="space-y-5">
                {!confirmationResult ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2 text-start">
                      <Label className="text-xs font-bold text-muted-foreground">{t('phone')}</Label>
                      <Input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={e => setPhoneNumber(e.target.value)} 
                        required 
                        placeholder="+1234567890"
                        className="h-12 rounded-xl bg-muted/50 border-none text-foreground"
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl font-bold">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : t('sendOTP')}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="space-y-2 text-start">
                      <Label className="text-xs font-bold text-muted-foreground">{t('enterOTP')}</Label>
                      <Input 
                        type="text" 
                        value={otpCode} 
                        onChange={e => setOtpCode(e.target.value)} 
                        required 
                        maxLength={6}
                        placeholder="000000"
                        className="h-12 rounded-xl bg-muted/50 border-none text-foreground text-center text-xl tracking-widest font-mono"
                      />
                      {otpAttempts > 0 && (
                        <p className="text-[10px] text-destructive text-center font-bold">
                          {t('invalidOTP')} ({MAX_OTP_ATTEMPTS - otpAttempts} {t('remainingQuantity')})
                        </p>
                      )}
                    </div>
                    
                    <Button type="submit" disabled={isSubmitting || otpAttempts >= MAX_OTP_ATTEMPTS} className="w-full h-14 rounded-xl font-bold">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : t('verifyOTP')}
                    </Button>

                    <div className="flex flex-col items-center gap-2">
                      <button 
                        type="button"
                        disabled={timer > 0 || isSubmitting}
                        onClick={() => handleSendOTP()}
                        className="text-xs text-primary font-bold hover:underline disabled:text-muted-foreground disabled:no-underline"
                      >
                        {timer > 0 ? t('waitOTP').replace('{seconds}', timer.toString()) : t('resendOTP')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setConfirmationResult(null)}
                        className="text-[10px] text-muted-foreground hover:underline"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </form>
                )}
                <button onClick={handleLogout} className="w-full text-xs text-muted-foreground hover:underline">
                  {t('logout')}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
