"use client";

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useMediMind } from '@/lib/store';
import { useEffect, useState } from 'react';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { usePathname } from 'next/navigation';

function AppWrapper({ children }: { children: React.ReactNode }) {
  const { profile, isLoaded } = useMediMind();
  const [isRTL, setIsRTL] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === '/login';

  useEffect(() => {
    if (isLoaded) {
      const rtl = profile.language === 'ar';
      setIsRTL(rtl);
      document.documentElement.dir = rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = profile.language;
    }
  }, [profile.language, isLoaded]);

  return (
    <main 
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="max-w-md mx-auto relative bg-background min-h-screen flex flex-col border-x shadow-2xl"
    >
      <div className="flex-1 flex flex-col relative">
        {children}
      </div>
      {!isAuthPage && <NotificationManager />}
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen overflow-x-hidden selection:bg-primary/30">
        <FirebaseClientProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}