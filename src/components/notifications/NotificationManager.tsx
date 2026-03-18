
"use client";

import { useEffect } from "react";
import { useFirebase } from "@/firebase/provider";
import { requestNotificationToken } from "@/firebase/messaging";
import { logger } from "@/lib/logger";

export function NotificationManager() {
  const { messaging } = useFirebase();

  useEffect(() => {
    if (!messaging) return;

    const requestToken = async () => {
      try {
        const token = await requestNotificationToken(messaging);
        if (token) {
          logger.info("Notification Token", token);
        } else {
          logger.info("No notification token available.");
        }
      } catch (error) {
        logger.error("Error requesting notification token:", error);
      }
    };

    requestToken();
  }, [messaging]);

  return null;
}
