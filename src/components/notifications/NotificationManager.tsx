"use client";

import { useEffect } from "react";
import { useFirebase } from "@/firebase/provider";
import { requestNotificationToken } from "@/firebase/messaging";
import { logger } from "@/lib/logger";
import { useClinic } from "@/lib/store";

/**
 * Handles initialization of FCM and synchronization of device tokens.
 */
export function NotificationManager() {
  const { messaging } = useFirebase();
  const { saveFcmToken, user, isLoaded } = useClinic();

  useEffect(() => {
    // Only attempt token registration if user is logged in and messaging is available
    if (!messaging || !user || !isLoaded) return;

    const syncToken = async () => {
      try {
        const token = await requestNotificationToken(messaging);
        if (token) {
          saveFcmToken(token);
          logger.info("Notification Manager", "FCM Token synchronized with profile");
        }
      } catch (error) {
        logger.error("Notification Manager", "Failed to sync FCM token", error);
      }
    };

    // Small delay to ensure database operations are ready
    const timeout = setTimeout(syncToken, 2000);
    return () => clearTimeout(timeout);
  }, [messaging, user, isLoaded, saveFcmToken]);

  return null;
}