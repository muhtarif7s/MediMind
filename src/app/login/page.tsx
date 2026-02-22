
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { initiateEmailSignIn, initiateEmailSignUp } from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { translations } from '@/lib/translations';
import { Pill } from 'lucide-react';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();

  // Simple language detection for auth page
  const t = (key: keyof typeof translations.en) => translations.en[key];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      initiateEmailSignUp(auth, email, password);
    } else {
      initiateEmailSignIn(auth, email, password);
    }
  };

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
          <CardDescription>{t('authSubtitle')}</CardDescription>
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
                className="h-12 rounded-2xl bg-card border-none shadow-sm"
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
                className="h-12 rounded-2xl bg-card border-none shadow-sm"
              />
            </div>
            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold mt-6 shadow-lg shadow-primary/20">
              {isRegistering ? t('register') : t('login')}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isRegistering ? t('hasAccount') : t('noAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
