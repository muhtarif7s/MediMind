
"use client";

import { useEffect } from 'react';
import { useClinic } from '@/lib/store';

/**
 * A global listener that synchronizes the document theme, language, and direction
 * with the user's profile preference.
 */
export function ThemeWrapper() {
  const { profile, isLoaded } = useClinic();

  useEffect(() => {
    if (isLoaded && profile) {
      // 1. Theme Synchronization
      const isDark = profile.theme === 'dark';
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

      // 2. Language and Direction Synchronization
      const lang = profile.language || 'ar';
      const dir = lang === 'ar' ? 'rtl' : 'ltr';
      
      document.documentElement.lang = lang;
      document.documentElement.dir = dir;
    }
  }, [isLoaded, profile]);

  return null;
}
