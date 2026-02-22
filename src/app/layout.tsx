
"use client";

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useMediMind } from '@/lib/store';
import { useEffect, useState } from 'react';

// Note: Metadata and Viewport are handled separately in Next.js 15 for Client Components
// but since this is a root layout, we'll keep the visual structure here.

function AppWrapper({ children }: { children: React.ReactNode }) {
  const { profile, isLoaded } = useMediMind();
  const [isRTL, setIsRTL] = useState(false);

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
      className="max-w-md mx-auto relative bg-background h-full shadow-xl overflow-hidden flex flex-col border-x"
    >
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </main>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background h-full overflow-hidden">
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
