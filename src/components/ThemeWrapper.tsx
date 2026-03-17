
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
      
      // Apply theme to the root html element
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Update meta theme color for mobile status bars
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#0ea5e9');
      }
    }
  }, [isLoaded, profile?.theme]);

  return null;
}
