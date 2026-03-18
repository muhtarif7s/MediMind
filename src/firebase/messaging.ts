
'use client';

import { Messaging, getToken, onMessage } from 'firebase/messaging';
import { logger } from '@/lib/logger';

/**
 * Requests notification permission and retrieves the FCM token.
 */
export async function requestNotificationToken(messaging: Messaging | null) {
  if (!messaging || typeof window === 'undefined') return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'BM-YOUR-VAPID-KEY-HERE' // Replace with your actual VAPID key from Firebase Console
      });
      if (token) {
        logger.info('Messaging', 'FCM Token generated', { token });
        return token;
      } else {
        logger.warn('Messaging', 'No registration token available. Request permission to generate one.');
      }
    }
  } catch (err) {
    logger.error('Messaging', 'An error occurred while retrieving token', err);
  }
  return null;
}

/**
 * Sets up the foreground message listener.
 */
export function setupForegroundListener(messaging: Messaging | null) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    logger.info('Messaging', 'Foreground message received', payload);
    // You can trigger a local toast here if needed
  });
}
