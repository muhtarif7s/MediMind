
'use client';

import { Messaging, getToken, onMessage } from 'firebase/messaging';
import { logger } from '@/lib/logger';

/**
 * Requests notification permission and retrieves the FCM token.
 */
export async function requestNotificationToken(messaging: Messaging | null) {
  if (!messaging || typeof window === 'undefined') return null;

  try {
    // Standard web notification permission request
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        // This is a placeholder. In a production environment, you would 
        // generate a real VAPID key in the Firebase Console.
        vapidKey: 'BM-PLACEHOLDER-VAPID-KEY-BAM-BOO'
      });
      
      if (token) {
        logger.info('Messaging', 'FCM Token generated', { token });
        return token;
      } else {
        logger.warn('Messaging', 'No registration token available. Request permission to generate one.');
      }
    } else {
      logger.warn('Messaging', 'Notification permission denied by user.');
    }
  } catch (err) {
    logger.error('Messaging', 'An error occurred while retrieving token', err);
  }
  return null;
}

/**
 * Sets up the foreground message listener.
 * This handles notifications when the app is currently in view.
 */
export function setupForegroundListener(messaging: Messaging | null) {
  if (!messaging) return;

  return onMessage(messaging, (payload) => {
    logger.info('Messaging', 'Foreground message received', payload);
    
    // In production, you might want to show a custom in-app toast here
    if ('Notification' in window && Notification.permission === 'granted') {
      const { title, body } = payload.notification || {};
      if (title && body) {
        new Notification(title, {
          body,
          icon: '/med-icon.png', // Assuming icon exists or using picsum
        });
      }
    }
  });
}
