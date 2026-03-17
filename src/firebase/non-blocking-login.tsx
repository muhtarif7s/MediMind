'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, callbacks?: { onSuccess?: (user: any) => void; onError?: (err: any) => void }): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      sendEmailVerification(userCredential.user);
      if (callbacks?.onSuccess) callbacks.onSuccess(userCredential.user);
    })
    .catch((error) => {
      if (callbacks?.onError) callbacks.onError(error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, callbacks?: { onSuccess?: (user: any) => void; onError?: (err: any) => void }): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
      if (callbacks?.onSuccess) callbacks.onSuccess(userCredential.user);
    })
    .catch((error) => {
      if (callbacks?.onError) callbacks.onError(error);
    });
}

/** Sends verification email to current user. */
export function sendVerificationEmail(user: any): void {
  if (user) sendEmailVerification(user);
}

/** Setup Recaptcha for Phone Auth */
export function setupRecaptcha(authInstance: Auth, elementId: string) {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(authInstance, elementId, {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
  }
  return (window as any).recaptchaVerifier;
}

/** Initiate Phone Auth OTP */
export async function initiatePhoneSignIn(authInstance: Auth, phoneNumber: string, appVerifier: any): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(authInstance, phoneNumber, appVerifier);
}
