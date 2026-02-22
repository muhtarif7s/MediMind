
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { AlertCircle, LogOut, RefreshCcw } from 'lucide-react';

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
    // Log the error for debugging
    console.error('App Error:', error);
  }, [error]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (e) {
      console.error('Logout failed', e);
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-background">
      <div className="mb-6 p-4 bg-destructive/10 rounded-full">
        <AlertCircle className="h-12 w-12 text-destructive" />
      </div>
      
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Sync Issue Detected</h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          We encountered a permission error while syncing your data. This often happens if your session has expired or your account needs re-authentication.
        </p>
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button 
          onClick={() => reset()} 
          className="rounded-2xl h-14 font-bold text-lg shadow-lg active:scale-95 transition-transform"
        >
          <RefreshCcw className="h-5 w-5 mr-2" />
          Try Again
        </Button>
        <Button 
          variant="outline" 
          onClick={handleLogout} 
          className="rounded-2xl h-14 font-bold text-lg border-2 active:scale-95 transition-transform"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Go to Login
        </Button>
      </div>
      
      <p className="mt-8 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
        MediMind Health Assistant
      </p>
    </div>
  );
}
