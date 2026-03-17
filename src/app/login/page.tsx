"use client";

import { useState, useEffect } from 'react';
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
import { Stethoscope, Loader2, Mail, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClinic } from '@/lib/store';
import { signOut } from 'firebase/auth';

type LoginState = 'login' | 'signup' | 'verify-email' | 'verify-phone';

export default function LoginPage() {
  const [authState, setAuthState] = useState<LoginState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  
  const { user, isUserLoading } = useUser();
  const { t } = useClinic();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      if (!user.emailVerified) {
        setAuthState('verify-email');
      } else if (!user.phoneNumber) {
        setAuthState('verify-phone');
      } else {
        router.push('/');
      }
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
          toast({ title: t('registerSuccess'), description: t('checkEmail') });
        }
      },
      onError: (err: any) => {
        setIsSubmitting(false);
        toast({ 
          variant: "destructive", 
          title: t('authError'), 
          description: err.message
        });
      }
    };

    if (authState === 'login') {
      initiateEmailSignIn(auth, email, password, callbacks);
    } else {
      initiateEmailSignUp(auth, email, password, callbacks);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const verifier = setupRecaptcha(auth, 'recaptcha-container');
      const result = await initiatePhoneSignIn(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      toast({ title: t('otpSent') });
    } catch (err: any) {
      toast({ variant: "destructive", title: t('authError'), description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(otpCode);
      toast({ title: t('phoneVerified') });
      router.push('/');
    } catch (err: any) {
      toast({ variant: "destructive", title: t('invalidOTP') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = () => {
    if (user) {
      sendVerificationEmail(user);
      toast({ title: t('emailVerificationSent') });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAuthState('login');
  };

  if (isUserLoading) return null;

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
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                  <Mail className="h-16 w-16 text-primary animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground px-4 leading-relaxed">
                  {t('checkEmail')}
                </p>
                <div className="space-y-3">
                  <Button onClick={handleResendEmail} variant="outline" className="w-full h-12 rounded-xl border-primary text-primary font-bold">
                    {t('resendEmail')}
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl font-bold">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : t('verifyOTP')}
                    </Button>
                    <button 
                      type="button"
                      onClick={() => setConfirmationResult(null)}
                      className="w-full text-xs text-primary font-bold hover:underline"
                    >
                      {t('resendEmail')}
                    </button>
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
