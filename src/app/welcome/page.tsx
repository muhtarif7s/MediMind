
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMediMind } from '@/lib/store';
import { WelcomeView } from '@/components/welcome/WelcomeView';
import { Loader2 } from 'lucide-react';

/**
 * Dedicated Welcome Page.
 * Can be accessed directly, but typically redirected from the root if unauthenticated.
 */
export default function WelcomePage() {
  const { user, isUserLoading } = useMediMind();
  const router = useRouter();

  // Redirect to dashboard if user is already logged in and verified
  useEffect(() => {
    if (!isUserLoading && user) {
      if (user.emailVerified) {
        router.push('/');
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <WelcomeView />;
}
