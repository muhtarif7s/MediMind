
import './globals.css';
import { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { NotificationManager } from '@/components/notifications/NotificationManager';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'طبيب الأسنان الذكي',
  description: 'نظام إدارة عيادات الأسنان الذكي المتكامل',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="h-full scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#08668d" />
      </head>
      <body className="font-arabic antialiased bg-background text-foreground min-h-screen">
        <FirebaseClientProvider>
          <ThemeWrapper />
          <NotificationManager />
          <FirebaseErrorListener />
          <div className="max-w-md mx-auto relative bg-background min-h-screen flex flex-col border-x shadow-xl pb-safe-area-inset-bottom">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
