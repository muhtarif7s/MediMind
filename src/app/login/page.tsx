
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { translations } from '@/lib/translations';
import { Pill, Loader2, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const t = (key: keyof typeof translations.en) => translations.en[key];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const callbacks = {
      onError: (err: any) => {
        setIsSubmitting(false);
        let message = "Please check your credentials and try again.";
        
        // Handle specific Firebase Auth error codes for better UX
        if (err.code === 'auth/invalid-credential') {
          message = "Invalid email or password. If you don't have an account, please click 'Create Account' below.";
        } else if (err.code === 'auth/email-already-in-use') {
          message = "This email is already registered. Please log in instead.";
        } else if (err.code === 'auth/weak-password') {
          message = "Password should be at least 6 characters.";
        }

        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: message,
        });
      }
    };

    if (isRegistering) {
      initiateEmailSignUp(auth, email, password, callbacks);
    } else {
      initiateEmailSignIn(auth, email, password, callbacks);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background items-center justify-center p-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="p-4 bg-primary rounded-3xl shadow-xl shadow-primary/20">
          <Pill className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-primary mt-2">MediMind</h1>
      </div>

      <Card className="w-full max-w-sm border-none shadow-none bg-transparent">
        <CardHeader className="text-center px-0">
          <CardTitle className="text-2xl font-bold">{isRegistering ? t('register') : t('login')}</CardTitle>
          <CardDescription>{isRegistering ? t('authSubtitle') : t('authWelcome')}</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-12 rounded-2xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl text-lg font-bold mt-6 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                isRegistering ? t('register') : t('login')
              )}
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">
              {isRegistering ? t('hasAccount') : t('noAccount')}
            </p>
            <Button 
              variant="link" 
              onClick={() => setIsRegistering(!isRegistering)}
              disabled={isSubmitting}
              className="text-primary font-bold h-auto p-0"
            >
              {isRegistering ? "Log In" : "Create Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
