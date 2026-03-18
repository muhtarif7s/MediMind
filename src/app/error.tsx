'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { AlertCircle, LogOut, RefreshCcw, ShieldX } from 'lucide-react';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    logger.error('Runtime', error.message, { digest: error.digest });
  }, [error]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (e) {
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-background animate-page-enter">
      <div className="mb-8 p-6 bg-destructive/10 rounded-[2.5rem] relative">
        <ShieldX className="h-16 w-16 text-destructive" />
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-destructive rounded-full border-4 border-background animate-pulse" />
      </div>
      
      <div className="space-y-4 mb-10">
        <h2 className="text-3xl font-extrabold tracking-tight">Access Interrupted</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium leading-relaxed">
          We've encountered a secure synchronization boundary. This usually happens if your session has expired or permissions have shifted.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          onClick={() => reset()} 
          className="rounded-[2rem] h-16 font-bold text-xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <RefreshCcw className="h-6 w-6 mr-3" />
          Restore Session
        </Button>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="rounded-[2rem] h-16 font-bold text-xl border-2 active:scale-95 transition-all bg-card"
        >
          <LogOut className="h-6 w-6 mr-3" />
          Sign Out
        </Button>
      </div>
      
      <footer className="mt-12">
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em] opacity-30">
          Smart Dentist Clinic AI
        </p>
      </footer>
    </div>
  );
}
