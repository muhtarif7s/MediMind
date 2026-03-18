'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, enableIndexedDbPersistence, getDocs, query, limit, startAfter, collection, doc } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getMessaging, Messaging, isSupported as isMessagingSupported } from 'firebase/messaging';

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  analytics: Analytics | null;
  messaging: Messaging | null;
}

/**
 * Initializes Firebase services with offline persistence and production monitoring.
 */
export function initializeFirebase(): FirebaseServices {
  let app: FirebaseApp;
  let db: Firestore;
  let auth: Auth;
  let analytics: Analytics | null = null;
  let messaging: Messaging | null = null;

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Enable offline persistence for the browser
    if (typeof window !== 'undefined') {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Persistence failed: Browser not supported');
        }
      });

      // Initialize Analytics
      isAnalyticsSupported().then(supported => {
        if (supported) analytics = getAnalytics(app);
      });

      // Initialize Messaging
      isMessagingSupported().then(supported => {
        if (supported) messaging = getMessaging(app);
      });
    }

    auth = getAuth(app);
  } else {
    app = getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  }

  return {
    firebaseApp: app,
    auth,
    firestore: db,
    analytics,
    messaging
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
