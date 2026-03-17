"use client";

import { useEffect } from 'react';
import { useClinic } from '@/lib/store';

/**
 * A global listener that synchronizes the document theme with the user's profile preference.
 */
export function ThemeWrapper() {
  const { profile, isLoaded } = useClinic();

  useEffect(() => {
    if (isLoaded && profile?.theme) {
      const isDark = profile.theme === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      
      // Update meta theme color for mobile status bars
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#0ea5e9');
      }
    }
  }, [isLoaded, profile?.theme]);

  return null;
}
