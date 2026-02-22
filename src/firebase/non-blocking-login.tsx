
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Interface for auth operation callbacks to provide feedback to the UI.
 */
interface AuthCallbacks {
  onError?: (error: any) => void;
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, callbacks?: AuthCallbacks): void {
  signInAnonymously(authInstance).catch((error) => {
    callbacks?.onError?.(error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callbacks?: AuthCallbacks): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    callbacks?.onError?.(error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callbacks?: AuthCallbacks): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    callbacks?.onError?.(error);
  });
}
