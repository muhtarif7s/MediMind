'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { AppError, FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { AlertCircle, WifiOff, ShieldAlert } from 'lucide-react';
import React from 'react';

/**
 * Centrally manages all application errors. 
 * Categorizes errors and decides whether to show a toast or trigger a hard crash recovery.
 */
export function GlobalErrorListener() {
  const { toast } = useToast();
  const [fatalError, setFatalError] = useState<AppError | null>(null);

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      logger.error('Security', error.message, error.request);
      setFatalError(error); // Critical sync issue usually requires a reload/re-login
    };

    const handleAppError = (error: AppError) => {
      logger.error(error.category, error.message);
      
      // Categorize: Network issues are toasts, internal crashes are fatal
      if (error.code.startsWith('network/')) {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: error.message,
          action: (
            <div className="p-2 bg-white/20 rounded-lg">
              <WifiOff className="h-4 w-4" />
            </div>
          ),
        });
      } else if (error.code.startsWith('auth/')) {
        toast({
          variant: "destructive",
          title: "Session Issue",
          description: error.message,
          action: <ShieldAlert className="h-4 w-4" />,
        });
      } else {
        // Unexpected runtime error -> show toast but don't crash unless critical
        toast({
          variant: "destructive",
          title: "Application Error",
          description: "Something went wrong. We've logged the issue.",
          action: <AlertCircle className="h-4 w-4" />,
        });
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    errorEmitter.on('app-error', handleAppError);
    errorEmitter.on('network-error', handleAppError);
    errorEmitter.on('auth-error', handleAppError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
      errorEmitter.off('app-error', handleAppError);
      errorEmitter.off('network-error', handleAppError);
      errorEmitter.off('auth-error', handleAppError);
    };
  }, [toast]);

  // If a fatal error is detected, we throw it to the Next.js Error Boundary
  if (fatalError) {
    throw fatalError;
  }

  return null;
}
