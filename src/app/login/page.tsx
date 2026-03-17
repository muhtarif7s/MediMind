"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pill, Loader2, Mail, Lock, UserPlus, LogIn, ArrowRight } from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);

    const callbacks = {
      onError: (err: any) => {
        setIsSubmitting(false);
        console.error('Auth Error:', err);
        
        let message = "An error occurred. Please try again.";
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          message = "Incorrect email or password. If you don't have an account, tap 'Create New Account' below.";
        } else if (err.code === 'auth/email-already-in-use') {
          message = "This email is already registered. Please log in instead.";
          setIsRegistering(false);
        } else if (err.code === 'auth/weak-password') {
          message = "Password must be at least 6 characters.";
        } else if (err.code === 'auth/invalid-email') {
          message = "Please enter a valid email address.";
        }

        toast({
          variant: "destructive",
          title: "Authentication Issue",
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col p-6 items-center justify-center">
        <div className="w-full max-w-sm space-y-8 py-10">
          <div className="flex flex-col items-center gap-3">
            <div className="p-5 bg-primary rounded-[2rem] shadow-2xl shadow-primary/30">
              <Pill className="h-10 w-10 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">MediMind</h1>
              <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-widest opacity-70">Health Companion</p>
            </div>
          </div>

          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="text-center px-0 pb-6">
              <CardTitle className="text-2xl font-bold">
                {isRegistering ? "Join MediMind" : "Welcome Back"}
              </CardTitle>
              <CardDescription className="text-sm mt-2">
                {isRegistering 
                  ? "Track your medications securely with our smart health companion." 
                  : "Sign in to access your daily medication schedule."}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2 px-1">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 rounded-2xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2 px-1">
                    <Lock className="h-3 w-3" /> Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="h-12 rounded-2xl bg-card border-none shadow-sm focus:ring-2 focus:ring-primary text-base"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 rounded-2xl text-lg font-bold mt-4 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {isRegistering ? <UserPlus className="h-5 w-5" /> : <LogIn className="h-5 w-5" />}
                      {isRegistering ? "Create Account" : "Sign In"}
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className="w-full flex items-center gap-4 py-2">
                  <div className="h-[1px] bg-border flex-1"></div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-tighter">or switch mode</span>
                  <div className="h-[1px] bg-border flex-1"></div>
                </div>

                <div className="text-center space-y-4 w-full">
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRegistering ? "Already using MediMind?" : "New to our platform?"}
                  </p>
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-2xl border-primary/30 text-primary font-bold hover:bg-primary/5 px-6 flex items-center justify-center gap-2 transition-all active:scale-95 bg-background"
                  >
                    {isRegistering ? "Sign In to your Account" : "Create New Account"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="p-6 text-center">
        <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.3em]">
          MediMind Health Assistant • Secure v1.3.1
        </p>
      </div>
    </div>
  );
}